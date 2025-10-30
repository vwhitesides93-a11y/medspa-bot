FROM node:20-alpine
WORKDIR /app

# Copy only app manifests first for better cache
COPY app/package*.json ./
RUN npm install --production

# Copy the rest of the app
COPY app/ .

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node","server.js"]
