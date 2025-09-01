
# Use a Node.js base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Build the TypeScript application
RUN npm run build

# Expose the port the app runs on
EXPOSE 4000

# Define the command to run the application
CMD ["npm", "start"]
