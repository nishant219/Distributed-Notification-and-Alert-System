import express from 'express';
import NotificationController from '../controllers/notification.controller';

const router = express.Router();

router.post('/notify', NotificationController.createNotification);

export default router;