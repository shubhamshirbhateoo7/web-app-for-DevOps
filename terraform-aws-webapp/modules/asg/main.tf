data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

resource "aws_launch_template" "app" {
  name_prefix   = "${var.project_name}-lt-"
  image_id      = data.aws_ami.amazon_linux.id
  instance_type = var.instance_type
  key_name      = var.key_pair_name

  iam_instance_profile {
    name = var.instance_profile_name
  }

  vpc_security_group_ids = [var.app_sg_id]

  metadata_options {
    http_tokens   = "required" # enforce IMDSv2 — blocks the classic SSRF-to-credentials path
    http_endpoint = "enabled"
  }

  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size           = 30
      volume_type           = "gp2" # free tier eligible (30 GB gp2/month)
      encrypted             = true
      delete_on_termination = true
    }
  }

  user_data = base64encode(<<-EOF
#!/bin/bash
set -e

# ── System update & dependencies ──
dnf update -y
dnf install -y python3.11 python3.11-pip python3.11-devel \
    postgresql15 git rsync amazon-cloudwatch-agent gcc jq

# ── Create app user and directory ──
useradd -r -s /sbin/nologin webapp || true
mkdir -p /opt/webapp/backend
chown webapp:webapp /opt/webapp/backend

# ── Install gunicorn into system python ──
python3.11 -m pip install --upgrade pip
python3.11 -m pip install gunicorn psycopg2-binary

# ── Fetch DB credentials from Secrets Manager and write env file ──
SECRET=$(aws secretsmanager get-secret-value \
    --secret-id "${var.db_secret_arn}" \
    --region "${var.aws_region}" \
    --query SecretString \
    --output text)

DB_HOST=$(echo $SECRET     | jq -r '.host')
DB_PORT=$(echo $SECRET     | jq -r '.port')
DB_NAME=$(echo $SECRET     | jq -r '.dbname')
DB_USER=$(echo $SECRET     | jq -r '.username')
DB_PASS=$(echo $SECRET     | jq -r '.password')

cat > /opt/webapp/backend/.env << ENVFILE
SECRET_KEY=$(python3.11 -c "import secrets; print(secrets.token_urlsafe(50))")
DEBUG=False
ALLOWED_HOSTS=*
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASS
DB_HOST=$DB_HOST
DB_PORT=5432
AWS_REGION=${var.aws_region}
S3_BUCKET_NAME=${var.project_name}-static-assets-$(aws sts get-caller-identity --query Account --output text)
CORS_ALLOWED_ORIGINS=http://localhost
ENVFILE

chmod 600 /opt/webapp/backend/.env
chown webapp:webapp /opt/webapp/backend/.env

# ── Systemd service for Gunicorn ──
cat > /etc/systemd/system/gunicorn.service << 'SERVICE'
[Unit]
Description=Gunicorn Django backend
After=network.target

[Service]
User=webapp
Group=webapp
WorkingDirectory=/opt/webapp/backend
EnvironmentFile=/opt/webapp/backend/.env
ExecStart=/usr/local/bin/gunicorn core.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 60 \
    --access-logfile - \
    --error-logfile -
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable gunicorn

# ── CloudWatch agent ──
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config -m ec2 -s || true
  EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = { Name = "${var.project_name}-app" }
  }
}

resource "aws_autoscaling_group" "app" {
  name                = "${var.project_name}-asg"
  vpc_zone_identifier = var.private_subnet_ids
  target_group_arns   = [var.target_group_arn]
  health_check_type   = "ELB"
  health_check_grace_period = 60

  min_size         = var.asg_min_size
  max_size         = var.asg_max_size
  desired_capacity = var.asg_desired_capacity

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "${var.project_name}-app"
    propagate_at_launch = true
  }
}

# Scale out/in on average CPU — target tracking keeps this simple and self-tuning.
resource "aws_autoscaling_policy" "cpu_target_tracking" {
  name                   = "${var.project_name}-cpu-target-tracking"
  autoscaling_group_name = aws_autoscaling_group.app.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 60.0
  }
}
