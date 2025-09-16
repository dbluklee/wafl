# Build stage
FROM node:20-alpine as build-stage

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire source code
COPY . .

# Build the React app (skip TypeScript check for Docker)
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy the built app to nginx html directory
COPY --from=build-stage /usr/src/app/dist /usr/share/nginx/html

# Copy custom nginx config if needed
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]