# My Node.js App

This project is a Node.js application that uses Express and PostgreSQL. It is containerized using Docker and Docker Compose for easy deployment and management.

## Requirements

- Docker
- Docker Compose

## Project Structure

```
my-nodejs-app
├── src
│   └── app.js
├── package.json
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── postgres-init
│   └── create-dbs.sql
├── .env
├── .env.qa
├── .env.prod
└── README.md
```

## Getting Started

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd my-nodejs-app
   ```

2. **Build the Docker image:**
   ```
   docker-compose build
   ```

3. **Run the application:**
   ```
   docker-compose up
   ```

4. **Access the application:**
   Open your browser and go to `http://localhost:<port>` (replace `<port>` with the port specified in your `.env` file).

## Database Initialization

The project includes SQL scripts to create the necessary databases. These scripts are located in the `postgres-init` directory.

## Environment Variables

Environment variables are defined in the following files:

- `.env`: General environment variables for the application.
- `.env.qa`: Environment variables specific to the QA environment.
- `.env.prod`: Environment variables specific to the production environment.

## Docker Commands

- To stop the application:
  ```
  docker-compose down
  ```

- To rebuild the application:
  ```
  docker-compose up --build
  ```

## Contributing

Feel free to submit issues or pull requests for any improvements or bug fixes.