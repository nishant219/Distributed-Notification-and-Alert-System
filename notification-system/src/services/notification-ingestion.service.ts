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

      await notification.save();

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