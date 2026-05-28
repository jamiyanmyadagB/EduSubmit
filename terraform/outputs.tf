output "ec2_public_ip" {
  description = "Public IP of the EduSubmit EC2 instance"
  value       = aws_instance.edusubmit_server.public_ip
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket for file storage"
  value       = aws_s3_bucket.edusubmit_storage.bucket
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.edusubmit_vpc.id
}

output "security_group_id" {
  description = "Security Group ID"
  value       = aws_security_group.edusubmit_sg.id
}
