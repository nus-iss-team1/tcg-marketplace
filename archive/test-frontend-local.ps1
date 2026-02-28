# Test frontend Docker image locally
Write-Output "Starting frontend container..."
docker run -d --name frontend-test -p 3001:3000 tcg-marketplace-frontend:test

Write-Output "`nWaiting 10 seconds for container to start..."
Start-Sleep -Seconds 10

Write-Output "`nChecking if frontend is running..."
docker ps | Select-String "frontend-test"

Write-Output "`nTesting frontend homepage..."
curl http://localhost:3001 2>$null | Select-String -Pattern "TCG Marketplace" -Context 0,2

Write-Output "`n`nChecking container logs for any errors..."
docker logs frontend-test 2>&1 | Select-Object -Last 20

Write-Output "`n`nTo check the API call in browser:"
Write-Output "1. Open http://localhost:3001 in your browser"
Write-Output "2. Open DevTools Network tab"
Write-Output "3. Look for the 'listings' request"
Write-Output "4. Verify it's calling '/api/listings' (not just 'listings')"
Write-Output "`nTo stop and remove the test container:"
Write-Output "docker stop frontend-test && docker rm frontend-test"
