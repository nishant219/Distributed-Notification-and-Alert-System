import { Notification } from '../models/notification.model';
import logger from '../utils/logger.util';

class AnalyticsService {
  async getDeliveryStats() {
    try {
      const totalNotifications = await Notification.countDocuments();
      const sentNotifications = await Notification.countDocuments({ status: 'sent' });
      const failedNotifications = await Notification.countDocuments({ status: 'failed' });

      return {
        totalNotifications,
        sentNotifications,
        failedNotifications,
        successRate: (sentNotifications / totalNotifications) * 100 || 0
      };
    } catch (error: any) {
      logger.error('Analytics retrieval failed', error);
      throw error;
    }
  }

  async getUserEngagementMetrics(userId: string) {
    try {
      const userNotifications = await Notification.find({ userId });
      
      const averageDeliveryTime = userNotifications.reduce((acc, notification) => {
        // Calculate delivery time if needed
        return acc;
      }, 0);

      return {
        totalNotifications: userNotifications.length,
        sentNotifications: userNotifications.filter(n => n.status === 'sent').length,
        averageDeliveryTime
      };
    } catch (error: any) {
      logger.error('User engagement metrics failed', error);
      throw error;
    }
  }
}

export default new AnalyticsService();