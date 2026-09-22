variable "project_name" {
  type = string
}

variable "instance_type" {
  type = string
}

variable "key_pair_name" {
  type    = string
  default = null
}

variable "instance_profile_name" {
  type = string
}

variable "app_sg_id" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "target_group_arn" {
  type = string
}

variable "asg_min_size" {
  type = number
}

variable "asg_max_size" {
  type = number
}

variable "asg_desired_capacity" {
  type = number
}

variable "db_secret_arn" {
  type        = string
  description = "ARN of the Secrets Manager secret containing DB connection info"
}

variable "aws_region" {
  type        = string
  description = "AWS region — used to call Secrets Manager at boot"
}
