# Test frontend Docker image with AWS backend
$ALB_DNS = "tcg-marketplace-dev-alb-521671472.ap-southeast-1.elb.amazonaws.com"

Write-Output "Stopping any existing frontend-test container..."
docker stop frontend-test 2>$null
docker rm frontend-test 2>$null

Write-Output "`nStarting frontend container with AWS backend URL..."
docker run -d --name frontend-test -p 3001:3000 `
  -e NEXT_PUBLIC_API_URL="http://$ALB_DNS/api" `
  tcg-marketplace-frontend:test

Write-Output "`nWaiting 10 seconds for container to start..."
Start-Sleep -Seconds 10

Write-Output "`nChecking if frontend is running..."
docker ps | Select-String "frontend-test"

Write-Output "`nContainer logs:"
docker logs frontend-test 2>&1 | Select-Object -Last 10

Write-Output "`n`n=== TESTING ==="
Write-Output "1. Open http://localhost:3001 in your browser"
Write-Output "2. Open DevTools Network tab"
Write-Output "3. Look for the 'listings' request"
Write-Output "4. It should call: http://$ALB_DNS/api/listings"
Write-Output "`nTo stop: docker stop frontend-test && docker rm frontend-test"
