import express from 'express';
import AnalyticsController from '../controllers/analytics.controller';

const router = express.Router();

router.get('/delivery-stats', AnalyticsController.getOverallDeliveryStats );
router.get('/user-engagement/:userId',  AnalyticsController.getUserEngagementMetrics);

export default router;