import { Client } from '@elastic/elasticsearch';
import { config } from '../configs/env.config';
import logger from '../utils/logger.util';
import { NotificationType, NotificationPriority } from '../models/notification.model';

class ElasticsearchService {
  private client: Client;

  constructor() {
    this.client = new Client({ 
      node: config.ELASTICSEARCH_URL 
    });
  }

  async indexNotification(notification: any) {
    try {
      await this.client.index({
        index: 'notifications',
        document: {
          message: notification.message,
          types: notification.types,
          priority: notification.priority,
          sendTime: notification.sendTime,
          userId: notification.userId,
          timestamp: new Date()
        }
      });
      logger.info('Notification indexed in Elasticsearch');
    } catch (error: any) {
      logger.error('Elasticsearch indexing failed', error);
    }
  }
  async searchSimilarNotifications(notification: any, timeWindow: number = 3600) {
    try {
      const result = await this.client.search({
        index: 'notifications',
        body: {
          query: {
            bool: {
              must: [
                { match: { userId: notification.userId } },
                { match: { message: notification.message } },
                { 
                  range: { 
                    timestamp: { 
                      gte: `now-${timeWindow}s` 
                    } 
                  } 
                }
              ]
            }
          }
        }
      });

      const totalHits = result.hits.total !== undefined && typeof result.hits.total === 'number' ? result.hits.total : result?.hits?.total?.value ?? 0;
      return totalHits > 0;
    } catch (error: any) {
      logger.error('Elasticsearch search failed', error);
      return false;
    }
  }

}

export default new ElasticsearchService();