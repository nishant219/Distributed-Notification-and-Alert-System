import { Notification, NotificationPriority, NotificationType } from '../models/notification.model';
import kafkaConfig from '../configs/kafka.config';
import logger from '../utils/logger.util';

class NotificationIngestionService {
  async ingestNotification(
    userId: string, 
    message: string, 
    types: NotificationType[], 
    priority: NotificationPriority = NotificationPriority.LOW,
    sendTime?: Date,
    payload?: Record<string, any>
  ) {
    try {
      // Validate notification request
      const notification = new Notification({
        userId,
        message,
        types,
        priority,
        sendTime: sendTime || new Date(),
        status: 'pending',
        attempts: 0,
        payload
      });

      // Save to MongoDB
      await notification.save();

      // Publish to Kafka
      await kafkaConfig.producer.send({
        topic: 'notifications',
        messages: [{
          key: userId,
          value: JSON.stringify(notification.toJSON())
        }]
      });

      logger.info(`Notification ingested for user ${userId}`);
      return notification;
    } catch (error: any) {
      logger.error('Notification ingestion failed', error);
      throw error;
    }
  }
}

export default new NotificationIngestionService();