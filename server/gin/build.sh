#!/bin/bash

go mod tidy
# go build -tags=jsoniter cmd/server/main.go
go build cmd/server/main.go
