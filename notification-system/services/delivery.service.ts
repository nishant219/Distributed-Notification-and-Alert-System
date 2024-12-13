import { INotification, NotificationType } from '../models/notification.model';
import logger from '../utils/logger.util';

export class DeliveryService {
  
  async sendNotification(notification: INotification): Promise<INotification> {
    try {
      notification.attempts++;

      for (const channel of notification.types) {
        await this.sendByChannel(notification, channel);
      }
      notification.status = 'sent';
      await notification.save();
      return notification;
    } catch (error) {
      logger.error(`Notification delivery failed: ${error}`);
      notification.status = 'failed';
      await notification.save();
      throw error;
    }
  }

  private async sendByChannel( notification: INotification, channel: NotificationType ): Promise<void> {
    switch (channel) {
      case NotificationType.EMAIL:
        await this.sendEmail(notification);
        break;
      case NotificationType.SMS:
        await this.sendSMS(notification);
        break;
      case NotificationType.PUSH:
        await this.sendPushNotification(notification);
        break;
      default:
        logger.warn(`Unsupported notification channel: ${channel}`);
    }
  }

  //simulate each service here
  private async sendEmail(notification: INotification): Promise<void> {
    logger.info(`Sending email to user ${notification.userId}: ${notification.message}`);
  }
  private async sendSMS(notification: INotification): Promise<void> {
    logger.info(`Sending SMS to user ${notification.userId}: ${notification.message}`);
  }
  private async sendPushNotification(notification: INotification): Promise<void> {
    logger.info(`Sending push notification to user ${notification.userId}: ${notification.message}`);
  }
}