#!/bin/bash
# ============================================================
# SciHub Pro - Azure Container Apps Deployment Script
# ============================================================
# Usage: ./deploy-azure.sh [environment]
# Environments: staging | production
# ============================================================

set -e

# Configuration
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-scihub-pro-rg}"
LOCATION="${AZURE_LOCATION:-eastus}"
CONTAINER_APP_NAME="scihub-pro"
CONTAINER_REGISTRY="${AZURE_CR:-scihubprocr}"
ENVIRONMENT="${1:-staging}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW} SciHub Pro - Azure Deployment${NC}"
echo -e "${YELLOW} Environment: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}========================================${NC}"

# Check prerequisites
check_prerequisites() {
    echo -e "\n${GREEN}[✓] Checking prerequisites...${NC}"
    
    if ! command -v az &> /dev/null; then
        echo -e "${RED}[✗] Azure CLI not found. Install from: https://docs.microsoft.com/cli/azure/install-azure-cli${NC}"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}[✗] Docker not found. Install from: https://docs.docker.com/get-docker/${NC}"
        exit 1
    fi
    
    # Check Azure login
    if ! az account show &> /dev/null; then
        echo -e "${RED}[✗] Not logged into Azure. Run 'az login'${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}[✓] Prerequisites satisfied${NC}"
}

# Setup Azure resources
setup_azure_resources() {
    echo -e "\n${GREEN}[✓] Setting up Azure resources...${NC}"
    
    # Create resource group if not exists
    az group create \
        --name $RESOURCE_GROUP \
        --location $LOCATION \
        --only-show-errors 2>/dev/null || true
    
    # Create container registry if not exists
    az acr show --name $CONTAINER_REGISTRY --resource-group $RESOURCE_GROUP > /dev/null 2>&1 || {
        az acr create \
            --name $CONTAINER_REGISTRY \
            --resource-group $RESOURCE_GROUP \
            --sku Basic \
            --admin-enabled true \
            --only-show-errors
    }
    
    LOGIN_SERVER=$(az acr show \
        --name $CONTAINER_REGISTRY \
        --resource-group $RESOURCE_GROUP \
        --query loginServer \
        --output tsv)
    
    export LOGIN_SERVER
    echo -e "${GREEN}[✓] Resources ready. Registry: $LOGIN_SERVER${NC}"
}

# Build and push Docker image
build_and_push_image() {
    echo -e "\n${GREEN}[✓] Building and pushing Docker image...${NC}"
    
    IMAGE_TAG="$ENVIRONMENT-$(date +%Y%m%d-%H%M%S)"
    IMAGE_NAME="$LOGIN_SERVER/$CONTAINER_APP_NAME:$IMAGE_TAG"
    
    # Login to ACR
    az acr login --name $CONTAINER_REGISTRY
    
    # Build image
    docker build -t $IMAGE_NAME .
    
    # Push image
    docker push $IMAGE_NAME
    
    export IMAGE_NAME
    export IMAGE_TAG
    echo -e "${GREEN}[✓] Image pushed: $IMAGE_NAME${NC}"
}

# Deploy to Container Apps
deploy_container_app() {
    echo -e "\n${GREEN}[✓] Deploying to Container Apps...${NC}"
    
    # Environment-specific configuration
    case $ENVIRONMENT in
        staging)
            CPU="0.5"
            MEMORY="1Gi"
            MIN_REPLICAS=0
            MAX_REPLICAS=3
            ;;
        production)
            CPU="2"
            MEMORY="4Gi"
            MIN_REPLICAS=2
            MAX_REPLICAS=20
            ;;
        *)
            echo -e "${RED}[✗] Unknown environment: $ENVIRONMENT${NC}"
            exit 1
            ;;
    esac
    
    # Create/update container app
    az containerapp create \
        --name $CONTAINER_APP_NAME \
        --resource-group $RESOURCE_GROUP \
        --image $IMAGE_NAME \
        --cpu $CPU \
        --memory $MEMORY \
        --min-replicas $MIN_REPLICAS \
        --max-replicas $MAX_REPLICAS \
        --ingress external \
        --target-port 3000 \
        --env-vars NODE_ENV=production ENVIRONMENT=$ENVIRONMENT \
        --registry-server $LOGIN_SERVER \
        --query properties.configuration.ingress.fqdn \
        --output tsv 2>/dev/null || {
        
        # If app exists, update it
        az containerapp update \
            --name $CONTAINER_APP_NAME \
            --resource-group $RESOURCE_GROUP \
            --image $IMAGE_NAME \
            --cpu $CPU \
            --memory $MEMORY \
            --min-replicas $MIN_REPLICAS \
            --max-replicas $MAX_REPLICAS \
            --query properties.configuration.ingress.fqdn \
            --output tsv
    }
    
    FQDN=$(az containerapp show \
        --name $CONTAINER_APP_NAME \
        --resource-group $RESOURCE_GROUP \
        --query properties.configuration.ingress.fqdn \
        --output tsv)
    
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN} DEPLOYMENT SUCCESSFUL!${NC}"
    echo -e "${GREEN} URL: https://${FQDN}${NC}"
    echo -e "${GREEN}========================================${NC}"
}

# Setup monitoring (Azure Application Insights)
setup_monitoring() {
    echo -e "\n${GREEN}[✓] Setting up monitoring...${NC}"
    
    # This would set up Application Insights, Log Analytics, etc.
    echo -e "${YELLOW}[!] Monitoring setup available in full deployment guide${NC}"
}

# Main execution
main() {
    check_prerequisites
    setup_azure_resources
    build_and_push_image
    deploy_container_app
    setup_monitoring
    
    echo -e "\n${YELLOW}Deployment complete! Your SciHub Pro instance is live on Azure.${NC}"
}

# Run main function
main "$@"
