#!/bin/bash
# Generate the JWT secret
export JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET generated: $JWT_SECRET"

# Run the server
exec ./main
