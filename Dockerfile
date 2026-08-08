# ---- Build stage ----
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies (leverages Docker layer caching)
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# Build the static site
COPY . .
RUN pnpm build

# ---- Serve stage ----
FROM nginx:alpine AS serve

# Copy the built static assets
COPY --from=build /app/dist /usr/share/nginx/html

# Replace the stock config with the HTTPS-only config (redirects :80 -> :443).
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# HTTP (redirect-only) and HTTPS.
EXPOSE 80 443

# Certificates are NOT baked into the image. Mount them at runtime:
#   -v ./certs:/etc/nginx/certs:ro
# expecting cert.pem (chain) and key.pem (private key).
CMD ["nginx", "-g", "daemon off;"]
