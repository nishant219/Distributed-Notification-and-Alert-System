import { Request, Response, NextFunction } from 'express';
import AnalyticsService from '../services/analytics.service';
import logger from '../utils/logger.util';

class AnalyticsController {
  static async getOverallDeliveryStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await AnalyticsService.getDeliveryStats();
      res.json(stats);
      logger.info('Overall delivery analytics retrieved', stats);
    } catch (error: any) {
      logger.error('Overall analytics retrieval failed', error);
      res.status(500).json({ error: 'Analytics retrieval failed' });
    }
  }

  static async getUserEngagementMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req?.params;
      if(!userId) {
        res.status(400).json({ error: 'User ID is required' });
      }
      const metrics = await AnalyticsService.getUserEngagementMetrics(userId);
      res.json(metrics);
      logger.info(`User engagement metrics retrieved for user ${userId}`, metrics);
    } catch (error: any) {
      logger.error('User engagement metrics retrieval failed', error);
      res.status(500).json({ error: 'User engagement metrics retrieval failed' });
    }
  }
}

export default AnalyticsController;