# ═══════════════════════════════════════════
# EduSubmit AWS Infrastructure (Terraform)
# Creates: VPC, Subnets, EC2, S3, Security Groups
# ═══════════════════════════════════════════

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ─── VPC ───
resource "aws_vpc" "edusubmit_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "edusubmit-vpc"
  }
}

# ─── Internet Gateway ───
resource "aws_internet_gateway" "edusubmit_igw" {
  vpc_id = aws_vpc.edusubmit_vpc.id

  tags = {
    Name = "edusubmit-igw"
  }
}

# ─── Public Subnet ───
resource "aws_subnet" "edusubmit_public" {
  vpc_id                  = aws_vpc.edusubmit_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "edusubmit-public-subnet"
  }
}

# ─── Route Table ───
resource "aws_route_table" "edusubmit_public_rt" {
  vpc_id = aws_vpc.edusubmit_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.edusubmit_igw.id
  }

  tags = {
    Name = "edusubmit-public-rt"
  }
}

resource "aws_route_table_association" "edusubmit_public_rta" {
  subnet_id      = aws_subnet.edusubmit_public.id
  route_table_id = aws_route_table.edusubmit_public_rt.id
}

# ─── Security Group ───
resource "aws_security_group" "edusubmit_sg" {
  name        = "edusubmit-sg"
  description = "EduSubmit security group"
  vpc_id      = aws_vpc.edusubmit_vpc.id

  # SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # EduSubmit app
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # API Gateway
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Grafana
  ingress {
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "edusubmit-sg"
  }
}

# ─── EC2 Instance ───
resource "aws_instance" "edusubmit_server" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.edusubmit_public.id
  vpc_security_group_ids = [aws_security_group.edusubmit_sg.id]
  key_name               = var.key_name

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
  }

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install -y docker
              service docker start
              usermod -aG docker ec2-user
              curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
              chmod +x /usr/local/bin/docker-compose
              mkdir -p /opt/edusubmit
              cd /opt/edusubmit
              # Clone and start application
              # git clone https://github.com/jamiyanmyadagB/EduSubmit.git .
              # docker-compose up -d
              EOF

  tags = {
    Name = "edusubmit-server"
  }
}

# ─── S3 Bucket for File Storage ───
resource "aws_s3_bucket" "edusubmit_storage" {
  bucket = "edusubmit-file-storage-${random_string.suffix.result}"

  tags = {
    Name = "edusubmit-storage"
  }
}

resource "aws_s3_bucket_versioning" "edusubmit_storage_versioning" {
  bucket = aws_s3_bucket.edusubmit_storage.id
  versioning_configuration {
    status = "Enabled"
  }
}

# ─── Random Suffix ───
resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

# ─── AMI Data ───
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

# ─── IAM Role ───
resource "aws_iam_role" "edusubmit_role" {
  name = "edusubmit-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "edusubmit_s3" {
  role       = aws_iam_role.edusubmit_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

resource "aws_iam_instance_profile" "edusubmit_profile" {
  name = "edusubmit-profile"
  role = aws_iam_role.edusubmit_role.name
}
