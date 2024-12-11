import { INotification, NotificationType } from '../models/notification.model';
import logger from '../utils/logger.util';

export class DeliveryService {
  /**
   * Send notification through specified channels
   * @param notification Notification to send
   * @returns Updated notification
   */
  async sendNotification(notification: INotification): Promise<INotification> {
    try {
      // Increment attempts
      notification.attempts++;

      // Send through each specified channel
      for (const channel of notification.types) {
        await this.sendByChannel(notification, channel);
      }

      // Update notification status
      notification.status = 'sent';
      await notification.save();

      return notification;
    } catch (error) {
      logger.error(`Notification delivery failed: ${error}`);
      
      // Update notification status to failed
      notification.status = 'failed';
      await notification.save();

      throw error;
    }
  }

  /**
   * Send notification through a specific channel
   * @param notification Notification to send
   * @param channel Delivery channel
   */
  private async sendByChannel(
    notification: INotification, 
    channel: NotificationType
  ): Promise<void> {
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

  /**
   * Mock email sending method
   * @param notification Notification to send via email
   */
  private async sendEmail(notification: INotification): Promise<void> {
    // Simulate email service
    logger.info(`Sending email to user ${notification.userId}: ${notification.message}`);
  }

  /**
   * Mock SMS sending method
   * @param notification Notification to send via SMS
   */
  private async sendSMS(notification: INotification): Promise<void> {
    // Simulate SMS service
    logger.info(`Sending SMS to user ${notification.userId}: ${notification.message}`);
  }

  /**
   * Mock push notification method
   * @param notification Notification to send as push notification
   */
  private async sendPushNotification(notification: INotification): Promise<void> {
    // Simulate push notification service
    logger.info(`Sending push notification to user ${notification.userId}: ${notification.message}`);
  }
}