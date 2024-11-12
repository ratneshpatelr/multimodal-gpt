# Use the official Bun image
FROM oven/bun:1

# Set working directory
WORKDIR /app

ENV DATABASE_URL=""

# Copy package files first (for better caching)
COPY package.json bun.lockb ./
COPY tsconfig.json ./

# Install dependencies
RUN bun install

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN bun run db:prod

# Copy the rest of the application
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Start the application
CMD ["bun", "run", "start"]

