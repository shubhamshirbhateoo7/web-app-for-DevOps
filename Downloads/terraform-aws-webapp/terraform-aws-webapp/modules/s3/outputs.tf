output "static_assets_bucket_id"  { value = aws_s3_bucket.static_assets.id }
output "static_assets_bucket_arn" { value = aws_s3_bucket.static_assets.arn }
output "logs_bucket_id"           { value = aws_s3_bucket.logs.id }
output "cloudtrail_bucket_id"     { value = aws_s3_bucket.cloudtrail.id }
