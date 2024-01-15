# Lab 1: Initial Setup for Back-End Microservice Project

## Lab Overview

This Lab involves setting up the initial configuration for a back-end microservice. The key components include:

- **app.js**: Defines the Express app, establishes middleware, and outlines the basic HTTP route for a health check.

- **server.js**: Initiates the Express server, allowing it to gracefully shut down and making it accessible on a specified port.

- **logger.js**: Configures a Pino logger instance, enabling structured logging for improved readability in cloud environments.

## Running Scripts

### Linting
Ensure your code adheres to coding standards and best practices. Run ESLint using the following command:

```bash
npm run lint
```

## Starting the Server

### To start the server for production use, execute:

```bash
npm start
```

## Development Mode

### For development purposes, use the following command to run the server with automatic restarts upon code changes:

```bash
npm run dev
```

## Debugging

### Activate debugging mode with the following command. This enables the Node.js inspector on port 9229, allowing debugging via VSCode or other compatible tools:

```bash
npm run debug
```

## Key Components

- **CURL**: Command-line tool for making HTTP requests. Useful for testing your server's responses.

- **ESLint**: Linting utility that helps maintain a consistent coding style and identify potential issues in your code.

- **jq**: Command-line JSON processor. Handy for formatting and querying JSON responses.

- **Prettier**: Code formatter that ensures consistent code styling across your project, enhancing code readability.
