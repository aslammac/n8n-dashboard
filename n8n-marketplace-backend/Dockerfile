# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Set environment to production
ENV NODE_ENV=production

# Expose the port
EXPOSE 3001

# Start the application
CMD ["node", "dist/main"]
