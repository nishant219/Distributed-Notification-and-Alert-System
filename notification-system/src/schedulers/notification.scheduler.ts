import cron from 'node-cron';
import { Notification } from '../models/notification.model';
import NotificationProcessingService from '../services/notification-processing.service';

class NotificationScheduler {
  constructor() {
    // Run every minute to check for pending notifications
    cron.schedule('* * * * *', this.processScheduledNotifications);
  }

  private async processScheduledNotifications() {
    const pendingNotifications = await Notification.find({
      sendTime: { $lte: new Date() },
      status: 'pending'
    });

    for (const notification of pendingNotifications) {
      await NotificationProcessingService.processNotification(notification);
    }
  }
}

export default new NotificationScheduler();