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
      
      if (!userNotifications) {
        return {
          totalNotifications: 0,
          sentNotifications: 0
        };
      }
      
      const totalNotifications = userNotifications.length;
      const sentNotifications = userNotifications.filter(n => n.status === 'sent').length;
      const failedNotifications = userNotifications.filter(n => n.status === 'failed').length;
      const pendingNotifications = userNotifications.filter(n => n.status === 'pending').length;

      return {
        totalNotifications,
        sentNotifications,
        failedNotifications,
        pendingNotifications,
        successRate: (sentNotifications / totalNotifications) * 100 || 0
      };
    } catch (error: any) {
      logger.error('User engagement metrics failed', error);
      throw error;
    }
  }
}

export default new AnalyticsService();