variable "project_name" {
  type = string
}

variable "static_assets_bucket_arn" {
  type = string
}

variable "db_secret_arn" {
  type        = string
  description = "ARN of the Secrets Manager secret containing DB connection info"
}
