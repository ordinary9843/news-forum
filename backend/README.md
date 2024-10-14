# News Forum
News aggregator and provide news API

## Requirements
- Git
- Docker

## Optional
- pgAdmin

## Build Steps
- Download repository: `git clone git@github.com:ordinary9843/news-forum.git`
- Navigate to the project directory: `cd ./news-forum`
- Copy the environment file: `cp .env.example .env`
- Fill in the following information in `.env`:
- **App:**
  - SERVER_MODE: `DEV`
- **PostgreSQL:**
  - TYPEORM_HOST: `postgres`
  - TYPEORM_USERNAME: `root`
  - TYPEORM_PASSWORD: `DWif&&pdZN*2eyXh`
- **Redis:**
  - REDIS_HOST: `postgres`
  - REDIS_PASSWORD: `DWif&&pdZN*2eyXh`
- Start setting up Docker: `docker-compose up -d`
- Try to browse: `http://localhost/api/docs`
- Continuously monitor Docker container logs: `docker logs -f nf-backend`