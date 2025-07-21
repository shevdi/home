# Shevdi Home - Full Stack Application

A modern full-stack web application built with React, TypeScript, Node.js, Express, and MongoDB. The application features a containerized architecture using Docker and includes both frontend and backend services with a complete development and production setup.

## 🚀 Features

### Frontend

- **React 19** with TypeScript for type safety
- **React Router 7** for client-side routing
- **Styled Components** for CSS-in-JS styling with theme support
- **Server-Side Rendering (SSR)** with proper hydration
- **Vite** for fast development and optimized builds
- **Responsive design** with dark mode support

### Backend

- **Node.js** with **Express.js** framework
- **TypeScript** for enhanced development experience
- **MongoDB** with Mongoose ODM
- **RESTful API** with proper error handling
- **Security middleware** (Helmet, CORS)
- **Health checks** and graceful shutdown
- **Environment-based configuration**

### DevOps & Infrastructure

- **Docker** containerization with multi-stage builds
- **Docker Compose** for orchestration
- **Development and production** configurations
- **Hot reloading** in development mode
- **Non-root user** for security in containers

## 📋 Prerequisites

- **Docker** (version 20.0 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Node.js** (version 18 or higher) - for local development
- **npm** or **yarn** - for package management

## 🛠️ Quick Start

### Using Docker (Recommended)

1. **Clone the repository**

   git clone <repository-url>
   cd shevdi-home

2. **Start the application**

   docker compose up --build

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3000
   - MongoDB: localhost:27017

### Development Mode

For development with hot reloading:

docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

## 🏗️ Project Structure

shevdi-home/
├── app/ # Frontend React application
│ ├── components/ # Reusable React components
│ │ └── ThemeProvider.tsx # Styled-components theme provider
│ ├── routes/ # React Router route components
│ │ ├── home.tsx # Home page component
│ │ └── projects.tsx # Projects page component
│ ├── types/ # TypeScript type definitions
│ │ └── project.ts # Project interface
│ ├── welcome/ # Welcome component
│ ├── app.css # Global styles
│ ├── root.tsx # Root layout component
│ └── routes.ts # Route configuration
├── backend/ # Backend Node.js application
│ ├── src/
│ │ ├── db/ # Database configuration
│ │ │ ├── init.ts # Database initialization
│ │ │ └── models/ # Mongoose models
│ │ │ └── project.ts # Project model
│ │ ├── routes/ # API route handlers
│ │ │ └── projects.ts # Projects API routes
│ │ ├── services/ # Business logic services
│ │ │ └── projects.ts # Project service functions
│ │ ├── types/ # TypeScript interfaces
│ │ │ └── index.ts # Common type definitions
│ │ ├── app.ts # Express app configuration
│ │ └── index.ts # Application entry point
│ ├── .env.template # Environment variables template
│ ├── Dockerfile # Backend Docker configuration
│ ├── nodemon.json # Nodemon configuration
│ ├── package.json # Backend dependencies
│ └── tsconfig.json # TypeScript configuration
├── docker-compose.yml # Production Docker Compose
├── docker-compose.dev.yml # Development Docker Compose override
├── Dockerfile # Frontend Docker configuration
├── package.json # Frontend dependencies
├── tsconfig.json # Frontend TypeScript configuration
├── vite.config.ts # Vite configuration
└── README.md # This file

## 🔧 Configuration

### Environment Variables

#### Backend (.env)

Create a `.env` file in the `backend/` directory:

# Server Configuration

NODE_ENV=development
PORT=3000

# Database Configuration

MONGODB_URL=mongodb://localhost:27017
DB_NAME=shevdi_home

# Frontend Configuration

FRONTEND_URL=http://localhost:3000

# API Configuration

API_VERSION=v1

# Logging

LOG_LEVEL=info

#### Frontend

Environment variables are configured through Docker Compose build args:

args:
VITE_BACKEND_URL: http://localhost:3000/api/v1

## 📡 API Endpoints

### Health & Info

- `GET /api/v1/health` - Health check endpoint
- `GET /api/v1/` - API welcome message
- `GET /api/v1/title` - Get page title

### Projects

- `GET /api/v1/projects` - List all projects

### Example API Response

{
"success": true,
"data": [
{
"_id": "507f1f77bcf86cd799439011",
"title": "Project Name",
"description": "Project description",
"url": "https://project-url.com",
}
]
}

## 🐳 Docker Commands

### Basic Operations

# Build and start all services

docker compose up --build

# Start in detached mode

docker compose up -d

# Stop all services

docker compose down

# View logs

docker compose logs -f

# View logs for specific service

docker compose logs -f home-backend

### Development Commands

# Start development environment

docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Rebuild specific service

docker compose build home-backend

# Execute commands in running container

docker compose exec home-backend sh

### Maintenance Commands

# Remove all containers and volumes

docker compose down -v

# Remove unused Docker resources

docker system prune

# View container status

docker compose ps

## 💻 Local Development

### Frontend Development

# Install dependencies

npm install

# Start development server

npm run dev

# Build for production

npm run build

# Type checking

npm run typecheck

### Backend Development

cd backend

# Install dependencies

npm install

# Start development server

npm run dev

# Build TypeScript

npm run build

# Start production server

npm start

## 🧪 Testing

### Health Checks

# Test backend health

curl http://localhost:3000/api/v1/health

# Test frontend

curl http://localhost:3000

### API Testing

# Get all projects

curl http://localhost:3000/api/v1/projects

### Performance Optimization

- **Multi-stage Docker builds** for smaller images
- **Production dependencies only** in final images
- **Static asset optimization** with Vite
- **Database indexing** for better query performance

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**

   # Check what's using the port

   lsof -i :3000
   lsof -i :3000

2. **Database connection issues**

   # Check MongoDB container

   docker compose logs home-database

   # Restart database

   docker compose restart home-database

3. **Build failures**

   # Clean Docker cache

   docker builder prune

   # Rebuild without cache

   docker compose build --no-cache

4. **TypeScript errors**

   # Check TypeScript configuration

   npm run typecheck

   # Regenerate types
