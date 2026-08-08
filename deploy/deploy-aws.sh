#!/bin/bash
# ============================================================
# SciHub Pro - AWS ECS/Fargate Deployment Script
# ============================================================
# Usage: ./deploy-aws.sh [environment]
# Environments: staging | production
# ============================================================

set -e

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
ECR_REPO="${AWS_ECR_REPO:-scihub-pro}"
CLUSTER_NAME="scihub-pro-cluster"
SERVICE_NAME="scihub-pro"
ENVIRONMENT="${1:-staging}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW} SciHub Pro - AWS Deployment${NC}"
echo -e "${YELLOW} Environment: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}========================================${NC}"

# Check prerequisites
check_prerequisites() {
    echo -e "\n${GREEN}[✓] Checking prerequisites...${NC}"
    
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}[✗] AWS CLI not found. Install from: https://aws.amazon.com/cli/${NC}"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}[✗] Docker not found. Install from: https://docs.docker.com/get-docker/${NC}"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}[✗] AWS credentials not configured. Run 'aws configure'${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}[✓] Prerequisites satisfied${NC}"
}

# Login to ECR
login_ecr() {
    echo -e "\n${GREEN}[✓] Logging into Amazon ECR...${NC}"
    
    aws ecr get-login-password --region $AWS_REGION | \
        docker login --username AWS --password-stdin \
        "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
    
    echo -e "${GREEN}[✓] ECR login successful${NC}"
}

# Create ECR repository if not exists
setup_ecr() {
    echo -e "\n${GREEN}[✓] Setting up ECR repository...${NC}"
    
    aws ecr describe-repositories --repository-names $ECR_REPO --region $AWS_REGION 2>/dev/null || \
        aws ecr create-repository \
            --repository-name $ECR_REPO \
            --region $AWS_REGION \
            --image-scanning-configuration scanOnPush=true
    
    REPO_URI=$(aws ecr describe-repositories \
        --repository-names $ECR_REPO \
        --region $AWS_REGION \
        --query 'repositories[0].repositoryUri' \
        --output text)
    
    export REPO_URI
    echo -e "${GREEN}[✓] Repository ready: $REPO_URI${NC}"
}

# Build Docker image
build_image() {
    echo -e "\n${GREEN}[✓] Building Docker image...${NC}"
    
    IMAGE_TAG="$ENVIRONMENT-$(date +%Y%m%d-%H%M%S)"
    
    docker build -t $ECR_REPO:$IMAGE_TAG .
    docker tag $ECR_REPO:$IMAGE_TAG $REPO_URI:$IMAGE_TAG
    
    export IMAGE_TAG
    echo -e "${GREEN}[✓] Image built: $ECR_REPO:$IMAGE_TAG${NC}"
}

# Push to ECR
push_image() {
    echo -e "\n${GREEN}[✓] Pushing to Amazon ECR...${NC}"
    
    docker push $REPO_URI:$IMAGE_TAG
    
    echo -e "${GREEN}[✓] Image pushed successfully${NC}"
}

# Deploy to ECS Fargate
deploy_ecs() {
    echo -e "\n${GREEN}[✓] Deploying to ECS Fargate...${NC}"
    
    # Environment-specific configuration
    case $ENVIRONMENT in
        staging)
            CPU="256"
            MEMORY="512"
            TASK_COUNT="1"
            ;;
        production)
            CPU="1024"
            MEMORY="2048"
            TASK_COUNT="2"
            DESIRED_COUNT="2"
            ;;
        *)
            echo -e "${RED}[✗] Unknown environment: $ENVIRONMENT${NC}"
            exit 1
            ;;
    esac
    
    # Create/update task definition
    TASK_FAMILY="scihub-pro-$ENVIRONMENT"
    
    aws ecs register-task-definition \
        --task-definition $TASK_FAMILY \
        --network-mode awsvpc \
        --requires-compatibilities FARGATE \
        --cpu $CPU \
        --memory $MEMORY \
        --container-definitions "[
            {
                \"name\": \"$SERVICE_NAME\",
                \"image\": \"$REPO_URI:$IMAGE_TAG\",
                \"portMappings\": [
                    {\"containerPort\": 3000, \"protocol\": \"tcp\"}
                ],
                \"environment\": [
                    {\"name\": \"NODE_ENV\", \"value\": \"production\"},
                    {\"name\": \"ENVIRONMENT\", \"value\": \"$ENVIRONMENT\"}
                ],
                \"logConfiguration\": {
                    \"logDriver\": \"awslogs\",
                    \"options\": {
                        \"awslogs-group\": \"/ecs/$SERVICE_NAME\",
                        \"awslogs-region\": \"$AWS_REGION\",
                        \"awslogs-stream-prefix\": \"ecs\"
                    }
                },
                \"healthCheck\": {
                    \"command\": [\"CMD-SHELL\", \"wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1\"],
                    \"interval\": 30,
                    \"timeout\": 10,
                    \"retries\": 3,
                    \"startPeriod\": 60
                }
            }
        ]" > /dev/null || true
    
    # Get latest task definition revision
    LATEST_REVISION=$(aws ecs describe-task-definition \
        --task-definition $TASK_FAMILY \
        --query 'taskDefinition.revision' \
        --output text)
    
    # Update service or create if not exists
    if aws ecs describe-services --services $SERVICE_NAME --cluster $CLUSTER_NAME --region $AWS_REGION > /dev/null 2>&1; then
        aws ecs update-service \
            --cluster $CLUSTER_NAME \
            --service $SERVICE_NAME \
            --task-definition "$TASK_FAMILY:$LATEST_REVISION" \
            --desired-count ${TASK_COUNT:-1} \
            --force-new-deployment \
            --region $AWS_REGION > /dev/null
        
        echo -e "${GREEN}[✓] Service updated${NC}"
    else
        # Create security group and other resources would go here in full implementation
        echo -e "${YELLOW}[!] Service creation requires additional setup. See docs.${NC}"
    fi
    
    # Wait for deployment to stabilize
    echo -e "\n${GREEN}[✓] Waiting for deployment to stabilize...${NC}"
    aws ecs wait services-stable \
        --cluster $CLUSTER_NAME \
        --services $SERVICE_NAME \
        --region $AWS_REGION
    
    echo -e "${GREEN}[✓] Deployment stable${NC}"
}

# Setup CloudFront CDN (production only)
setup_cdn() {
    if [ "$ENVIRONMENT" = "production" ]; then
        echo -e "\n${GREEN}[✓] Setting up CloudFront CDN...${NC}"
        
        # This would create/update CloudFront distribution
        # Simplified for this script
        echo -e "${YELLOW}[!] CloudFront setup available in full deployment guide${NC}"
    fi
}

# Main execution
main() {
    check_prerequisites
    login_ecr
    setup_ecr
    build_image
    push_image
    deploy_ecs
    setup_cdn
    
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN} DEPLOYMENT SUCCESSFUL!${NC}"
    echo -e "${GREEN}========================================${NC}"
}

# Run main function
main "$@"
