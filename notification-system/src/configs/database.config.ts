import mongoose from 'mongoose';
import { config } from './env.config';
import logger from '../utils/logger.util';

class DbConnection {
    private static instance: DbConnection;
    private connectionString: string;

    private constructor() {
        this.connectionString = config.MONGO_URI || '';
    }

    public static getInstance(): DbConnection {
        if (!DbConnection.instance) {
            DbConnection.instance = new DbConnection();
        }
        return DbConnection.instance;
    }

    public async connect(): Promise<void> {
        try {
            logger.info('Attempting to connect to database...');

            await mongoose.connect(this.connectionString, {
                // useNewUrlParser: true,
                // useUnifiedTopology: true
            });
            
            logger.info('__Connected to database successfully__');

            mongoose.connection.on('error', (err) => {
                logger.error('Database connection error:', err);
            });

            mongoose.connection.on('disconnected', () => {
                logger.warn('Disconnected from database');
            });

            process.on('SIGINT', async () => {
                await this.disconnect();
                process.exit(0);
            });
        } catch (error) {
            console.error('Failed to connect to database:', error);
            process.exit(1);
        }
    }

    public async disconnect(): Promise<void> {
        try {
            await mongoose.disconnect();
            logger.info('Mongoose disconnection successful');
        } catch (error : any) {
            logger.error('Error during mongoose disconnection:', error);
        }
    }
}

export default DbConnection.getInstance();