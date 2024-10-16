# News Forum
This project collects news data and allows users to vote on current events

## Requirements
- Git
- Docker

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
  - REDIS_HOST: `redis`
  - REDIS_PASSWORD: `DWif&&pdZN*2eyXh`
- Start setting up Docker: `docker-compose up -d --build`
- Access the Swagger API documentation: `http://localhost/api/docs`
- Continuously monitor Docker container logs: `docker logs -f nf-backend`

## Related Docs
- [Backend](https://github.com/ordinary9843/news-forum/blob/master/backend/README.md)
- [Frontend](https://github.com/ordinary9843/news-forum/blob/master/frontend/README.md)