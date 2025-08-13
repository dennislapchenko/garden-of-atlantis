# Beginners project

## Building a Complete Infrastructure with Terraform, AWS, and Docker

This project outlines a comprehensive DevOps task to create a fully integrated system using Terraform, AWS services (VPC, EC2, S3, ECR), Docker, and Ansible. The goal is to deploy two EC2 instances in a secure VPC: one serving random text via HTTP GET requests over a private network, and the other polling this data and storing it in an S3 bucket. The infrastructure and application code are managed via GitHub repositories, with Docker images built and pushed to AWS Elastic Container Registry (ECR). Ansible automates the deployment of Docker containers on the EC2 instances.

Below is a step-by-step guide to achieving this, including Terraform configurations, Dockerfiles, GitHub Actions workflows, and Ansible roles.

## Project Overview

**Final Goal**:

- Two EC2 instances in a private VPC:
  - **Server**: Hosts a simple application that returns random text (e.g., current timestamp) via HTTP GET requests.
  - **Client**: Polls the server's private IP, retrieves the text, and stores it in an S3 bucket as a new file each time.
- Infrastructure managed with Terraform.
- Applications containerized with Docker and stored in AWS ECR.
- GitHub Actions to build and push Docker images.
- Ansible to deploy containers to EC2 instances.
- IAM roles to ensure proper permissions for EC2 instances to pull from ECR and push to S3.

## Step-by-Step Implementation

### 1. Create GitHub Repositories

Create two GitHub repositories using Terraform:

- **test-flight-infra**: Contains Terraform configurations and Ansible roles for infrastructure setup.
- **test-flight**: Contains application code, Dockerfiles, and GitHub Actions workflows for building and pushing Docker images.

```terraform
resource "github_repository" "test_flight_infra" {
  name        = "test-flight-infra"
  description = "Infrastructure for test-flight project"
  visibility  = "public"
}

resource "github_repository" "test_flight" {
  name        = "test-flight"
  description = "Application code for test-flight server and client"
  visibility  = "public"
}
```

### 2. Set Up AWS Infrastructure

#### 2.1. Create a VPC and Security Group

Create a VPC with a private subnet and a security group to restrict access:

- Allow SSH (port 22) only from your IP.
- Allow HTTP (port 80) only from the VPC's CIDR block.

```terraform
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "test-flight-vpc"
  }
}

resource "aws_subnet" "private" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
  tags = {
    Name = "test-flight-private-subnet"
  }
}

resource "aws_security_group" "test_flight_sg" {
  vpc_id = aws_vpc.main.id
  name   = "test-flight-sg"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["YOUR_PUBLIC_IP/32"] # Replace with your IP
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

#### 2.2. Launch Two EC2 Instances

Create two EC2 instances in the VPC with specific private IPs. Assign an IAM role (defined later) to allow access to ECR and S3.

```terraform
resource "aws_instance" "server" {
  ami           = "ami-0c55b159cbfafe1f0" # Replace with a valid AMI
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.private.id
  private_ip    = "10.0.1.10"
  security_groups = [aws_security_group.test_flight_sg.name]
  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name
  tags = {
    Name = "test-flight-server"
  }
}

resource "aws_instance" "client" {
  ami           = "ami-0c55b159cbfafe1f0" # Replace with a valid AMI
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.private.id
  private_ip    = "10.0.1.11"
  security_groups = [aws_security_group.test_flight_sg.name]
  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name
  tags = {
    Name = "test-flight-client"
  }
}
```

#### 2.3. Create ECR Repositories

Create two ECR repositories for the server and client Docker images.

```terraform
resource "aws_ecr_repository" "server" {
  name = "test-flight-server"
}

