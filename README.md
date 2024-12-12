# Distributed Notification and Alert System

## Overview
This is a robust, scalable backend system for managing and delivering notifications across multiple channels, with advanced features like user preference handling, priority-based processing, and intelligent delivery mechanisms.

## System Architecture
The notification system is built using a microservices-inspired architecture with the following key components:
- Node.js Express Backend
- MongoDB for Persistent Storage
- Kafka for Event Streaming
- Winston for Logging

## Key Features
- Multi-channel Notification Delivery (Email, SMS, Push)
- User-specific Notification Preferences
- Priority-based Notification Processing
- Intelligent Scheduling and Filtering
- Retry Mechanisms
- Comprehensive Analytics

## Technology Stack
- Language: TypeScript
- Backend Framework: Express
- Database: MongoDB
- Message Queue: Kafka
- Logging: Winston

## Design Principles
1. **Separation of Concerns**: Each component (controller, service, model) has a distinct responsibility
2. **Configurability**: Extensive user preference settings
3. **Resilience**: Built-in retry and failure handling mechanisms

## Installation

### Prerequisites
- Node.js (v16+)
- MongoDB
- Kafka

### Steps
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run `npm start`

## Key Components
- `NotificationIngestionService`: Handles initial notification creation and Kafka publishing
- `NotificationProcessingService`: Manages notification filtering, deduplication, and scheduling
- `DeliveryService`: Handles multi-channel notification sending
- `AnalyticsService`: Provides insights into notification delivery performance

## Testing
- Run unit tests: `npm test`
- Run integration tests: `npm run test:integration`

## Logging
Comprehensive logging implemented using Winston, with logs stored in:
- Console
- `logs/error.log`
- `logs/combined.log`

## Deployment
Dockerization files and configurations are included for easy deployment.

## Kafka Doc
Start Zookeper Container and expose PORT 2181 =>
docker run -p 2181:2181 zookeeper

Start Kafka Container, expose PORT 9092 and setup ENV variables =>
docker run -p 9092:9092 \
-e KAFKA_ZOOKEEPER_CONNECT=<PRIVATE_IP>:2181 \
-e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://<PRIVATE_IP>:9092 \
-e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
confluentinc/cp-kafka
