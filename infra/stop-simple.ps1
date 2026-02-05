# Simple version - Stop development infrastructure
Write-Host "Stopping development infrastructure..."
aws cloudformation delete-stack --stack-name tcg-marketplace-dev-base --region ap-southeast-1
Write-Host "Base stack deletion initiated. This saves money overnight."