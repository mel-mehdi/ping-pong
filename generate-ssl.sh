#!/bin/bash

# Generate self-signed SSL certificate for development with optional SAN (include IP)
# Usage: ./generate-ssl.sh [IP]

echo "🔐 Generating self-signed SSL certificates for development..."

# Allow passing an IP as the first arg or via DEV_HOST_IP env var
HOST_IP="$1"
if [ -z "$HOST_IP" ]; then
  HOST_IP="${DEV_HOST_IP:-}"
fi

# Create directory if it doesn't exist
mkdir -p nginx/ssl

# Build Subject Alternative Name list (always include localhost & 127.0.0.1)
SAN="DNS:localhost,IP:127.0.0.1"
if [ -n "$HOST_IP" ]; then
  SAN=",${SAN},IP:${HOST_IP}"
  # remove leading comma if present
  SAN="${SAN#,}"
fi

# Create a temporary OpenSSL config with SAN
cat > /tmp/openssl_dev.cnf <<EOF
[req]
distinguished_name = req_distinguished_name
prompt = no
[req_distinguished_name]
C = US
ST = State
L = City
O = 42School
OU = FTTranscendence
CN = localhost
[v3_req]
subjectAltName = ${SAN}
EOF

# Generate private key and certificate with the SANs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/nginx.key \
  -out nginx/ssl/nginx.crt \
  -config /tmp/openssl_dev.cnf \
  -extensions v3_req \
  -subj "/C=US/ST=State/L=City/O=42School/OU=FTTranscendence/CN=localhost"

rm -f /tmp/openssl_dev.cnf

# Set proper permissions
chmod 644 nginx/ssl/nginx.crt
chmod 600 nginx/ssl/nginx.key

if [ -n "$HOST_IP" ]; then
  echo "✅ SSL certificates generated (including SAN IP: ${HOST_IP})"
else
  echo "✅ SSL certificates generated (localhost + 127.0.0.1)"
fi

echo "📁 Location: nginx/ssl/"
echo "🔑 Private key: nginx/ssl/nginx.key"
echo "📜 Certificate: nginx/ssl/nginx.crt"
echo ""
echo "⚠️  Note: These are self-signed certificates for development only."
echo "    Your browser will show a security warning - this is expected."
echo "    For production, use proper SSL certificates from Let's Encrypt."
