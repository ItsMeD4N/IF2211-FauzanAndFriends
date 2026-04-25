# Multi-stage build for DOM Tree Explorer

# Stage 1: Build React frontend
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install --legacy-peer-deps
COPY client .
RUN npm run build

# Stage 2: Build Go backend
FROM golang:1.26-alpine AS server-builder
WORKDIR /app/server
COPY server/go.mod ./
RUN go mod download
COPY server .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o app main.go

# Stage 3: Production runtime
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=server-builder /app/server/app .
COPY --from=client-builder /app/client/build ./client
EXPOSE 8080
ENV APP_PORT=8080
CMD ["./app"]