# Scalable Web App on AWS — Terraform

Provisions a 3-tier, highly available web application on AWS: ALB → Auto Scaling
Group of EC2 instances → RDS, with S3 for static assets, WAF for edge protection,
and CloudWatch/CloudTrail/AWS Backup for observability and recovery.

## Prerequisites

- Terraform >= 1.5
- AWS CLI configured with credentials that have permission to create the resources
  below (or an assumed IAM role with equivalent access)
- An AWS account/region with default VPC limits not exhausted

## Deploy

```bash
cp terraform.tfvars.example terraform.tfvars
# edit terraform.tfvars: region, sizing, alarm email, etc.

terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

First apply takes ~10-15 minutes (mostly the RDS instance and NAT Gateway).

```bash
terraform output alb_dns_name   # open this in a browser once instances pass health checks
```

## Destroy

```bash
terraform destroy
```

`deletion_protection` is on automatically when `environment = "prod"` — turn that
off first if you need to tear down a "prod" stack.

## What gets created

| Layer | Resources |
|---|---|
| Networking | VPC, 2 public + 2 private-app + 2 private-db subnets across 2 AZs, IGW, NAT Gateway(s), route tables, NACL on the DB subnets |
| Edge | Application Load Balancer, WAFv2 Web ACL (AWS managed rule groups + rate limiting) |
| Compute | Launch Template + Auto Scaling Group (EC2, private subnets), target-tracking scaling policy |
| Data | RDS (MySQL or PostgreSQL), Multi-AZ, encrypted, credentials in Secrets Manager |
| Storage | S3 static-assets bucket, S3 ALB-logs bucket, S3 CloudTrail bucket (all private, encrypted) |
| Security | 3-tier security groups (ALB → app → db, nothing skips a hop), least-privilege IAM role for EC2 (S3 + CloudWatch + SSM only) |
| Observability | CloudWatch Log Group, 5 CloudWatch Alarms → SNS → email, CloudTrail (multi-region) |
| Resilience | AWS Backup daily plan for RDS, RDS automated backups, storage autoscaling |

See `ARCHITECTURE.md` (or the accompanying Word document) for the full design
rationale — why each piece is there and how it maps to the challenge requirements.

## Notes / things to adapt before production

- The EC2 user_data installs a placeholder Apache page. Replace it with your real
  deploy step (pull a build from S3/CodeDeploy, or bake an AMI with Packer).
- HTTPS listener is commented out in `modules/alb/main.tf` — add an ACM certificate
  ARN and uncomment it once you have a domain.
- `single_nat_gateway = true` is a cost-saving default; set it `false` for
  production so each AZ has its own NAT Gateway and one AZ's outage doesn't take
  out egress for the other.
- Shield **Standard** is automatic and free on the ALB — no Terraform resource
  needed. Shield **Advanced** is a paid, account-level subscription; add it
  separately if your workload needs it.
