terraform {
  backend "s3" {
    bucket       = "scalable-webapp-tfstate-724669215795"
    key          = "webapp/terraform.tfstate"
    region       = "us-east-1"
    use_lockfile = true  # S3 native locking — no DynamoDB needed (Terraform 1.10+)
    encrypt      = true
  }
}
