# tcg-marketplace

A full-stack web application designed for the trading card game market. This project serves as a technical implementation of a React-based frontend and a Next.js backend, integrated with AWS cloud services for data and asset management.

## 🛠 Tech Stack

### Frontend
- [Next.js](https://nextjs.org/) - React framework
- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling

### Backend

- [NestJS](https://nestjs.com/) - Node.js framework
- [TypeScript](https://www.typescriptlang.org/)
- [JWT](https://jwt.io/) for authentication

### Cloud Infrastructure
- [AWS Cognito](https://aws.amazon.com/cognito/) - User authentication and authorization
- [AWS API Gateway](https://aws.amazon.com/api-gateway/) - API management with role-based access
- [AWS ECS Fargate](https://aws.amazon.com/fargate/) - Containerized backend deployment
- [AWS DynamoDB](https://aws.amazon.com/dynamodb/) - NoSQL database
- [AWS S3](https://aws.amazon.com/s3/) - File storage with presigned URLs

## 🔐 User Roles

The application supports three user roles managed through AWS Cognito:

- **Sellers**: Can create and manage trading card listings, upload images
- **Viewers**: Can browse and view listings (read-only access)
- **Admins**: Full administrative privileges including content moderation

Role-based authorization is enforced at the API Gateway level using Cognito User Groups.

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/nus-iss-team1/tcg-marketplace.git

# Navigate into the project
cd tcg-marketplace

# Install dependencies
npm install
```

## 🖥️ VS Code Configuration

This project includes recommended VS Code settings for consistent formatting, linting, and debugging.

1. Open the project in VS Code.
2. Install the recommended extensions when prompted.
3. The `.vscode/settings.json` automatically configures:
   - Auto-format on save
   - ESLint fixes
   - TypeScript version
