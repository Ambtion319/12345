# 🏥 UWorld Replica - Medical Exam Preparation Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.1.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748)](https://www.prisma.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)](https://www.docker.com/)

A comprehensive, production-ready medical exam preparation platform that replicates the UWorld experience with AI-powered features for question parsing, explanations, and analytics.

## ✨ Features

### 🎯 Core Features
- **📁 File Upload & Processing**: Upload PDF, Word, or Excel files with automatic OCR and question parsing
- **🎓 UWorld-Style Interface**: Familiar question interface with tutor mode, timed mode, and review mode
- **🤖 AI-Powered Explanations**: Generate high-quality explanations using OpenAI GPT-4
- **📊 Performance Analytics**: Detailed analytics and progress tracking
- **⚙️ Question Management**: Admin tools for managing question banks and content

### 🚀 Technical Features
- **⚡ Next.js 15 with App Router**: Modern React framework with server components
- **🔒 TypeScript**: Full type safety throughout the application
- **🎨 Tailwind CSS**: Utility-first CSS framework for responsive design
- **👁️ OCR Integration**: Tesseract.js for text extraction from scanned documents
- **🧠 LLM Integration**: OpenAI GPT-4 for intelligent explanations
- **🗄️ Multi-Database**: PostgreSQL + MongoDB + Redis
- **🔐 Authentication**: NextAuth.js with OAuth providers
- **🐳 Docker Ready**: Full containerization for easy deployment
- **📈 Monitoring**: Comprehensive logging and health checks

## 🏗️ Architecture

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

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- MongoDB 7+
- Redis 7+
- Docker (optional)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/uworld-replica.git
cd uworld-replica
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy configuration template
cp config.example.js config.js

# Edit config.js with your actual values
# Set up your database URLs, API keys, etc.
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push
```

### 5. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application!

## 🐳 Docker Deployment

### Quick Deploy
```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Deploy with Docker
./scripts/deploy.sh deploy
```

### Manual Docker Setup
```bash
# Build and start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f app
```

## 📁 Project Structure

```
uworld-replica/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   ├── (dashboard)/              # Main application routes
│   ├── api/                      # API routes
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # React components
│   ├── ui/                      # Reusable UI components
│   ├── features/                # Feature-specific components
│   └── layout/                  # Layout components
├── lib/                         # Backend services
│   ├── auth/                    # Authentication
│   ├── database/                # Database connections
│   ├── services/                # Core services
│   ├── middleware/              # Security middleware
│   └── mongodb/                 # MongoDB schemas
├── prisma/                      # Database schema
├── types/                       # TypeScript definitions
├── scripts/                     # Deployment scripts
├── docker-compose.yml           # Docker configuration
├── Dockerfile                   # Docker image
└── README.md
```

## 🔧 Configuration

### Environment Variables
Create a `config.js` file from `config.example.js` and configure:

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

## 🔌 API Endpoints

### Authentication
- `POST /api/auth` - Login/Register
- `GET /api/auth/session` - Get current session

### File Management
- `POST /api/upload` - Upload files
- `GET /api/upload/:id/status` - Check upload status

### Question Management
- `GET /api/questions` - Get questions with filters
- `POST /api/questions` - Submit answers

### OCR Processing
- `POST /api/ocr/process` - Process file with OCR
- `GET /api/ocr/:fileId/results` - Get OCR results

### LLM Integration
- `POST /api/llm/explanation` - Generate explanation
- `POST /api/llm/study-notes` - Generate study notes

### Analytics
- `GET /api/analytics/performance` - Get performance data
- `GET /api/analytics/progress` - Get progress tracking

### System
- `GET /api/health` - Health check
- `GET /api/status` - System status

## 🔒 Security Features

- ✅ **Multi-provider OAuth** (Google, GitHub, Microsoft)
- ✅ **JWT token management** with secure expiration
- ✅ **Role-based access control** (Student, Instructor, Admin)
- ✅ **Rate limiting** on all endpoints
- ✅ **CORS protection** with whitelist
- ✅ **Input validation** and sanitization
- ✅ **File upload security** with type validation
- ✅ **SQL injection prevention** with Prisma
- ✅ **XSS protection** with Helmet
- ✅ **Audit logging** for all actions

## 📊 Monitoring & Logging

- **Health Check**: `GET /api/health`
- **System Status**: `GET /api/status`
- **Application Logs**: Winston with MongoDB storage
- **Error Tracking**: Structured error logging
- **Performance Monitoring**: Real-time metrics

## 🚀 Deployment Platforms

### BaaS Providers
- ✅ **Vercel** - Ready with Next.js optimization
- ✅ **Railway** - Docker container ready
- ✅ **DigitalOcean App Platform** - Full stack deployment
- ✅ **Oracle Cloud** - Container deployment ready
- ✅ **AWS/GCP/Azure** - Docker container ready

### VPS Deployment
- ✅ **Docker Compose** setup included
- ✅ **Nginx reverse proxy** configuration
- ✅ **SSL/TLS** ready
- ✅ **Database setup** scripts

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Database Management
```bash
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes
npx prisma studio    # Open Prisma Studio
npx prisma db reset  # Reset database
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- 📧 Email: support@uworldreplica.com
- 💬 Discord: [Join our community](https://discord.gg/uworldreplica)
- 📖 Documentation: [Backend Docs](BACKEND_README.md)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Prisma](https://www.prisma.io/) - Database toolkit
- [OpenAI](https://openai.com/) - AI capabilities
- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR processing
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

---

**Built with ❤️ for medical education**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/uworld-replica)
[![Deploy to Railway](https://railway.app/button)](https://railway.app/template/uworld-replica)
