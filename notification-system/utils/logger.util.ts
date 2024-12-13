import winston from 'winston';
import path from 'path';
import fs from 'fs';

class Logger {
  private logger: winston.Logger;

  constructor() {
    // Ensure logs directory exists
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }

    // Create logger
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          const logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
          return stack ? `${logMessage}\n${stack}` : logMessage;
        })
      ),
      transports: [
        // Console transport with colors
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize({ all: true }),
            winston.format.simple()
          )
        }),
        // Error log file
        new winston.transports.File({ 
          filename: path.join(logDir, 'error.log'), 
          level: 'error' 
        }),
        // Combined log file
        new winston.transports.File({ 
          filename: path.join(logDir, 'combined.log') 
        })
      ]
    });
  }

  // Log methods
  public info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  public error(message: string, error?: Error): void {
    this.logger.error(message, error);
  }

  public warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  public debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }
}

export default new Logger();