resource "aws_ecr_repository" "client" {
  name = "test-flight-client"
}
```

#### 2.4. Grant GitHub Repositories Push Access to ECR

Use a public Terraform module to allow GitHub Actions to push to ECR.

```terraform
module "github_ecr_push" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-github-oidc"
  version = "~> 5.0"

  github_repositories = [
    "your-org/test-flight"
  ]

  policies = {
    ecr_push = {
      actions = [
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:BatchCheckLayerAvailability",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ]
      resources = [
        aws_ecr_repository.server.arn,
        aws_ecr_repository.client.arn
      ]
    }
  }
}
```

#### 2.5. Create an S3 Bucket

Create an S3 bucket to store the client's data.

```terraform
resource "aws_s3_bucket" "test_flight_data" {
  bucket = "test-flight-data-bucket"
}
```

#### 2.6. Configure IAM for EC2 Instances

Create an IAM role and instance profile to allow EC2 instances to pull from ECR and push to S3.

```terraform
resource "aws_iam_role" "ec2_role" {
  name = "test-flight-ec2-role"

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

resource "aws_iam_role_policy" "ec2_policy" {
  name = "test-flight-ec2-policy"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
      {
        Action = [
          "s3:PutObject"
        ]
        Effect   = "Allow"
        Resource = "${aws_s3_bucket.test_flight_data.arn}/*"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "test-flight-ec2-profile"
  role = aws_iam_role.ec2_role.name
}
```

### 3. Develop the Server Application

Create a simple Python Flask application that serves random text (e.g., current timestamp) via HTTP GET.

```python
from flask import Flask
import datetime

app = Flask(__name__)

@app.route('/')
def get_random_text():
    return str(datetime.datetime.now())

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
```

#### Server Dockerfile

Create a production-ready, secure Dockerfile for the server.

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY server/src/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY server/src .

USER nobody
EXPOSE 80

CMD ["python", "main.py"]
```

### 4. Develop the Client Application

Create a Python client that polls the server and stores the response in S3.

```python
import requests
import boto3
import time
import uuid

server_url = "http://10.0.1.10"  # Server's private IP
bucket_name = "test-flight-data-bucket"
s3 = boto3.client('s3')

while True:
    try:
        response = requests.get(server_url)
        file_name = f"data/{uuid.uuid4()}.txt"
        s3.put_object(Bucket=bucket_name, Key=file_name, Body=response.text)
        print(f"Stored {file_name} in S3")
    except Exception as e:
        print(f"Error: {e}")
    time.sleep(60)  # Poll every 60 seconds
```

#### Client Dockerfile

Create a production-ready, secure Dockerfile for the client.

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY client/src/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY client/src .

USER nobody

CMD ["python", "main.py"]
```

### 5. GitHub Actions Workflow

Create a GitHub Actions workflow to build and push both Docker images to ECR.

```yaml
name: Build and Push Docker Images

on:
  push:
    branches:
      - main

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read

    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: arn:aws:iam::YOUR_AWS_ACCOUNT_ID:role/test-flight-ecr-push
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build and Push Server Image
        run: |
          docker build -t ${{ steps.login-ecr.outputs.registry }}/test-flight-server:latest ./server
          docker push ${{ steps.login-ecr.outputs.registry }}/test-flight-server:latest

      - name: Build and Push Client Image
        run: |
          docker build -t ${{ steps.login-ecr.outputs.registry }}/test-flight-client:latest ./client
          docker push ${{ steps.login-ecr.outputs.registry }}/test-flight-client:latest
```

### 6. Ansible Deployment

Create an Ansible role to install Docker, deploy the Docker images, and run them using `docker-compose`.

#### Ansible Inventory

```yaml
all:
  hosts:
    server:
      ansible_host: 10.0.1.10
      ansible_user: ec2-user
      ansible_ssh_private_key_file: /path/to/your/key.pem
    client:
      ansible_host: 10.0.1.11
      ansible_user: ec2-user
      ansible_ssh_private_key_file: /path/to/your/key.pem
```

#### Ansible Role

```yaml
- name: Install Docker
  become: true
  yum:
    name: docker
    state: present

- name: Start Docker service
  become: true
  service:
    name: docker
    state: started
    enabled: true

- name: Install Docker Compose
  become: true
  get_url:
    url: https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-linux-x86_64
    dest: /usr/local/bin/docker-compose
    mode: "0755"

- name: Copy Docker Compose file
  copy:
    src: docker-compose.yml
    dest: /home/ec2-user/docker-compose.yml

- name: Run Docker Compose
  become: true
  command: docker-compose -f /home/ec2-user/docker-compose.yml up -d
```

#### Docker Compose File

```yaml
version: "3"
services:
  app:
    image: YOUR_ECR_REGISTRY/test-flight-${{ app_type }}:latest
    ports:
      - "80:80"
    environment:
      - AWS_DEFAULT_REGION=us-east-1
```

### 7. Project Structure

The repository structure should look like this:

```
test-flight-infra
├── terraform
│   ├── aws
│   │   ├── s3
│   │   │   ├── terraform-state
│   │   │   │   └── main.tf
│   │   │   └── test-flight-data
│   │   │       └── main.tf
│   │   ├── network
│   │   │   └── vpc
│   │   │       └── main.tf
│   │   ├── security
│   │   │   └── ec2-user-key
│   │   │       └── main.tf
│   │   ├── apps
│   │   │   ├── github-workflow
│   │   │   │   └── main.tf
│   │   │   ├── server
│   │   │   │   └── main.tf
│   │   │   └── client
│   │   │       └── main.tf
│   │   └── ecr
│   │       └── main.tf
│   └── github
│       └── main.tf
└── ansible
    └── roles/tasks/inventory

test-flight
├── .github
│   └── workflows
│       └── build-and-push-images.yml
├── server
│   ├── Dockerfile
│   └── src
│       └── main.py
└── client
    ├── Dockerfile
    └── src
        └── main.py
```

## Additional Notes

- **IAM Permissions**: Ensure the EC2 instances have the necessary IAM roles to pull from ECR and write to S3, as configured above.
- **Security**: The security group restricts access to only your IP for SSH and the VPC CIDR for HTTP, ensuring a secure setup.
- **Testing**: Use an AWS free-tier account to test the setup. Replace placeholders (e.g., `YOUR_PUBLIC_IP`, `YOUR_AWS_ACCOUNT_ID`, AMI IDs) with actual values.
- **Diagram**: Before implementing, draw a diagram to visualize the components (VPC, EC2, ECR, S3, GitHub Actions, Ansible) and their interactions. This helps clarify the architecture.

## Conclusion

This project provides hands-on experience with a realistic, interconnected DevOps system. By integrating Terraform, AWS services, Docker, GitHub Actions, and Ansible, you'll gain practical skills in infrastructure as code, containerization, CI/CD, and automation. The result is a fully functional system where one EC2 instance serves random text, and another stores it in S3, all within a secure private network.
