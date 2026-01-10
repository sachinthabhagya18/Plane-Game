# Base Image
FROM node:20-alpine

# Working Directory
WORKDIR /app

# Install Dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy Code
COPY . .

# Build Next.js
RUN npm run build

# Expose Port
EXPOSE 3000

# Start Command
CMD ["npm", "start"]