output "alb_dns_name" {
  description = "Public URL of the application (point your DNS CNAME here)"
  value       = module.alb.alb_dns_name
}

output "vpc_id" {
  value = module.vpc.vpc_id
}

output "db_endpoint" {
  value = module.rds.db_endpoint
}

output "db_secret_arn" {
  description = "Secrets Manager ARN holding the generated DB credentials"
  value       = module.rds.db_secret_arn
}

output "static_assets_bucket" {
  value = module.s3.static_assets_bucket_id
}

output "sns_alarm_topic_arn" {
  value = module.monitoring.sns_topic_arn
}
