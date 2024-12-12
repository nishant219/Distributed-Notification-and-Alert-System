import { Request, Response, NextFunction } from 'express';
import NotificationIngestionService from '../services/notification-ingestion.service';
import AnalyticsService from '../services/analytics.service';
import { UserPreference, NotificationType, NotificationPriority } from '../models/notification.model';
import logger from '../utils/logger.util';

class NotificationController {
  static async createNotification(req: Request|any, res: Response|any, next: NextFunction | any) {
    try {
      const { userId, message, types, priority = NotificationPriority.LOW, sendTime, payload } = req?.body;

      const validTypes = types.filter((type: string) => 
        Object.values(NotificationType).includes(type as NotificationType)
      );

      if (validTypes.length === 0) {
        return res.status(400).json({ error: 'Invalid notification types' });
      }

      const notification = await NotificationIngestionService?.ingestNotification(
        userId, 
        message, 
        validTypes, 
        priority, 
        sendTime, 
        payload
      );
      res.status(201).json(notification);
      logger.info('Notification created: ', notification);
    } catch (error: any) {
      logger.error('Notification creation failed', error);
      res.status(500).json({ error: 'Notification creation failed' });
    }
  }

}

export default NotificationController;