<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h3 align="center">TCG Marketplace</h3>

  <p align="center">
    A full-stack trading card game marketplace for buying and selling collectible cards.
    <br />
    <a href="https://vaultofcards.io"><strong>Visit Vault of Cards</strong></a>
    <br />
    <br />
    <a href="https://vaultofcards.io">View Live</a>
    &middot;
    <a href="https://github.com/nus-iss-team1/tcg-marketplace/issues/new?labels=bug">Report Bug</a>
    &middot;
    <a href="https://github.com/nus-iss-team1/tcg-marketplace/issues/new?labels=enhancement">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#architecture">Architecture</a>
      <ul>
        <li><a href="#infrastructure">Infrastructure</a></li>
        <li><a href="#cicd-pipeline">CI/CD Pipeline</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

TCG Marketplace is a web application where users can browse, buy, and sell trading card game collectibles. The platform features user authentication, listing management, real-time messaging, and a CDN-backed asset pipeline for card images.

Key features:
* Browse and search card listings by game, card name, and price
* Create and manage seller listings with image uploads
* User authentication with email verification
* Real-time messaging between buyers and sellers
* Responsive design across mobile, tablet, and desktop

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [![Next][Next.js]][Next-url]
* [![React][React.js]][React-url]
* [![TypeScript][TypeScript]][TypeScript-url]
* [![TailwindCSS][TailwindCSS]][TailwindCSS-url]
* [![NestJS][NestJS]][NestJS-url]
* [![AWS][AWS]][AWS-url]
* [![Docker][Docker]][Docker-url]
* [![GitHub Actions][GitHubActions]][GitHubActions-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

* Node.js 20+
* npm
  ```sh
  npm install npm@latest -g
  ```
* AWS CLI (for infrastructure deployment)

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/nus-iss-team1/tcg-marketplace.git
   ```
2. Install frontend dependencies
   ```sh
   cd frontend
   npm install
   ```
3. Install backend dependencies
   ```sh
   cd backend/listing-service
   npm install
   ```
4. Set up environment variables
   ```sh
   # Frontend - create frontend/.env.local
   NEXT_PUBLIC_COGNITO_USER_POOL_ID=your_pool_id
   NEXT_PUBLIC_COGNITO_CLIENT_ID=your_client_id
   NEXT_PUBLIC_BACKEND_API=http://localhost:3001

   # Backend - create backend/listing-service/.env
   AWS_REGION=ap-southeast-1
   COGNITO_USER_POOL_ID=your_pool_id
   COGNITO_APP_CLIENT_ID=your_client_id
   ```
5. Start the development servers
   ```sh
   # Terminal 1 - Frontend
   cd frontend
   npm run dev

   # Terminal 2 - Backend
   cd backend/listing-service
   npm run start:dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- PROJECT STRUCTURE -->
## Project Structure

```
tcg-marketplace/
├── frontend/                  # Next.js 16 application
│   └── src/
│       ├── app/               # App Router pages and layouts
│       │   ├── (app)/         # Protected routes (dashboard, profile, admin)
│       │   ├── login/         # Authentication
│       │   ├── marketplace/   # Browse listings
│       │   ├── listing/       # Listing details
│       │   └── seller/        # Seller pages
│       ├── components/        # Shared and UI components (shadcn/ui)
│       ├── context/           # Auth context (Cognito)
│       └── lib/               # Cognito SDK helpers, utilities
├── backend/
│   └── listing-service/       # NestJS microservice (port 3001)
├── infra/
│   └── stacks/                # AWS CloudFormation templates (01-05)
└── .github/
    └── workflows/             # CI/CD pipelines
        ├── app-build.yml      # Backend pipeline
        └── web-build.yml      # Frontend pipeline
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Top Contributors

<a href="https://github.com/nus-iss-team1/tcg-marketplace/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=nus-iss-team1/tcg-marketplace" alt="contrib.rocks image" />
</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Project Link: [https://github.com/nus-iss-team1/tcg-marketplace](https://github.com/nus-iss-team1/tcg-marketplace)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [NUS ISS](https://www.iss.nus.edu.sg/)
* [shadcn/ui](https://ui.shadcn.com/)
* [Img Shields](https://shields.io)
* [AWS Documentation](https://docs.aws.amazon.com/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/nus-iss-team1/tcg-marketplace.svg?style=for-the-badge
[contributors-url]: https://github.com/nus-iss-team1/tcg-marketplace/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/nus-iss-team1/tcg-marketplace.svg?style=for-the-badge
[forks-url]: https://github.com/nus-iss-team1/tcg-marketplace/network/members
[stars-shield]: https://img.shields.io/github/stars/nus-iss-team1/tcg-marketplace.svg?style=for-the-badge
[stars-url]: https://github.com/nus-iss-team1/tcg-marketplace/stargazers
[issues-shield]: https://img.shields.io/github/issues/nus-iss-team1/tcg-marketplace.svg?style=for-the-badge
[issues-url]: https://github.com/nus-iss-team1/tcg-marketplace/issues
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[TypeScript]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[TailwindCSS]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[TailwindCSS-url]: https://tailwindcss.com/
[NestJS]: https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white
[NestJS-url]: https://nestjs.com/
[AWS]: https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonwebservices&logoColor=white
[AWS-url]: https://aws.amazon.com/
[Docker]: https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white
[Docker-url]: https://www.docker.com/
[GitHubActions]: https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white
[GitHubActions-url]: https://github.com/features/actions
