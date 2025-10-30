FROM node:20-alpine

# Work inside /app
WORKDIR /app

# Copy only the app manifests first (better caching)
COPY app/package*.json ./

# Install production deps
# Try npm ci first (faster & reproducible); fall back to npm install if lockfile isn't present
RUN npm ci --omit=dev || npm install --production

# Copy the rest of the app sources
COPY app/ .

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Use the start script defined in app/package.json ("start": "node server.js")
CMD ["npm","start"]