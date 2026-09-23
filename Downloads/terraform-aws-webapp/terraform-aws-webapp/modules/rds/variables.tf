variable "project_name" {
  type = string
}

variable "db_engine" {
  type = string
}

variable "db_instance_class" {
  type = string
}

variable "db_name" {
  type = string
}

variable "db_username" {
  type      = string
  sensitive = true
}

variable "db_port" {
  type = number
}

variable "allocated_storage" {
  type = number
}

variable "multi_az" {
  type = bool
}

variable "backup_retention_days" {
  type = number
}

variable "database_subnet_ids" {
  type = list(string)
}

variable "db_sg_id" {
  type = string
}

variable "deletion_protection" {
  type    = bool
  default = false
}
