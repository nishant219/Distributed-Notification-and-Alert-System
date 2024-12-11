import express from 'express';
import {config} from './configs/env.config';
import dbConnection from './configs/database.config';
import logger from './utils/logger.util'

const app=express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

const startServer=async()=>{
    try{
        await dbConnection.connect();
        const PORT=config.PORT || 3000;

        const server = app.listen(PORT,()=>{
            logger.info(`Server running on port ${PORT}`);
        })

        // Graceful shutdown via signal handling SIGTERM
        process.on('SIGTERM', () => {
            logger.info('SIGTERM received. Shutting down gracefully');
            server.close(async () => {
                await dbConnection.disconnect();
                process.exit(0);
            });
        });

    }catch (error: Error | any) {
        logger.error('Failed to start server', error);
        process.exit(1);
    }
}

startServer();
export default app;

