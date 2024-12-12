import express from 'express';
import {config} from './configs/env.config';
import cors from 'cors';
import dbConnection from './configs/database.config';
import logger from './utils/logger.util'
import kafkaConfig from './configs/kafka.config';
import notificationRoutes from './routes/notification.routes';
import userPreferencesRoutes from './routes/user-preferences.routes';
import analyticsRoutes from './routes/analytics.routes';
import NotificationScheduler from './schedulers/notification.scheduler';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

const startServer = async () => {
    try {
        await dbConnection.connect();
        await kafkaConfig.connectKafka();
        
        const notificationScheduler = new NotificationScheduler();
        
        const PORT = config.PORT || 3000;

        app.use('/api/v1/notifications', notificationRoutes);
        app.use('/api/v1/user-preferences', userPreferencesRoutes);
        app.use('/api/v1/analytics', analyticsRoutes);

        const server = app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });

        // Graceful shutdown via signal handling SIGTERM
        process.on('SIGTERM', () => {
            logger.info('SIGTERM received. Shutting down gracefully');
            server.close(async () => {
                notificationScheduler.stop();
                await dbConnection.disconnect();
                process.exit(0);
            });
        });
    } catch (error: any) {
        logger.error('Failed to start server', error);
        process.exit(1);
    }
}

startServer();
export default app;