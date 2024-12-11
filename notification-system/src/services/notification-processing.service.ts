import { INotification, IUserPreference, Notification, UserPreference, NotificationPriority, NotificationType } from '../models/notification.model';
import logger from '../utils/logger.util';
import { isWithinQuietHours } from '../utils/time.util';
import { DeliveryService } from '../services/delivery.service';

class NotificationProcessingService {
  private deliveryService: DeliveryService;

  constructor() {
    this.deliveryService = new DeliveryService();
  }

  /**
   * Main method to process a notification based on user preferences and system rules
   * @param notification The incoming notification to process
   * @returns Processed notification or null if filtered out
   */
  async processNotification(notification: INotification): Promise<INotification | null> {
    try {
      // Fetch user preferences
      const userPreferences = await this.getUserPreferences(notification.userId);
      if (!userPreferences) {
        logger.warn(`No preferences found for user ${notification.userId}`);
        return null;
      }

      // Check quiet hours
      if (this.isQuietHoursPrevention(notification, userPreferences)) {
        await this.rescheduleNotification(notification, userPreferences);
        return null;
      }

      // Check notification limit
      const recentNotificationsCount = await this.checkNotificationLimit(notification.userId);
      if (recentNotificationsCount >= userPreferences.notificationLimit) {
        logger.warn(`Notification limit reached for user ${notification.userId}`);
        return null;
      }

      // Check for similar recent alerts (deduplication)
      const isDuplicate = await this.checkDuplicateAlert(notification);
      if (isDuplicate) {
        logger.info(`Duplicate alert suppressed for user ${notification.userId}`);
        return null;
      }

      // Process based on priority
      return this.processByPriority(notification);
    } catch (error: any) {
      logger.error('Notification processing failed', error);
      throw error;
    }
  }

  /**
   * Fetch user preferences
   * @param userId User identifier
   * @returns User preferences or null
   */
  private async getUserPreferences(userId: string): Promise<IUserPreference | null> {
    return await UserPreference.findOne({ userId });
  }

  /**
   * Check if notification is within quiet hours
   * @param notification Incoming notification
   * @param userPreferences User's notification preferences
   * @returns Boolean indicating if in quiet hours
   */
  private isQuietHoursPrevention(
    notification: INotification, 
    userPreferences: IUserPreference
  ): boolean {
    return isWithinQuietHours(
      notification.sendTime || new Date(), 
      userPreferences.quietHoursStart, 
      userPreferences.quietHoursEnd
    );
  }

  /**
   * Reschedule notification outside quiet hours
   * @param notification Notification to reschedule
   * @param userPreferences User preferences
   */
  private async rescheduleNotification(
    notification: INotification, 
    userPreferences: IUserPreference
  ): Promise<void> {
    const nextActiveTime = this.calculateNextActiveTime(userPreferences);
    
    await Notification.findByIdAndUpdate(notification._id, {
      sendTime: nextActiveTime,
      status: 'pending'
    });
  }

  /**
   * Calculate next active time based on user preferences
   * @param userPreferences User's notification preferences
   * @returns Next active timestamp
   */
  private calculateNextActiveTime(userPreferences: IUserPreference): Date {
    const nextActiveTime = new Date();
    const [endHour, endMinute] = userPreferences.quietHoursEnd.split(':').map(Number);
    
    nextActiveTime.setHours(endHour, endMinute, 0, 0);
    return nextActiveTime;
  }

  /**
   * Check notification limit for a user
   * @param userId User identifier
   * @returns Number of recent notifications
   */
  private async checkNotificationLimit(userId: string): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return await Notification.countDocuments({
      userId,
      sendTime: { $gte: oneHourAgo },
      status: 'sent'
    });
  }

  /**
   * Check for duplicate alerts within the last hour
   * @param notification Incoming notification
   * @returns Boolean indicating if duplicate
   */
  private async checkDuplicateAlert(notification: INotification): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const similarNotification = await Notification.findOne({
      userId: notification.userId,
      message: notification.message,
      sendTime: { $gte: oneHourAgo },
      status: 'sent'
    });

    return !!similarNotification;
  }

  /**
   * Process notification based on its priority
   * @param notification Notification to process
   * @returns Processed notification
   */
  private async processByPriority(notification: INotification): Promise<INotification | null> {
    switch (notification.priority) {
      case NotificationPriority.URGENT:
        return this.processUrgentNotification(notification);
      case NotificationPriority.LOW:
        return this.processLowPriorityNotification(notification);
      default:
        return this.processRegularNotification(notification);
    }
  }

  /**
   * Process urgent notifications immediately
   * @param notification Urgent notification
   * @returns Processed notification
   */
  private async processUrgentNotification(notification: INotification): Promise<INotification> {
    // Immediately move to delivery queue
    return await this.deliveryService.sendNotification(notification);
  }

  /**
   * Process low-priority notifications with potential batch aggregation
   * @param notification Low-priority notification
   * @returns Processed notification or null
   */
  private async processLowPriorityNotification(notification: INotification): Promise<INotification | null> {
    const similarPendingNotifications = await this.findSimilarPendingNotifications(notification);
    
    if (similarPendingNotifications.length > 0) {
      // Aggregate notifications
      const aggregatedMessage = this.aggregateNotifications(
        [notification, ...similarPendingNotifications]
      );
      
      notification.message = aggregatedMessage;
    }

    return await this.deliveryService.sendNotification(notification);
  }

  /**
   * Find similar pending notifications in the same hour
   * @param notification Reference notification
   * @returns Array of similar notifications
   */
  private async findSimilarPendingNotifications(notification: INotification): Promise<INotification[]> {
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    
    return await Notification.find({
      userId: notification.userId,
      priority: NotificationPriority.LOW,
      sendTime: { 
        $gte: new Date(), 
        $lte: oneHourFromNow 
      },
      status: 'pending'
    });
  }

  /**
   * Aggregate multiple notifications into a single summary message
   * @param notifications Array of notifications to aggregate
   * @returns Aggregated message string
   */
  private aggregateNotifications(notifications: INotification[]): string {
    return `Summary of ${notifications.length} notifications: ` + 
      notifications.map(n => n.message).join('; ');
  }

  /**
   * Process regular (medium priority) notifications
   * @param notification Regular notification
   * @returns Processed notification
   */
  private async processRegularNotification(notification: INotification): Promise<INotification> {
    return await this.deliveryService.sendNotification(notification);
  }
}

export default new NotificationProcessingService();