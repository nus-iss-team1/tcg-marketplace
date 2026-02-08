# Infrastructure Cost Management Scripts

Scripts to manage AWS infrastructure costs during development.

## 💰 Cost Overview

The TCG Marketplace infrastructure has two types of resources:

### Free Tier Resources (Always Running)
- **S3 Bucket** - Storage for card images (~$0/day)
- **DynamoDB Table** - Database for listings (~$0/day)
- **Cognito User Pool** - Authentication (~$0/day)

### Paid Resources (Start/Stop Daily)
- **VPC with NAT Gateway** - Network infrastructure (~$1.58/day or ~$47/month)
- **VPC Endpoints** - Private AWS service access

## 📜 Available Scripts

### `dev-start.ps1`
**Purpose**: Start development infrastructure for daily work

**What it does**:
- Deploys the base stack (VPC + NAT Gateway)
- Checks that storage and auth stacks are running
- Shows resource information (VPC ID, S3 bucket, DynamoDB table)

**When to use**: Every morning when you start development

**Cost**: Starts charging ~$1.58/day

**Usage**:
```powershell
cd tcg-marketplace/infra/scripts
.\dev-start.ps1
```

---

### `dev-stop.ps1`
**Purpose**: Stop expensive infrastructure to save costs

**What it does**:
- Deletes the base stack (VPC + NAT Gateway)
- Preserves your data in S3 and DynamoDB
- Stops daily charges

**When to use**: Every evening when you finish development

**Savings**: Saves ~$1.58/day (~$47/month)

**Usage**:
```powershell
cd tcg-marketplace/infra/scripts
.\dev-stop.ps1
```

**Important**: Your data is safe! Only the network infrastructure is deleted.

---

### `dev-status.ps1`
**Purpose**: Check infrastructure status and current costs

**What it does**:
- Shows status of all stacks (base, storage, auth)
- Displays current daily cost
- Shows monthly cost projection
- Shows DynamoDB item count

**When to use**: Anytime you want to check what's running

**Usage**:
```powershell
cd tcg-marketplace/infra/scripts
.\dev-status.ps1
```

**Example Output**:
```
TCG Marketplace Infrastructure Status
=======================================

Base Stack (VPC/Networking):
   Status: RUNNING
   Cost: approximately 1.58 dollars per day (47.45 dollars per month)

Storage Stack (S3 + DynamoDB):
   Status: RUNNING
   Cost: approximately 0.00 dollars per day (free tier)
   DynamoDB Items: 15 listings

Auth Stack (Cognito):
   Status: RUNNING
   Cost: approximately 0.00 dollars per day (free tier)

Cost Summary:
   Current daily cost: approximately 1.58 dollars
   Monthly projection: approximately 47.40 dollars
   TIP: Run dev-stop.ps1 to save costs when not developing
```

## 🔄 Daily Workflow

### Morning (Start Development)
```powershell
# 1. Start infrastructure
cd tcg-marketplace/infra/scripts
.\dev-start.ps1

# 2. Wait for deployment (2-3 minutes)

# 3. Start backend
cd ../../backend
npm run start:dev

# 4. Start frontend
cd ../frontend
npm run dev
```

### Evening (Stop Development)
```powershell
# 1. Stop backend and frontend (Ctrl+C in terminals)

# 2. Stop infrastructure
cd tcg-marketplace/infra/scripts
.\dev-stop.ps1
```

### Anytime (Check Status)
```powershell
cd tcg-marketplace/infra/scripts
.\dev-status.ps1
```

## 💡 Cost Optimization Tips

1. **Always run `dev-stop.ps1` when done** - This is the biggest cost saver
2. **Check status regularly** - Use `dev-status.ps1` to verify nothing is running unnecessarily
3. **Weekend savings** - Stop infrastructure Friday evening, start Monday morning (saves ~$9.48/weekend)
4. **Vacation savings** - Stop infrastructure before vacation (saves ~$47/month)

## 🎯 Cost Comparison

| Scenario | Daily Cost | Monthly Cost |
|----------|------------|--------------|
| Always running | $1.58 | $47.40 |
| Stop nights (16h/day) | $0.66 | $19.80 |
| Stop nights + weekends | $0.45 | $13.50 |
| Only run when developing (4h/day) | $0.26 | $7.80 |

**Recommendation**: Run `dev-stop.ps1` every evening to save ~60% on costs!

## ⚠️ Important Notes

1. **Data is preserved** - Stopping infrastructure does NOT delete your S3 or DynamoDB data
2. **Quick restart** - `dev-start.ps1` takes only 2-3 minutes to redeploy
3. **No data loss** - All your listings and images remain intact
4. **Free tier resources** - Storage and auth stacks can run 24/7 at no cost

## 🆘 Troubleshooting

### Script fails with "Stack does not exist"
**Solution**: This is normal if the stack hasn't been deployed yet. Run `dev-start.ps1` first.

### "Access Denied" error
**Solution**: Check AWS credentials with `aws sts get-caller-identity`

### Stack stuck in "DELETE_IN_PROGRESS"
**Solution**: Wait 5-10 minutes. CloudFormation is cleaning up resources.

### Forgot to run dev-stop.ps1
**Solution**: Run it now! Better late than never. Check status with `dev-status.ps1`.

## 📚 Related Documentation

- [Infrastructure README](../README.md) - Full infrastructure documentation
- [Developer Setup](../../DEVELOPER_SETUP.md) - Complete setup guide
- [Quick Reference](../../QUICK_REFERENCE.md) - Command cheat sheet
