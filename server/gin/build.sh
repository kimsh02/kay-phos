#!/bin/bash

go mod tidy
# go build -tags=jsoniter cmd/server/main.go
go build cmd/server/main.go
cd ../../database/startup
./setup_postgres_db.sh
cd ../../server/gin

jwt_secret=$(openssl rand -base64 32)
export JWT_SECRET="$jwt_secret"

./main
