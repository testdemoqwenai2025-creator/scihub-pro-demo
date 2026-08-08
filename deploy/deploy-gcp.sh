#!/bin/bash
# ============================================================
# SciHub Pro - GCP Cloud Run Deployment Script
# ============================================================
# Usage: ./deploy-gcp.sh [environment]
# Environments: staging | production
# ============================================================

set -e

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-scihub-pro-demo}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="scihub-pro"
ENVIRONMENT="${1:-staging}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW} SciHub Pro - GCP Cloud Run Deployment${NC}"
echo -e "${YELLOW} Environment: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}========================================${NC}"

# Check prerequisites
check_prerequisites() {
    echo -e "\n${GREEN}[✓] Checking prerequisites...${NC}"
    
    if ! command -v gcloud &> /dev/null; then
        echo -e "${RED}[✗] gcloud CLI not found. Install from: https://cloud.google.com/sdk/docs/install${NC}"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}[✗] Docker not found. Install from: https://docs.docker.com/get-docker/${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}[✓] Prerequisites satisfied${NC}"
}

# Build Docker image
build_image() {
    echo -e "\n${GREEN}[✓] Building Docker image...${NC}"
    
    IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME:$ENVIRONMENT-$(date +%Y%m%d-%H%M%S)"
    
    docker build -t $IMAGE_NAME .
    
    echo -e "${GREEN}[✓] Image built: $IMAGE_NAME${NC}"
    export IMAGE_NAME
}

# Push to Google Container Registry
push_image() {
    echo -e "\n${GREEN}[✓] Pushing to Google Container Registry...${NC}"
    
    gcloud auth configure-docker gcr.io --quiet
    
    docker push $IMAGE_NAME
    
    echo -e "${GREEN}[✓] Image pushed successfully${NC}"
}

# Deploy to Cloud Run
deploy_cloud_run() {
    echo -e "\n${GREEN}[✓] Deploying to Cloud Run...${NC}"
    
    # Environment-specific configuration
    case $ENVIRONMENT in
        staging)
            MEMORY="512Mi"
            CPU="1"
            MIN_INSTANCES="0"
            MAX_INSTANCES="3"
            ;;
        production)
            MEMORY="2Gi"
            CPU="2"
            MIN_INSTANCES="2"
            MAX_INSTANCES="100"
            ;;
        *)
            echo -e "${RED}[✗] Unknown environment: $ENVIRONMENT${NC}"
            exit 1
            ;;
    esac
    
    gcloud run deploy $SERVICE_NAME \
        --image $IMAGE_NAME \
        --platform managed \
        --region $REGION \
        --memory $MEMORY \
        --cpu $CPU \
        --min-instances $MIN_INSTANCES \
        --max-instances $MAX_INSTANCES \
        --allow-unauthenticated \
        --set-env-vars "NODE_ENV=production,ENVIRONMENT=$ENVIRONMENT" \
        --labels "environment=$ENVIRONMENT,service=scihub-pro" \
        --quiet
    
    # Get the deployed URL
    URL=$(gcloud run services describe $SERVICE_NAME \
        --platform managed \
        --region $REGION \
        --format 'value(status.url)')
    
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN} DEPLOYMENT SUCCESSFUL!${NC}"
    echo -e "${GREEN} URL: ${URL}${NC}"
    echo -e "${GREEN}========================================${NC}"
}

# Cleanup old images (keep last 5)
cleanup_images() {
    echo -e "\n${GREEN}[✓] Cleaning up old images...${NC}"
    
    gcloud container images list-tags gcr.io/$PROJECT_ID/$SERVICE_NAME \
        --filter="tags:$ENVIRONMENT*" \
        --format='get(digest)' \
        --limit=6 | tail -n +6 | while read DIGEST; do
        gcloud container images delete "gcr.io/$PROJECT_ID/$SERVICE_NAME@$DIGEST" --quiet 2>/dev/null || true
    done
    
    echo -e "${GREEN}[✓] Cleanup complete${NC}"
}

# Main execution
main() {
    check_prerequisites
    build_image
    push_image
    deploy_cloud_run
    cleanup_images
    
    echo -e "\n${YELLOW}Deployment complete! Your SciHub Pro instance is live.${NC}"
}

# Run main function
main "$@"
