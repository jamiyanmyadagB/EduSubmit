terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.20"
    }
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "EduSubmit"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# VPC Configuration
resource "aws_vpc" "edusubmit_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.environment}-edusubmit-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "edusubmit_igw" {
  vpc_id = aws_vpc.edusubmit_vpc.id

  tags = {
    Name = "${var.environment}-edusubmit-igw"
  }
}

# Public Subnets
resource "aws_subnet" "public_subnets" {
  count = length(var.public_subnet_cidrs)

  vpc_id                  = aws_vpc.edusubmit_vpc.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name                                            = "${var.environment}-public-subnet-${count.index + 1}"
    "kubernetes.io/cluster/${var.cluster_name}"         = "shared"
    "kubernetes.io/role/elb"                         = "1"
  }
}

# Private Subnets
resource "aws_subnet" "private_subnets" {
  count = length(var.private_subnet_cidrs)

  vpc_id            = aws_vpc.edusubmit_vpc.id
  cidr_block         = var.private_subnet_cidrs[count.index]
  availability_zone  = var.availability_zones[count.index]

  tags = {
    Name                                            = "${var.environment}-private-subnet-${count.index + 1}"
    "kubernetes.io/cluster/${var.cluster_name}"         = "shared"
    "kubernetes.io/role/internal-elb"                  = "1"
  }
}

# Route Tables
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.edusubmit_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.edusubmit_igw.id
  }

  tags = {
    Name = "${var.environment}-public-rt"
  }
}

resource "aws_route_table_association" "public_rta" {
  count          = length(var.public_subnet_cidrs)
  subnet_id      = aws_subnet.public_subnets[count.index].id
  route_table_id = aws_route_table.public_rt.id
}

# EKS Cluster Role
resource "aws_iam_role" "eks_cluster_role" {
  name = "${var.cluster_name}-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.environment}-eks-cluster-role"
  }
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster_role.name
}

# EKS Node Group Role
resource "aws_iam_role" "eks_node_role" {
  name = "${var.cluster_name}-node-role"

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

  tags = {
    Name = "${var.environment}-eks-node-role"
  }
}

resource "aws_iam_role_policy_attachment" "eks_worker_node_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.eks_node_role.name
}

resource "aws_iam_role_policy_attachment" "eks_cni_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.eks_node_role.name
}

resource "aws_iam_role_policy_attachment" "ecr_readonly_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.eks_node_role.name
}

# EKS Cluster
resource "aws_eks_cluster" "edusubmit_cluster" {
  name     = var.cluster_name
  role_arn = aws_iam_role.eks_cluster_role.arn
  version  = var.kubernetes_version

  vpc_config {
    subnet_ids = concat(
      aws_subnet.public_subnets[*].id,
      aws_subnet.private_subnets[*].id
    )
    endpoint_private_access = true
    endpoint_public_access  = true
    public_access_cidrs   = var.cluster_access_cidrs
  }

  enabled_cluster_log_types = [
    "api",
    "audit",
    "authenticator",
    "controllerManager",
    "scheduler"
  ]

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy
  ]

  tags = {
    Name = "${var.environment}-edusubmit-cluster"
  }
}

# EKS Node Group
resource "aws_eks_node_group" "edusubmit_nodes" {
  cluster_name    = aws_eks_cluster.edusubmit_cluster.name
  node_group_name = "${var.cluster_name}-nodes"
  node_role_arn   = aws_iam_role.eks_node_role.arn
  subnet_ids      = aws_subnet.private_subnets[*].id
  version         = var.kubernetes_version

  scaling_config {
    desired_size = var.desired_nodes
    max_size     = var.max_nodes
    min_size     = var.min_nodes
  }

  instance_types = var.instance_types

  remote_access {
    ec2_ssh_key               = var.ssh_key_name
    source_security_group_ids = [aws_security_group.eks_nodes.id]
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.ecr_readonly_policy
  ]

  tags = {
    Name = "${var.environment}-edusubmit-nodes"
  }
}

# Security Group for EKS Nodes
resource "aws_security_group" "eks_nodes" {
  name        = "${var.cluster_name}-nodes-sg"
  description = "Security group for EKS nodes"
  vpc_id      = aws_vpc.edusubmit_vpc.id

  # Allow all traffic from within the cluster
  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    self        = true
    description = "Allow all traffic from within the cluster"
  }

  # Allow SSH access
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.ssh_access_cidrs
    description = "Allow SSH access"
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name = "${var.environment}-eks-nodes-sg"
  }
}

# Kubernetes Provider Configuration
data "aws_eks_cluster_auth" "edusubmit_auth" {
  name = aws_eks_cluster.edusubmit_cluster.name
}

provider "kubernetes" {
  host                   = data.aws_eks_cluster_auth.edusubmit_auth.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster_auth.edusubmit_auth.certificate_authority_data)
  token                  = data.aws_eks_cluster_auth.edusubmit_auth.token
}

# Outputs
output "cluster_name" {
  description = "EKS cluster name"
  value       = aws_eks_cluster.edusubmit_cluster.name
}

output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = aws_eks_cluster.edusubmit_cluster.endpoint
}

output "cluster_certificate_authority_data" {
  description = "EKS cluster certificate authority data"
  value       = aws_eks_cluster.edusubmit_cluster.certificate_authority_data
}

output "node_group_role_arn" {
  description = "ARN of the EKS node group role"
  value       = aws_iam_role.eks_node_role.arn
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.edusubmit_vpc.id
}

output "subnet_ids" {
  description = "List of subnet IDs"
  value       = concat(aws_subnet.public_subnets[*].id, aws_subnet.private_subnets[*].id)
}
