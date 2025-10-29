# FROM node:lts-alpine
# ENV NODE_ENV=production
# WORKDIR /usr/src/app
# COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
# RUN npm install --production --silent && mv node_modules ../
# COPY . .
# EXPOSE 3000
# RUN chown -R node /usr/src/app
# USER node
# CMD ["npm", "start"]

# Stage 1: Use Node to build the React app
FROM node:16 AS build
# Set the working directory
WORKDIR /usr/src/app
# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install
# Copy the rest of the React app source code and build it
COPY . .
RUN npm run build

# Stage 2: Nginx and Certbot setup
FROM nginx:alpine
# Install Certbot and required dependencies
RUN apk add --no-cache certbot certbot-nginx bash curl

# Copy the built React app from the previous stage
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Expose port 80 (for HTTP) and port 443 (for HTTPS)
EXPOSE 80 443
# Environment variables for domain and email
ARG DOMAIN=bar-scan.juuls-trinkets.com 
# Example
ARG sjkproxmox@gmail.com">EMAIL=sjkproxmox@gmail.com 
# Example
# Create Nginx config automatically based on domain
RUN echo "server { \
    listen 80; \
    server_name $DOMAIN; \
    location / { \
        root /usr/share/nginx/html; \
        try_files \$uri /index.html; \
    } \
    return 301 https://\$host\$request_uri; \
} \
server { \
    listen 443 ssl; \
    server_name $DOMAIN; \
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem; \
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem; \
    location / { \
        root /usr/share/nginx/html; \
        try_files \$uri /index.html; \
    } \
}" > /etc/nginx/conf.d/tals.conf

# Ensure the directory for cron jobs exists
RUN mkdir -p /etc/periodic/12h
# Create a script to check SSL expiration and renew if necessary
RUN echo '#!/bin/bash' > /etc/periodic/12h/renew_ssl.sh && \
    echo 'EXPIRATION_DATE=$(openssl x509 -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem -text -noout | grep "Not After" | awk -F ": " '\''{print $2}'\'')' >> /etc/periodic/12h/renew_ssl.sh && \
    echo 'EXPIRATION_TIMESTAMP=$(date -d "$EXPIRATION_DATE" +%s)' >> /etc/periodic/12h/renew_ssl.sh && \
    echo 'CURRENT_TIMESTAMP=$(date +%s)' >> /etc/periodic/12h/renew_ssl.sh && \
    echo 'DAYS_LEFT=$(( (EXPIRATION_TIMESTAMP - CURRENT_TIMESTAMP) / 86400 ))' >> /etc/periodic/12h/renew_ssl.sh && \
    echo 'if [ $DAYS_LEFT -le 30 ]; then' >> /etc/periodic/12h/renew_ssl.sh && \
    echo '  certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive --redirect' >> /etc/periodic/12h/renew_ssl.sh && \
    echo 'fi' >> /etc/periodic/12h/renew_ssl.sh && \
    chmod +x /etc/periodic/12h/renew_ssl.sh

# Run both Nginx and Certbot auto-renewal
CMD ["sh", "-c", "crond && nginx -g 'daemon off;'"]