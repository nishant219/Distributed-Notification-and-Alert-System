# Use official Node.js LTS image as base
FROM node:18-alpine

# Set working directory in container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Compile TypeScript
RUN npm run build

# Expose port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]