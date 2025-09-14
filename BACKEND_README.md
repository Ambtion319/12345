# UWorld Replica - Backend Documentation

## 🚀 Production-Ready Backend Architecture

This backend is designed to be **secure**, **scalable**, and **portable** across any BaaS provider or VPS.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Security Features](#security-features)
- [Database Design](#database-design)
- [API Endpoints](#api-endpoints)
- [Environment Setup](#environment-setup)
- [Deployment Guide](#deployment-guide)
- [Development Guide](#development-guide)
- [Monitoring & Logging](#monitoring--logging)
- [Troubleshooting](#troubleshooting)

## 🏗️ Architecture Overview

### Technology Stack
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Next.js 15 with App Router
- **Databases**: 
  - PostgreSQL (Relational data)
  - MongoDB (Document storage)
  - Redis (Caching & sessions)
- **Authentication**: NextAuth.js with OAuth providers
- **File Processing**: Tesseract.js (OCR), Sharp (Image processing)
- **AI Integration**: OpenAI GPT-4
- **Background Jobs**: Bull/BullMQ
- **Security**: Helmet, CORS, Rate limiting
- **Logging**: Winston with MongoDB storage
- **Deployment**: Docker with Docker Compose

### Service Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Auth Service  │
│   (Next.js)     │◄──►│   (Next.js)     │◄──►│   (NextAuth)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  File Upload    │    │   OCR Service   │    │   LLM Service   │
│   Service       │◄──►│   (Tesseract)   │    │   (OpenAI)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │    MongoDB      │    │     Redis       │
│   (Relational)  │    │   (Documents)   │    │   (Cache)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔒 Security Features

### Authentication & Authorization
- **Multi-provider OAuth**: Google, GitHub, Microsoft
- **JWT tokens** with secure expiration
- **Role-based access control** (Student, Instructor, Admin)
- **Session management** with Redis
- **Password hashing** with bcryptjs

### API Security
- **Rate limiting** on all endpoints
- **CORS protection** with whitelist
- **Input validation** with Joi schemas
- **SQL injection prevention** with Prisma
- **XSS protection** with Helmet
- **File upload security** with type validation

### Data Protection
- **Environment variables** for all secrets
- **Encrypted sensitive data** in database
- **Secure file storage** with access controls
- **Audit logging** for all user actions
- **GDPR compliance** ready

## 🗄️ Database Design

### PostgreSQL (Relational Data)
- **Users**: Authentication and profile data
- **QuestionBanks**: Uploaded question collections
- **Questions**: Individual questions with options
- **UserAnswers**: User responses and performance
- **PracticeSessions**: Study sessions and progress
- **Analytics**: Performance metrics and reports
- **AuditLogs**: Security and activity logs

### MongoDB (Document Storage)
- **FileUploads**: File metadata and processing status
- **OCRResults**: Text extraction results
- **LLMResponses**: AI-generated explanations
- **SystemLogs**: Application logs and monitoring
- **CachedData**: Temporary cached data
- **BackgroundJobs**: Queue job management

## 🔌 API Endpoints

### Authentication
- `POST /api/auth` - Login/Register
- `GET /api/auth/session` - Get current session
- `POST /api/auth/signout` - Sign out

### File Management
- `POST /api/upload` - Upload files
- `GET /api/upload/:id/status` - Check upload status
- `DELETE /api/upload/:id` - Delete uploaded file

### Question Management
- `GET /api/questions` - Get questions with filters
- `POST /api/questions` - Submit answers
- `GET /api/questions/:id` - Get specific question
- `PUT /api/questions/:id` - Update question

### OCR Processing
- `POST /api/ocr/process` - Process file with OCR
- `GET /api/ocr/:fileId/results` - Get OCR results
- `GET /api/ocr/:fileId/text` - Get extracted text

### LLM Integration
- `POST /api/llm/explanation` - Generate explanation
- `POST /api/llm/study-notes` - Generate study notes
- `POST /api/llm/practice-questions` - Generate questions

### Analytics
- `GET /api/analytics/performance` - Get performance data
- `GET /api/analytics/progress` - Get progress tracking
- `GET /api/analytics/reports` - Generate reports

### System
- `GET /api/health` - Health check
- `GET /api/status` - System status
- `GET /api/logs` - Get system logs

## ⚙️ Environment Setup

### 1. Copy Configuration Template
```bash
cp config.example.js config.js
```

### 2. Update Configuration
Edit `config.js` with your actual values:

```javascript
module.exports = {
  app: {
    name: 'UWorld Replica',
    port: 3000,
    env: 'production',
    url: 'https://yourdomain.com',
  },
  database: {
    postgres: {
      url: 'postgresql://user:password@localhost:5432/uworld_replica',
    },
    mongodb: {
      uri: 'mongodb://localhost:27017/uworld_replica',
    },
    redis: {
      url: 'redis://localhost:6379',
    },
  },
  // ... other configurations
}
```

### 3. Environment Variables
Set up your environment variables:

```bash
# Database
export DATABASE_URL="postgresql://user:password@localhost:5432/uworld_replica"
export MONGODB_URI="mongodb://localhost:27017/uworld_replica"
export REDIS_URL="redis://localhost:6379"

# Authentication
export NEXTAUTH_URL="https://yourdomain.com"
export NEXTAUTH_SECRET="your-secret-key"
export GOOGLE_CLIENT_ID="your-google-client-id"
export GOOGLE_CLIENT_SECRET="your-google-client-secret"

# External Services
export OPENAI_API_KEY="your-openai-api-key"
export AWS_ACCESS_KEY_ID="your-aws-access-key"
export AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
```

## 🚀 Deployment Guide

### Quick Start
```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Deploy with Docker
./scripts/deploy.sh deploy
```

### Manual Deployment

#### 1. Development Setup
```bash
./scripts/deploy.sh dev
npm run dev
```

#### 2. Production Setup
```bash
./scripts/deploy.sh prod
npm start
```

#### 3. Docker Deployment
```bash
# Build and start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f app
```

### Platform-Specific Deployment

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway up
```

#### DigitalOcean App Platform
```bash
# Create app.yaml
# Deploy via DigitalOcean dashboard
```

## 🛠️ Development Guide

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- MongoDB 7+
- Redis 7+
- Docker (optional)

### Local Development
```bash
# Clone repository
git clone <repository-url>
cd uworld-replica

# Install dependencies
npm install

# Setup environment
cp config.example.js config.js
# Edit config.js with your values

# Setup databases
npm run db:setup

# Start development server
npm run dev
```

### Database Management
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# View database
npx prisma studio

# Reset database
npx prisma db reset
```

### Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test
npm test -- --grep "auth"
```

## 📊 Monitoring & Logging

### Health Monitoring
- **Health Check**: `GET /api/health`
- **System Status**: `GET /api/status`
- **Database Health**: Automatic monitoring
- **Memory Usage**: Real-time tracking

### Logging
- **Application Logs**: Winston with file rotation
- **Database Logs**: MongoDB collection
- **Error Tracking**: Structured error logging
- **Audit Logs**: User action tracking

### Performance Monitoring
- **Response Times**: API endpoint monitoring
- **Database Queries**: Prisma query logging
- **Memory Usage**: Heap and process monitoring
- **File Processing**: OCR and upload tracking

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check PostgreSQL
pg_isready -h localhost -p 5432

# Check MongoDB
mongosh --eval "db.runCommand('ping')"

# Check Redis
redis-cli ping
```

#### File Upload Issues
```bash
# Check upload directory permissions
ls -la uploads/
chmod 755 uploads/

# Check file size limits
# Update config.js MAX_FILE_SIZE
```

#### OCR Processing Issues
```bash
# Check Tesseract installation
tesseract --version

# Check image processing
# Verify Sharp installation
```

### Log Analysis
```bash
# View application logs
tail -f logs/app.log

# View error logs
tail -f logs/error.log

# View Docker logs
docker-compose logs -f app
```

### Performance Optimization
```bash
# Monitor memory usage
npm run monitor

# Check database performance
npm run db:analyze

# Optimize images
npm run optimize:images
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Redis Documentation](https://redis.io/documentation)
- [Docker Documentation](https://docs.docker.com)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for medical education**
