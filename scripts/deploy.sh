#!/bin/bash

# ===========================================
# UWorld Replica - Deployment Script
# ===========================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="uworld-replica"
DOCKER_IMAGE="uworld-replica:latest"
CONTAINER_NAME="uworld-replica-app"

# ===========================================
# Helper Functions
# ===========================================
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ===========================================
# Environment Setup
# ===========================================
setup_environment() {
    log_info "Setting up environment..."
    
    # Check if .env.local exists
    if [ ! -f ".env.local" ]; then
        log_warning ".env.local not found. Creating from template..."
        cp config.example.js config.js
        log_warning "Please update config.js with your actual values before continuing"
        exit 1
    fi
    
    # Create necessary directories
    mkdir -p uploads temp logs
    chmod 755 uploads temp logs
    
    log_success "Environment setup complete"
}

# ===========================================
# Database Setup
# ===========================================
setup_database() {
    log_info "Setting up databases..."
    
    # Generate Prisma client
    log_info "Generating Prisma client..."
    npx prisma generate
    
    # Run database migrations
    log_info "Running database migrations..."
    npx prisma db push
    
    log_success "Database setup complete"
}

# ===========================================
# Build Application
# ===========================================
build_app() {
    log_info "Building application..."
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci --only=production
    
    # Build the application
    log_info "Building Next.js application..."
    npm run build
    
    log_success "Application build complete"
}

# ===========================================
# Docker Operations
# ===========================================
build_docker() {
    log_info "Building Docker image..."
    
    docker build -t $DOCKER_IMAGE .
    
    log_success "Docker image built successfully"
}

start_docker() {
    log_info "Starting Docker containers..."
    
    # Stop existing containers
    docker-compose down 2>/dev/null || true
    
    # Start services
    docker-compose up -d
    
    log_success "Docker containers started"
}

stop_docker() {
    log_info "Stopping Docker containers..."
    
    docker-compose down
    
    log_success "Docker containers stopped"
}

# ===========================================
# Health Check
# ===========================================
health_check() {
    log_info "Performing health check..."
    
    # Wait for application to start
    sleep 10
    
    # Check if application is responding
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log_success "Application is healthy"
        return 0
    else
        log_error "Application health check failed"
        return 1
    fi
}

# ===========================================
# Backup Database
# ===========================================
backup_database() {
    log_info "Creating database backup..."
    
    # Create backup directory
    mkdir -p backups
    
    # Backup PostgreSQL
    if command -v pg_dump &> /dev/null; then
        pg_dump $DATABASE_URL > backups/postgres_backup_$(date +%Y%m%d_%H%M%S).sql
        log_success "PostgreSQL backup created"
    else
        log_warning "pg_dump not found, skipping PostgreSQL backup"
    fi
    
    # Backup MongoDB
    if command -v mongodump &> /dev/null; then
        mongodump --uri $MONGODB_URI --out backups/mongodb_backup_$(date +%Y%m%d_%H%M%S)
        log_success "MongoDB backup created"
    else
        log_warning "mongodump not found, skipping MongoDB backup"
    fi
}

# ===========================================
# Cleanup
# ===========================================
cleanup() {
    log_info "Cleaning up..."
    
    # Remove old Docker images
    docker image prune -f
    
    # Remove old logs
    find logs -name "*.log" -mtime +7 -delete 2>/dev/null || true
    
    log_success "Cleanup complete"
}

# ===========================================
# Main Deployment Function
# ===========================================
deploy() {
    log_info "Starting deployment of $APP_NAME..."
    
    # Pre-deployment checks
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Setup environment
    setup_environment
    
    # Build application
    build_app
    
    # Build Docker image
    build_docker
    
    # Start Docker containers
    start_docker
    
    # Health check
    if health_check; then
        log_success "Deployment completed successfully!"
        log_info "Application is available at http://localhost:3000"
    else
        log_error "Deployment failed health check"
        exit 1
    fi
}

# ===========================================
# Development Setup
# ===========================================
dev_setup() {
    log_info "Setting up development environment..."
    
    # Install all dependencies
    npm install
    
    # Setup environment
    setup_environment
    
    # Setup database
    setup_database
    
    log_success "Development environment ready!"
    log_info "Run 'npm run dev' to start the development server"
}

# ===========================================
# Production Setup
# ===========================================
prod_setup() {
    log_info "Setting up production environment..."
    
    # Install production dependencies
    npm ci --only=production
    
    # Setup environment
    setup_environment
    
    # Setup database
    setup_database
    
    # Build application
    build_app
    
    log_success "Production environment ready!"
    log_info "Run 'npm start' to start the production server"
}

# ===========================================
# Main Script
# ===========================================
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "dev")
        dev_setup
        ;;
    "prod")
        prod_setup
        ;;
    "build")
        build_app
        ;;
    "docker")
        build_docker
        start_docker
        ;;
    "stop")
        stop_docker
        ;;
    "health")
        health_check
        ;;
    "backup")
        backup_database
        ;;
    "cleanup")
        cleanup
        ;;
    *)
        echo "Usage: $0 {deploy|dev|prod|build|docker|stop|health|backup|cleanup}"
        echo ""
        echo "Commands:"
        echo "  deploy   - Full deployment (default)"
        echo "  dev      - Setup development environment"
        echo "  prod     - Setup production environment"
        echo "  build    - Build application only"
        echo "  docker   - Build and start Docker containers"
        echo "  stop     - Stop Docker containers"
        echo "  health   - Check application health"
        echo "  backup   - Backup databases"
        echo "  cleanup  - Clean up old files"
        exit 1
        ;;
esac
