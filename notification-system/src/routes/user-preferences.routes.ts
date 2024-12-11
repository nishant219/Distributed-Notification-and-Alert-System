import express from 'express';
import UserPreferencesController from '../controllers/user-preferences.controller';

const router = express.Router();

router.post('/', UserPreferencesController.createUserPreferences);
router.get('/', UserPreferencesController.getUserPreferences);

export default router;