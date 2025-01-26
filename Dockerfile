# Build
FROM golang:latest AS builder

WORKDIR /kayphos

COPY server/gin /kayphos

RUN go mod tidy

RUN go build cmd/server/main.go

# Runtime
FROM ubuntu:latest

WORKDIR /kayphos

COPY --from=builder /kayphos/main .

EXPOSE 8080

CMD ["./main"]
