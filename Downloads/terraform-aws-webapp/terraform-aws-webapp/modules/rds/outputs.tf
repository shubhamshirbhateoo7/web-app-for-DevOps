output "db_endpoint" {
  value = aws_db_instance.main.endpoint
}

output "db_instance_id" {
  value = aws_db_instance.main.id
}

output "db_secret_arn" {
  value = aws_secretsmanager_secret.db_password.arn
}

output "db_instance_arn" {
  value = aws_db_instance.main.arn
}
