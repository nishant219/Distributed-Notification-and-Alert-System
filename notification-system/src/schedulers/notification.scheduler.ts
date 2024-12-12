import cron from 'node-cron';
import { Notification } from '../models/notification.model';
import NotificationProcessingService from '../services/notification-processing.service';
import logger from '../utils/logger.util';

export default class NotificationScheduler {
  private cronJob: cron.ScheduledTask;

  constructor() {
    // Run every hour to check for pending notifications
    this.cronJob = cron.schedule('0 * * * *', async () => {
      try {
        await this.processScheduledNotifications();
      } catch (error: any) {
        logger.error('Error in scheduled notification processing', error);
      }
    });
    logger.info('Notification Scheduler initialized');
  }

  private async processScheduledNotifications() {
    try {
      const pendingNotifications = await Notification.find({
        sendTime: { $lte: new Date() },
        status: 'pending'
      }).limit(100); // Limit to 100 notifications per run to avoid overloading the system

      logger.info(`Found ${pendingNotifications.length} pending notifications to process`);

      for (const notification of pendingNotifications) {
        try {
          await NotificationProcessingService.processNotification(notification);
        } catch (processingError: any) {
          logger.error(`Failed to process notification ${notification._id}`, processingError);
          await Notification.findByIdAndUpdate(notification._id, {
            $inc: { attempts: 1 },
            status: notification.attempts >= 3 ? 'failed' : 'pending'
          });
        }
      }
    } catch (error: any) {
      logger.error('Error fetching pending notifications', error);
    }
  }

  public stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      logger.info('Notification Scheduler stopped');
    }
  }
}