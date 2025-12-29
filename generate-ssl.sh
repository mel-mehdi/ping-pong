#!/bin/bash

# Generate self-signed SSL certificate for development
# This script creates SSL certificates for HTTPS in local development

echo "🔐 Generating self-signed SSL certificates for development..."

# Create directory if it doesn't exist
mkdir -p nginx/ssl

# Generate private key and certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/nginx.key \
    -out nginx/ssl/nginx.crt \
    -subj "/C=US/ST=State/L=City/O=42School/OU=FTTranscendence/CN=localhost"

# Set proper permissions
chmod 644 nginx/ssl/nginx.crt
chmod 600 nginx/ssl/nginx.key

echo "✅ SSL certificates generated successfully!"
echo "📁 Location: nginx/ssl/"
echo "🔑 Private key: nginx/ssl/nginx.key"
echo "📜 Certificate: nginx/ssl/nginx.crt"
echo ""
echo "⚠️  Note: These are self-signed certificates for development only."
echo "    Your browser will show a security warning - this is expected."
echo "    For production, use proper SSL certificates from Let's Encrypt."
