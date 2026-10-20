# Node.js LTS production image
FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy backend source code
COPY . .

# Expose backend REST and Socket.IO port
EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

# Start backend server
CMD ["npm", "start"]
