FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
# Run as non-root to limit container damage if the process is compromised
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "index.js"]
