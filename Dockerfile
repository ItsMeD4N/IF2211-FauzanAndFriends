FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client .
RUN npm run build

FROM golang:1.22-alpine AS server-builder
WORKDIR /app/server
COPY server/go.mod ./
RUN go mod download
COPY server .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o app main.go

FROM alpine:latest
WORKDIR /app
COPY --from=server-builder /app/server/app .
COPY --from=client-builder /app/client/dist ./client
EXPOSE 8080
CMD ["./app"]