import { Request, Response, NextFunction } from 'express';
import { UserPreference } from '../models/notification.model';
import logger from '../utils/logger.util';

class UserPreferencesController {
    static createUserPreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { userId, channels, quietHoursStart, quietHoursEnd, notificationLimit } = req?.body;

            const existingPreferences = await UserPreference.findOne({ userId });

            if (existingPreferences) {
                existingPreferences.channels = channels;
                existingPreferences.quietHoursStart = quietHoursStart;
                existingPreferences.quietHoursEnd = quietHoursEnd;
                existingPreferences.notificationLimit = notificationLimit;

                const updatedPreferences = await existingPreferences.save();
                res.status(200).json(updatedPreferences);
                return;
            }

            const newPreferences = new UserPreference({
                userId,
                channels,
                quietHoursStart,
                quietHoursEnd,
                notificationLimit,
            });

            const savedPreferences = await newPreferences.save();
            res.status(201).json(savedPreferences);
        } catch (error: any) {
            logger.error('User preferences creation failed', error);
            res.status(500).json({ error: 'User preferences creation failed' });
        }
    }

    static getUserPreferences = async ( req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { userId } = req?.params;
            if (!userId) {
                res.status(400).json({ error: 'User ID is required' });
                return;
            }
            const preferences = await UserPreference.findOne({ userId });
            if (!preferences) {
                res.status(404).json({ error: 'User preferences not found' });
                return;
            }
            res.json(preferences);
        } catch (error: any) {
            logger.error('User preferences retrieval failed', error);
            res.status(500).json({ error: 'User preferences retrieval failed' });
        }
    }
}

export default UserPreferencesController;
