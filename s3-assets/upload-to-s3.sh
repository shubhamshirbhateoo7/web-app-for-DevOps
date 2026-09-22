#!/bin/bash
# Upload sample assets to your S3 static-assets bucket.
# Run this once after terraform apply.
#
# Usage: ./upload-to-s3.sh <bucket-name>

BUCKET=${1:?"Usage: $0 <bucket-name>"}

echo "Uploading product placeholder images to s3://$BUCKET/products/ ..."

for file in images/*.svg; do
  filename=$(basename "$file")
  aws s3 cp "$file" "s3://$BUCKET/products/$filename" \
    --content-type "image/svg+xml" \
    --cache-control "max-age=31536000"
  echo "  Uploaded: $filename"
done

echo ""
echo "Done. Files are at: https://$BUCKET.s3.amazonaws.com/products/"
