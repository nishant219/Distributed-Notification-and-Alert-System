import express from 'express';
import NotificationController from '../controllers/notification.controller';

const router = express.Router();

router.post('/notify', NotificationController.createNotification);
router.get('/analytics', NotificationController.getAnalytics);
router.get('/user-preferences', NotificationController.getUserPreferences);

export default router;