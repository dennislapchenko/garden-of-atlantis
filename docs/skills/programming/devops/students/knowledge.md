---
tags:
  - Skill
  - Programming
  - Devops
---

# Knowledge

This guide introduces key DevOps concepts, focusing on infrastructure as code (IaC) using Terraform, networking with Virtual Private Clouds (VPCs), and storage with AWS S3. Expanding in the future as people whom I help request more :)

## Terraform Overview

Terraform is an open-source tool for creating and managing resources through any API. It enables infrastructure as code, allowing engineers to define, provision, and manage cloud resources declaratively.

### Providers

Providers are plugins that Terraform uses to interact with specific APIs or services (e.g., AWS, Azure, Google Cloud). Each provider wraps the resources of a service into Terraform-compatible resources that engineers can manage.

```terraform
provider "aws" {
  region = "us-east-1"
}
```

### Modules

A module is a collection of related resources, enabling code reuse and modularity. Modules can be custom-written or sourced from public repositories, such as the Terraform Registry. Public modules often accelerate development and serve as examples of best practices.

### Variables

Modules support variables for flexible configuration. Variables can have default values, which are often sufficient, but users can override them as needed.

```terraform
variable "instance_type" {
  type    = string
  default = "t2.micro"
}
```

### Outputs

Outputs are values exported from a module, such as a resource's public IP, that can be used by other modules or for informational purposes.

```terraform
output "instance_public_ip" {
  value = aws_instance.example.public_ip
}
```

### Data Blocks

Data blocks allow Terraform to read existing resources without managing their lifecycle (i.e., only "Read" operations, unlike resources that support full CRUD—Create, Read, Update, Delete). Data blocks are useful for referencing existing infrastructure in your configuration.

```terraform
data "aws_ami" "example" {
  most_recent = true
  filter {
    name   = "name"
    values = ["amazon-linux-*"]
  }
}

resource "aws_instance" "example" {
  ami           = data.aws_ami.example.id
  instance_type = var.instance_type
}
```

### Core Terraform Commands

- **init**: Downloads provider binaries and verifies the backend configuration (where the state file is stored).
- **plan**: Previews changes to infrastructure.
- **apply**: Applies changes to create or update resources.
- **destroy**: Deletes managed resources.

```bash
terraform init
terraform plan
terraform apply
terraform destroy
```

## Virtual Private Cloud (VPC)

A Virtual Private Cloud (VPC) is a private network within a cloud provider, such as AWS, used to manage machines securely over private pathways. Private networks reduce costs (no public internet traffic fees) and enhance security by minimizing exposure to external threats.

### IP Address Allocation

When creating a VPC, you assign a CIDR block—a range of IP addresses—using CIDR notation (e.g., `10.0.0.0/20`). These IPs can be assigned to machines automatically or manually. For example:

- `10.0.0.0/32`: 1 IP address
- `10.0.0.0/22`: 4,094 IP addresses

### Private IPv4 CIDR Blocks

Private IPv4 CIDR blocks, defined by RFC 1918, are reserved for internal networks and are not routable on the public internet. The three standard private CIDR blocks are:

| CIDR Block       | Range                           | Total IPs  | Use Case                               |
| ---------------- | ------------------------------- | ---------- | -------------------------------------- |
| `10.0.0.0/8`     | `10.0.0.0 - 10.255.255.255`     | 16,777,216 | Large enterprise networks              |
| `172.16.0.0/12`  | `172.16.0.0 - 172.31.255.255`   | 1,048,576  | Medium-sized networks, cloud routing   |
| `192.168.0.0/16` | `192.168.0.0 - 192.168.255.255` | 65,536     | Small to medium networks, home routers |

### Calculating CIDR Blocks

Tools like `ipcalc` simplify CIDR block calculations. For example, running `ipcalc 10.0.0.0/20` provides:

- **Network**: `10.0.0.0/20`
- **Host Range**: `10.0.0.1 - 10.0.15.254`
- **Total IPs**: 4,094
- **Broadcast**: `10.0.15.255`

```
Address:   10.0.0.0
Netmask:   255.255.240.0 = 20
Wildcard:  0.0.15.255
Network:   10.0.0.0/20
HostMin:   10.0.0.1
HostMax:   10.0.15.254
Broadcast: 10.0.15.255
Hosts/Net: 4094
```

## AWS S3 Buckets

AWS S3 (Simple Storage Service) is a scalable object storage service, often likened to a "cloud Google Drive." Files are stored in **buckets**, which support CRUD operations (Create, Read, Update, Delete).

### Creating an S3 Bucket

Buckets can be created using Terraform or the AWS CLI.

```terraform
resource "aws_s3_bucket" "my_bucket" {
  bucket = "my-test-bucket"
}
```

Alternatively, using the AWS CLI:

```bash
aws s3 mb s3://my-test-bucket
aws s3 cp ~/Downloads/image.png s3://my-test-bucket/
aws s3 cp s3://my-test-bucket/image.png ~/Downloads/
```

### Key Features of S3

- **Unlimited Storage**: Buckets have no size limit, though free tier usage has restrictions, and costs are incurred per GB stored or downloaded.
- **Access Control**: Buckets can be private (secure storage) or public (e.g., hosting website images or static HTML sites).
- **Compatibility**: S3 is a widely adopted standard, with many tools and services implementing S3-compatible APIs, enabling local testing or alternative cloud integrations.

### Use Case Example

A public S3 bucket can host static website content (e.g., HTML, CSS, images). By configuring DNS to point to the bucket, you can serve a fully functional static website.

## Conclusion

Terraform, VPCs, and S3 form the backbone of many DevOps workflows. Terraform simplifies infrastructure management through code, VPCs provide secure networking, and S3 offers flexible, scalable storage. Experiment with these tools in a free-tier AWS account to gain hands-on experience and explore their capabilities further.
