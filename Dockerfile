# # Use node version 20.10.0
# FROM node:20.10.0

# LABEL maintainer="Aum Soni aumsoni2002@gmail.com"
# LABEL description="Fragments node.js microservice"

# # We default to use port 8080 in our service
# ENV PORT=8080

# # Reduce npm spam when installing within Docker
# # https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
# ENV NPM_CONFIG_LOGLEVEL=warn

# # Disable colour when run inside Docker
# # https://docs.npmjs.com/cli/v8/using-npm/config#color
# ENV NPM_CONFIG_COLOR=false

# # Use /app as our working directory
# WORKDIR /app

# # Option 1: explicit path - Copy the package.json and package-lock.json
# # files into /app. NOTE: the trailing `/` on `/app/`, which tells Docker
# # that `app` is a directory and not a file.
# COPY package*.json /app/

# # Install node dependencies defined in package-lock.json
# RUN npm install

# # Copy src to /app/src/
# COPY ./src /app/src/

# # Copy our HTPASSWD file
# COPY ./tests/.htpasswd ./tests/.htpasswd

# # Start the container by running our server
# CMD npm start

# # We run our service on port 8080
# EXPOSE 8080



# Build stage
# Use node version 20.10.0 as the base image for building
FROM node:20.10.0 AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json separately
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY ./src ./src

# Runtime stage
# Use a smaller base image for runtime, such as alpine
FROM node:20.10.0-alpine

# Set working directory
WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app .

# Copy .htpasswd file
COPY ./tests/.htpasswd ./tests/.htpasswd

# Expose port
EXPOSE 8080

# Start the container by running the server
CMD ["npm", "start"]
