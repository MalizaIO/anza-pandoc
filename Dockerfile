# Base ##################################################################
ARG BASE_IMAGE=pandoc/extra:latest
FROM $BASE_IMAGE AS base
WORKDIR /app

# Install Node.js, npm and other dependencies
RUN apk --no-cache add nodejs npm

# Install necessary dependencies for Google Cloud Storage SDK
RUN apk --no-cache add libc6-compat

# Install the Google Cloud Storage SDK
RUN npm install --save @google-cloud/storage

# Copy the package.json file
COPY package.json /app/package.json

# Install dependencies and add them to package.json
RUN npm install --save express
RUN npm install --save multer

# Create the output directory
RUN mkdir /app/output

# Copy the Node.js application
COPY app.js /app/app.js

# Expose port 8080
EXPOSE 8080

# Set the entry point to run the Node.js application
ENTRYPOINT ["node", "/app/app.js"]
