# Reading List Trancker

## Project setup
- Install node.js (which comes with npm)
- Change directory to the project
- Run:

  ```bash
  $ npm install
  ```
- Use Docker & Docker Compose
- Create an `.env` file.

## Cassandra local setup 
Cassandra is run using Docker Compose and initialized automatically.
The local environment consists of three Docker services:
- **1. Cassandra Service**
  - It runs the Cassandra database.
  - Persists data using Docker volumes.
  - Exposes port 9042.

- **2. Cassandra Initialization Service**
  - It creates the keyspace and tables.
  - Runs the initialization scripts.
  - Starts only when Cassandra is healthy.
  - Automatically stops after Cassandra was initialized.

- **3. NestJS App**
  - It starts after database initialization completes.
  - Connects to Cassandra via the internal Docker network.
  - Exposes the API on port 3000.

- **Start Cassandra and the NestJS application:**

  ```bash
  $ docker compose up --build
  ```
  - This command will start Cassandra, initialize the database and also start the NestJS application and rebuilds the image.

- **Reset Database Schema**

  ```bash
  $ docker compose run cassandra-db-init cleanup
  ```

## API Documentation
The API is documented using Swagger.

Swagger is configured using the NestJS compiler plugin to automatically generate OpenAPI metadata directly from DTOs, reducing boilerplate and keeping the documentation in sync with the code.

Access Swagger UI at: http://localhost:3000/api

## Compile and run the project

```bash
# watch mode
$ npm run start:dev
```

## Run tests

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```