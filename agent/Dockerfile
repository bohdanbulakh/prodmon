FROM golang:1.20 AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o agent main.go metrics.go websocket_client.go

FROM scratch

WORKDIR /app

COPY --from=builder /app/agent .

CMD ["./agent"]
