variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (e.g., staging, production)"
  type        = string
  default     = "staging"
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "edusubmit-eks-cluster"
}

variable "kubernetes_version" {
  description = "Kubernetes version for EKS cluster"
  type        = string
  default     = "1.28"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
}

variable "availability_zones" {
  description = "Availability zones for subnets"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "cluster_access_cidrs" {
  description = "CIDR blocks allowed to access EKS cluster endpoint"
  type        = list(string)
  default     = ["49.156.76.148/32"]  # Your actual IP
}

variable "ssh_access_cidrs" {
  description = "CIDR blocks allowed SSH access to nodes"
  type        = list(string)
  default     = ["49.156.76.148/32"]  # Your actual IP
}

variable "ssh_key_name" {
  description = "SSH key name for EC2 instances"
  type        = string
  default     = "edusubmit-eks-key"
}

variable "instance_types" {
  description = "EC2 instance types for EKS nodes"
  type        = list(string)
  default     = ["t3.medium", "t3.large"]
}

variable "min_nodes" {
  description = "Minimum number of nodes in node group"
  type        = number
  default     = 2
}

variable "desired_nodes" {
  description = "Desired number of nodes in node group"
  type        = number
  default     = 3
}

variable "max_nodes" {
  description = "Maximum number of nodes in node group"
  type        = number
  default     = 6
}
