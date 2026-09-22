variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Short name used to prefix/tag resources"
  type        = string
  default     = "scalable-webapp"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "AZs to spread subnets across (at least 2 for HA)"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets (one per AZ)"
  type        = list(string)
  default     = ["10.0.0.0/24", "10.0.1.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private app subnets (one per AZ)"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "database_subnet_cidrs" {
  description = "CIDR blocks for private database subnets (one per AZ)"
  type        = list(string)
  default     = ["10.0.20.0/24", "10.0.21.0/24"]
}

variable "single_nat_gateway" {
  description = "Use one shared NAT Gateway instead of one per AZ (cheaper, less HA). Set false for production."
  type        = bool
  default     = true
}

variable "instance_type" {
  description = "EC2 instance type for the app tier"
  type        = string
  default     = "t2.micro" # free tier eligible (750 hrs/month)
}

variable "asg_min_size" {
  type    = number
  default = 2
}

variable "asg_max_size" {
  type    = number
  default = 6
}

variable "asg_desired_capacity" {
  type    = number
  default = 2
}

variable "key_pair_name" {
  description = "Existing EC2 key pair name for SSH/SSM debugging (optional, leave null to disable key-based SSH)"
  type        = string
  default     = null
}

variable "db_engine" {
  description = "RDS engine: mysql or postgres"
  type        = string
  default     = "postgres"
}

variable "db_instance_class" {
  type    = string
  default = "db.t3.micro" # free tier eligible — t2.micro does not support Postgres 16
}

variable "db_name" {
  type    = string
  default = "appdb"
}

variable "db_username" {
  type      = string
  default   = "appadmin"
  sensitive = true
}

variable "db_multi_az" {
  description = "Enable Multi-AZ for RDS (recommended true for prod HA)"
  type        = bool
  default     = true
}

variable "db_allocated_storage" {
  type    = number
  default = 20
}

variable "db_backup_retention_days" {
  type    = number
  default = 7
}

variable "alarm_notification_email" {
  description = "Email address to receive CloudWatch alarm notifications (SNS). Leave empty to skip subscription."
  type        = string
  default     = ""
}

variable "enable_waf" {
  description = "Attach AWS WAF Web ACL to the ALB"
  type        = bool
  default     = true
}
