#!/bin/bash

# TCG Marketplace Infrastructure Deployment Script
# Usage: ./deploy.sh <environment> [template]
# Example: ./deploy.sh dev base

set -e

ENVIRONMENT=${1:-dev}
TEMPLATE=${2:-all}
REGION="ap-southeast-1"
PROJECT_NAME="tcg-marketplace"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Deploying TCG Marketplace Infrastructure${NC}"
echo -e "Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo -e "Region: ${YELLOW}$REGION${NC}"

# Validate AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo -e "${RED}Error: AWS CLI not configured or credentials invalid${NC}"
    exit 1
fi

# Function to deploy a CloudFormation stack
deploy_stack() {
    local template_name=$1
    local stack_name="${PROJECT_NAME}-${ENVIRONMENT}-${template_name}"
    local template_file="${template_name}.yml"
    local parameters_file="parameters/${ENVIRONMENT}.json"
    
    echo -e "${YELLOW}Deploying stack: $stack_name${NC}"
    
    if [ ! -f "$template_file" ]; then
        echo -e "${RED}Error: Template file $template_file not found${NC}"
        return 1
    fi
    
    if [ ! -f "$parameters_file" ]; then
        echo -e "${RED}Error: Parameters file $parameters_file not found${NC}"
        return 1
    fi
    
    aws cloudformation deploy \
        --template-file "$template_file" \
        --stack-name "$stack_name" \
        --parameter-overrides file://"$parameters_file" \
        --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
        --region "$REGION" \
        --no-fail-on-empty-changeset
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Successfully deployed $stack_name${NC}"
    else
        echo -e "${RED}✗ Failed to deploy $stack_name${NC}"
        return 1
    fi
}

# Deploy specific template or all templates
case $TEMPLATE in
    "base")
        deploy_stack "base"
        ;;
    "storage")
        deploy_stack "storage"
        ;;
    "auth")
        deploy_stack "auth"
        ;;
    "compute")
        deploy_stack "compute"
        ;;
    "api")
        deploy_stack "api"
        ;;
    "monitoring")
        deploy_stack "monitoring"
        ;;
    "all")
        echo -e "${YELLOW}Deploying all stacks in dependency order...${NC}"
        deploy_stack "base"
        deploy_stack "storage"
        deploy_stack "auth"
        deploy_stack "compute"
        deploy_stack "api"
        deploy_stack "monitoring"
        ;;
    *)
        echo -e "${RED}Error: Unknown template '$TEMPLATE'${NC}"
        echo "Available templates: base, storage, auth, compute, api, monitoring, all"
        exit 1
        ;;
esac

echo -e "${GREEN}Deployment completed successfully!${NC}"