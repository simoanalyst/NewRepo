# MkulimaLink Kenya — Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Docker Deployment](#docker-deployment)
4. [AWS Deployment](#aws-deployment)
5. [Environment Variables](#environment-variables)
6. [Database Migrations](#database-migrations)
7. [SSL Configuration](#ssl-configuration)
8. [Monitoring Setup](#monitoring-setup)

---

## Prerequisites

- Node.js 18+ and npm 9+
- Docker 24+ and Docker Compose v2
- PostgreSQL 15+
- Redis 7+
- AWS CLI v2 (for AWS deployment)
- A registered M-Pesa Daraja API account (Safaricom)
- Africa's Talking account (for SMS)
- OpenWeatherMap API key

---

## Local Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/your-org/mkulima-link.git
cd mkulima-link
```

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your local values
```

**Frontend:**
```bash
cd ../frontend
npm install
cp .env.example .env.local
```

### 2. Start Local PostgreSQL and Redis

Using Docker for local databases:

```bash
docker run -d \
  --name mkulima-postgres \
  -e POSTGRES_DB=mkulima_link \
  -e POSTGRES_USER=mkulima \
  -e POSTGRES_PASSWORD=localpassword \
  -p 5432:5432 \
  postgres:15-alpine

docker run -d \
  --name mkulima-redis \
  -p 6379:6379 \
  redis:7-alpine
```

### 3. Run Database Migrations and Seed

```bash
cd backend
npx prisma migrate dev --name init
npm run prisma:seed
```

### 4. Start Dev Servers

In separate terminals:

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Backend runs on http://localhost:5000  
Frontend runs on http://localhost:3000

---

## Docker Deployment

### File Structure

The project ships a `docker-compose.yml` at the root. This orchestrates:
- `backend` — Node.js Express API
- `frontend` — Next.js app
- `nginx` — Reverse proxy / SSL termination
- `postgres` — PostgreSQL database
- `redis` — Cache and session store

### Build and Run

```bash
# Copy and configure environment files
cp backend/.env.example backend/.env
# Edit backend/.env with production values

# Build all images
docker compose build

# Start all services in detached mode
docker compose up -d

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Run migrations on first deploy
docker compose exec backend npx prisma migrate deploy

# Seed initial data
docker compose exec backend npm run prisma:seed
```

### Useful Commands

```bash
# Stop all services
docker compose down

# Stop and remove volumes (WARNING: destroys DB data)
docker compose down -v

# Rebuild a single service
docker compose build backend
docker compose up -d --no-deps backend

# Scale backend (if using a load balancer)
docker compose up -d --scale backend=3
```

---

## AWS Deployment

### Architecture Overview

```
Internet
    |
Route 53 (DNS)
    |
CloudFront (CDN + WAF)
    |
Application Load Balancer (ALB)
    |          |
 EC2 ASG    S3 (static assets / uploads)
 (Backend)
    |
RDS PostgreSQL (Multi-AZ)
    |
ElastiCache Redis (Cluster mode)
```

### Step 1 — VPC and Networking

```bash
# Create VPC with CIDR 10.0.0.0/16
aws ec2 create-vpc --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=mkulima-vpc}]'

# Create public subnets in 2 AZs (ap-south-1a, ap-south-1b)
# Create private subnets in 2 AZs for RDS and ElastiCache
# Attach Internet Gateway and configure route tables accordingly
```

### Step 2 — RDS PostgreSQL

```bash
# Create DB subnet group
aws rds create-db-subnet-group \
  --db-subnet-group-name mkulima-db-subnet \
  --db-subnet-group-description "MkulimaLink DB Subnet Group" \
  --subnet-ids subnet-private-1 subnet-private-2

# Create RDS instance (Multi-AZ for production)
aws rds create-db-instance \
  --db-instance-identifier mkulima-postgres \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.4 \
  --master-username mkulima \
  --master-user-password YOUR_SECURE_PASSWORD \
  --db-name mkulima_link \
  --allocated-storage 100 \
  --storage-type gp3 \
  --multi-az \
  --db-subnet-group-name mkulima-db-subnet \
  --vpc-security-group-ids sg-rds \
  --backup-retention-period 7 \
  --deletion-protection
```

### Step 3 — ElastiCache Redis

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id mkulima-redis \
  --cache-node-type cache.t3.small \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-nodes 1 \
  --cache-subnet-group-name mkulima-cache-subnet \
  --security-group-ids sg-redis
```

### Step 4 — S3 Bucket

```bash
# Create uploads bucket
aws s3api create-bucket \
  --bucket mkulima-link-uploads-prod \
  --region ap-south-1 \
  --create-bucket-configuration LocationConstraint=ap-south-1

# Block public access (CloudFront will serve files)
aws s3api put-public-access-block \
  --bucket mkulima-link-uploads-prod \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,\
    BlockPublicPolicy=true,RestrictPublicBuckets=true

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket mkulima-link-uploads-prod \
  --versioning-configuration Status=Enabled

# Apply CORS policy
aws s3api put-bucket-cors \
  --bucket mkulima-link-uploads-prod \
  --cors-configuration '{
    "CORSRules": [{
      "AllowedOrigins": ["https://mkulimalink.co.ke"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }]
  }'
```

### Step 5 — CloudFront Distribution

```bash
# Create Origin Access Control for S3
aws cloudfront create-origin-access-control \
  --origin-access-control-config \
    Name=mkulima-s3-oac,\
    OriginAccessControlOriginType=s3,\
    SigningBehavior=always,\
    SigningProtocol=sigv4

# Create distribution (replace BUCKET_DOMAIN and ALB_DNS)
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

Example `cloudfront-config.json`:
```json
{
  "Origins": {
    "Quantity": 2,
    "Items": [
      {
        "Id": "S3-mkulima-uploads",
        "DomainName": "mkulima-link-uploads-prod.s3.ap-south-1.amazonaws.com",
        "S3OriginConfig": { "OriginAccessIdentity": "" },
        "OriginAccessControlId": "YOUR_OAC_ID"
      },
      {
        "Id": "ALB-backend",
        "DomainName": "YOUR_ALB_DNS",
        "CustomOriginConfig": {
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "https-only"
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "ALB-backend",
    "ViewerProtocolPolicy": "redirect-to-https",
    "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
  },
  "Aliases": { "Quantity": 1, "Items": ["mkulimalink.co.ke"] },
  "ViewerCertificate": {
    "ACMCertificateArn": "YOUR_ACM_ARN",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  }
}
```

### Step 6 — EC2 Auto Scaling Group

```bash
# Create launch template
aws ec2 create-launch-template \
  --launch-template-name mkulima-backend-lt \
  --version-description v1 \
  --launch-template-data '{
    "ImageId": "ami-0c55b159cbfafe1f0",
    "InstanceType": "t3.small",
    "IamInstanceProfile": { "Name": "mkulima-ec2-role" },
    "SecurityGroupIds": ["sg-backend"],
    "UserData": "BASE64_ENCODED_USERDATA"
  }'

# Create Auto Scaling Group
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name mkulima-backend-asg \
  --launch-template LaunchTemplateName=mkulima-backend-lt,Version='$Latest' \
  --min-size 1 \
  --max-size 4 \
  --desired-capacity 2 \
  --vpc-zone-identifier "subnet-public-1,subnet-public-2" \
  --target-group-arns YOUR_ALB_TARGET_GROUP_ARN \
  --health-check-type ELB \
  --health-check-grace-period 120
```

EC2 User Data script:
```bash
#!/bin/bash
set -e
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs git
npm install -g pm2

cd /home/ubuntu
git clone https://github.com/your-org/mkulima-link.git
cd mkulima-link/backend
npm ci --omit=dev
npm run build

# Pull env from SSM Parameter Store
aws ssm get-parameters-by-path \
  --path /mkulima-link/prod/ \
  --with-decryption \
  --query "Parameters[*].[Name,Value]" \
  --output text | \
  awk '{split($1,a,"/"); printf "%s=%s\n", a[4], $2}' > .env

npx prisma migrate deploy
pm2 start dist/index.js --name mkulima-backend
pm2 startup systemd
pm2 save
```

### Step 7 — Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name mkulima-alb \
  --subnets subnet-public-1 subnet-public-2 \
  --security-groups sg-alb \
  --scheme internet-facing

# Create target group
aws elbv2 create-target-group \
  --name mkulima-backend-tg \
  --protocol HTTPS \
  --port 5000 \
  --vpc-id YOUR_VPC_ID \
  --health-check-path /api/health \
  --health-check-interval-seconds 30 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 5

# Add HTTPS listener with ACM certificate
aws elbv2 create-listener \
  --load-balancer-arn YOUR_ALB_ARN \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=YOUR_ACM_ARN \
  --default-actions Type=forward,TargetGroupArn=YOUR_TARGET_GROUP_ARN
```

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in all values.

### Core Application

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Runtime environment | `production` |
| `PORT` | API server port | `5000` |
| `API_URL` | Public API base URL | `https://api.mkulimalink.co.ke` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://mkulimalink.co.ke` |

### Database

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `REDIS_URL` | Redis connection string | `redis://host:6379` |

### JWT Authentication

| Variable | Description | Example |
|---|---|---|
| `JWT_SECRET` | JWT signing secret (min 64 chars) | `<random 64-char hex>` |
| `JWT_EXPIRES_IN` | Token expiry duration | `7d` |
| `JWT_REFRESH_SECRET` | Refresh token secret | `<random 64-char hex>` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `30d` |

### M-Pesa (Safaricom Daraja API)

| Variable | Description |
|---|---|
| `MPESA_CONSUMER_KEY` | Daraja app consumer key |
| `MPESA_CONSUMER_SECRET` | Daraja app consumer secret |
| `MPESA_SHORTCODE` | Business shortcode (Paybill/Till) |
| `MPESA_PASSKEY` | Lipa Na M-Pesa passkey |
| `MPESA_CALLBACK_URL` | STK push callback URL |
| `MPESA_B2C_INITIATOR_NAME` | B2C initiator name |
| `MPESA_B2C_SECURITY_CREDENTIAL` | B2C security credential |
| `MPESA_B2C_RESULT_URL` | B2C result callback URL |
| `MPESA_B2C_TIMEOUT_URL` | B2C timeout callback URL |

> For sandbox testing, set `MPESA_ENV=sandbox`. For production, set `MPESA_ENV=production`.

### Africa's Talking (SMS)

| Variable | Description |
|---|---|
| `AT_API_KEY` | Africa's Talking API key |
| `AT_USERNAME` | Africa's Talking username |
| `AT_SENDER_ID` | SMS sender ID (optional) |

### Email (SMTP / SES)

| Variable | Description |
|---|---|
| `SMTP_HOST` | SMTP host |
| `SMTP_PORT` | SMTP port (587 for TLS) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `EMAIL_FROM` | From address |

### AWS

| Variable | Description |
|---|---|
| `AWS_REGION` | AWS region | 
| `AWS_ACCESS_KEY_ID` | IAM access key |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key |
| `AWS_S3_BUCKET` | S3 uploads bucket name |
| `AWS_CLOUDFRONT_URL` | CloudFront distribution URL |

### External APIs

| Variable | Description |
|---|---|
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key |

### Platform

| Variable | Description | Default |
|---|---|---|
| `PLATFORM_FEE_PERCENT` | Transaction fee % | `3` |
| `MAX_UPLOAD_SIZE_MB` | Max file upload size in MB | `10` |

---

## Database Migrations

### Development (with history tracking)

```bash
# Create a new migration
npx prisma migrate dev --name <migration_name>

# Reset database (development only — destroys all data)
npx prisma migrate reset
```

### Production (safe deploy)

```bash
# Apply pending migrations without resetting
npx prisma migrate deploy

# Generate Prisma client after schema changes
npx prisma generate
```

### Seeding

```bash
# Seed all initial data (counties, categories, sample prices, admin user)
npm run prisma:seed
```

### Backup and Restore (AWS RDS)

```bash
# Create a manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier mkulima-postgres \
  --db-snapshot-identifier mkulima-backup-$(date +%Y%m%d)

# Restore from snapshot (creates a new instance)
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier mkulima-postgres-restored \
  --db-snapshot-identifier mkulima-backup-20240101
```

---

## SSL Configuration

### Using AWS ACM (Recommended for AWS)

```bash
# Request certificate for your domain
aws acm request-certificate \
  --domain-name mkulimalink.co.ke \
  --subject-alternative-names "*.mkulimalink.co.ke" \
  --validation-method DNS \
  --region us-east-1  # must be us-east-1 for CloudFront

# List certificates to get ARN
aws acm list-certificates --region us-east-1
```

Then add DNS validation records to Route 53 as shown in the ACM console.

### Using Let's Encrypt with Certbot (Nginx on EC2)

```bash
# Install certbot
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx \
  -d mkulimalink.co.ke \
  -d api.mkulimalink.co.ke \
  --non-interactive \
  --agree-tos \
  --email devops@mkulimalink.co.ke

# Auto-renewal (added by certbot, verify it exists)
sudo systemctl status certbot.timer
```

### Nginx SSL Config

```nginx
server {
    listen 443 ssl http2;
    server_name api.mkulimalink.co.ke;

    ssl_certificate     /etc/letsencrypt/live/mkulimalink.co.ke/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mkulimalink.co.ke/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache   shared:MozSSL:10m;
    add_header Strict-Transport-Security "max-age=63072000" always;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name mkulimalink.co.ke api.mkulimalink.co.ke;
    return 301 https://$host$request_uri;
}
```

---

## Monitoring Setup

### CloudWatch Logs (EC2 / ECS)

Install the CloudWatch agent on EC2:

```bash
sudo apt-get install -y amazon-cloudwatch-agent

# Configure agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

Configure PM2 to write structured logs:
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 14
```

### CloudWatch Alarms

```bash
# High CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name mkulima-high-cpu \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=AutoScalingGroupName,Value=mkulima-backend-asg \
  --statistic Average \
  --period 300 \
  --threshold 75 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --evaluation-periods 2 \
  --alarm-actions YOUR_SNS_TOPIC_ARN

# RDS Low Storage alarm
aws cloudwatch put-metric-alarm \
  --alarm-name mkulima-rds-low-storage \
  --namespace AWS/RDS \
  --metric-name FreeStorageSpace \
  --dimensions Name=DBInstanceIdentifier,Value=mkulima-postgres \
  --statistic Average \
  --period 300 \
  --threshold 5368709120 \
  --comparison-operator LessThanOrEqualToThreshold \
  --evaluation-periods 1 \
  --alarm-actions YOUR_SNS_TOPIC_ARN
```

### Application-Level Health Check

The API exposes `GET /api/health` which checks:
- Database connectivity
- Redis connectivity
- Disk space (if configured)

Example healthy response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "database": "up",
    "redis": "up"
  },
  "version": "1.0.0"
}
```

### Uptime Monitoring

Configure an external monitor (e.g., UptimeRobot, Pingdom, or AWS Route 53 Health Check) to ping `https://api.mkulimalink.co.ke/api/health` every 60 seconds. Set alert emails/SMS to the on-call team.

### Log Aggregation

Winston is configured to write JSON logs to stdout (captured by PM2 / Docker). Ship to:
- **AWS CloudWatch Logs** — use the CloudWatch agent or `awslogs` Docker log driver
- **Elasticsearch / OpenSearch** — for full-text search over logs

### Cost Monitoring

```bash
# Enable Cost Anomaly Detection
aws ce create-anomaly-monitor \
  --anomaly-monitor '{
    "MonitorName": "mkulima-cost-monitor",
    "MonitorType": "DIMENSIONAL",
    "MonitorDimension": "SERVICE"
  }'
```

---

## Rollback Procedure

```bash
# On EC2 / ASG — deploy a previous version via CodeDeploy or manual git tag
git checkout tags/v1.2.3
npm ci --omit=dev
npm run build
pm2 restart mkulima-backend

# Database rollback (if migration was applied)
npx prisma migrate resolve --rolled-back <migration_name>
# Then apply the previous migration
npx prisma migrate deploy
```
