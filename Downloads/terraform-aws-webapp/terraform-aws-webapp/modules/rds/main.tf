resource "random_password" "db_password" {
  length  = 20
  special = true
  # RDS master password can't contain '/', '@', '"', or spaces
  override_special = "!#$%^&*()-_=+[]{}<>:?"
}

# Password is stored in Secrets Manager, never in state as plain output.
resource "aws_secretsmanager_secret" "db_password" {
  name                    = "${var.project_name}/db-password"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id = aws_secretsmanager_secret.db_password.id
  secret_string = jsonencode({
    username = var.db_username
    password = random_password.db_password.result
    dbname   = var.db_name
    host     = aws_db_instance.main.address
    port     = tostring(var.db_port)
    engine   = var.db_engine
  })

  # endpoint is only known after the DB is created
  depends_on = [aws_db_instance.main]
}

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = var.database_subnet_ids

  tags = { Name = "${var.project_name}-db-subnet-group" }
}

resource "aws_db_instance" "main" {
  identifier     = "${var.project_name}-db"
  engine         = var.db_engine
  engine_version = var.db_engine == "mysql" ? "8.0" : "16"
  instance_class = var.db_instance_class

  allocated_storage     = var.allocated_storage
  max_allocated_storage  = var.allocated_storage # disabled autoscaling — fixed at 20 GB for free tier
  storage_type           = "gp2"                 # free tier covers gp2 only
  storage_encrypted      = false                 # db.t2.micro does not support encryption at rest

  db_name  = var.db_name
  username = var.db_username
  password = random_password.db_password.result
  port     = var.db_port

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.db_sg_id]
  publicly_accessible     = false

  multi_az = var.multi_az

  backup_retention_period = var.backup_retention_days
  backup_window            = "03:00-04:00"
  maintenance_window        = "mon:04:30-mon:05:30"
  copy_tags_to_snapshot      = true
  deletion_protection        = var.deletion_protection
  skip_final_snapshot        = !var.deletion_protection
  final_snapshot_identifier = var.deletion_protection ? "${var.project_name}-db-final-snapshot" : null

  enabled_cloudwatch_logs_exports = var.db_engine == "mysql" ? ["error", "general", "slowquery"] : ["postgresql", "upgrade"]

  tags = { Name = "${var.project_name}-db" }
}
