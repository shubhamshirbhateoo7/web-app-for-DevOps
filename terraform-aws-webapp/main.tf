locals {
  db_port = var.db_engine == "mysql" ? 3306 : 5432
}

module "vpc" {
  source = "./modules/vpc"

  project_name           = var.project_name
  vpc_cidr                = var.vpc_cidr
  availability_zones      = var.availability_zones
  public_subnet_cidrs     = var.public_subnet_cidrs
  private_subnet_cidrs    = var.private_subnet_cidrs
  database_subnet_cidrs   = var.database_subnet_cidrs
  single_nat_gateway       = var.single_nat_gateway
}

module "security" {
  source = "./modules/security"

  project_name = var.project_name
  vpc_id       = module.vpc.vpc_id
  db_port      = local.db_port
}

module "s3" {
  source = "./modules/s3"

  project_name = var.project_name
}

module "iam" {
  source = "./modules/iam"

  project_name              = var.project_name
  static_assets_bucket_arn  = module.s3.static_assets_bucket_arn
  db_secret_arn             = module.rds.db_secret_arn
}

module "alb" {
  source = "./modules/alb"

  project_name      = var.project_name
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  alb_sg_id         = module.security.alb_sg_id
  logs_bucket_id    = module.s3.logs_bucket_id
}

module "waf" {
  source = "./modules/waf"
  count  = var.enable_waf ? 1 : 0

  project_name = var.project_name
  alb_arn      = module.alb.alb_arn
}

module "asg" {
  source = "./modules/asg"

  project_name           = var.project_name
  instance_type           = var.instance_type
  key_pair_name            = var.key_pair_name
  instance_profile_name   = module.iam.instance_profile_name
  app_sg_id                = module.security.app_sg_id
  private_subnet_ids       = module.vpc.private_subnet_ids
  target_group_arn         = module.alb.target_group_arn
  asg_min_size              = var.asg_min_size
  asg_max_size              = var.asg_max_size
  asg_desired_capacity      = var.asg_desired_capacity
  db_secret_arn             = module.rds.db_secret_arn
  aws_region                = var.aws_region
}

module "rds" {
  source = "./modules/rds"

  project_name           = var.project_name
  db_engine                = var.db_engine
  db_instance_class        = var.db_instance_class
  db_name                   = var.db_name
  db_username               = var.db_username
  db_port                    = local.db_port
  allocated_storage         = var.db_allocated_storage
  multi_az                   = var.db_multi_az
  backup_retention_days     = var.db_backup_retention_days
  database_subnet_ids       = module.vpc.database_subnet_ids
  db_sg_id                    = module.security.db_sg_id
  deletion_protection         = var.environment == "prod"
}

module "monitoring" {
  source = "./modules/monitoring"

  project_name              = var.project_name
  alarm_notification_email  = var.alarm_notification_email
  asg_name                   = module.asg.asg_name
  alb_arn_suffix             = module.alb.alb_arn_suffix
  target_group_arn_suffix    = module.alb.target_group_arn_suffix
  db_instance_id             = module.rds.db_instance_id
}

module "backup" {
  source = "./modules/backup"

  project_name           = var.project_name
  backup_retention_days   = var.db_backup_retention_days
  db_instance_arn          = module.rds.db_instance_arn
}

module "cloudtrail" {
  source = "./modules/cloudtrail"

  project_name           = var.project_name
  cloudtrail_bucket_id     = module.s3.cloudtrail_bucket_id
}

data "aws_caller_identity" "current" {}
