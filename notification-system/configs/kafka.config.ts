import {Kafka, Producer, Consumer} from 'kafkajs';
import {config} from './env.config';
import logger from '../utils/logger.util';

class KafkaService{
    private kafka: Kafka;
    public producer: Producer;
    public consumer: Consumer;
    constructor(){
        this.kafka = new Kafka({
            clientId: config.KAFKA_CLIENT_ID,
            // brokers: [config.KAFKA_BOOTSTRAP_SERVERS]
            brokers: ["localhost:9092"]
        })
        this.producer = this.kafka.producer();
        this.consumer = this.kafka.consumer({groupId: config.KAFKA_CLIENT_ID});
    }
    async connectKafka(){
        try{
            await this.producer.connect();
            await this.consumer.connect();
            logger.info('Kafka connected successfully');
        }catch(error: any){
            logger.error('Kafka connection error', error);
            process.exit(1);
        }
    }
    async disconnectKafka(){
        try{
            await this.producer.disconnect();
            await this.consumer.disconnect();
            logger.info('Kafka disconnected successfully');
        }catch(error: any){
            logger.error('Kafka disconnection error', error);
            process.exit(1);
        }
    }
}

export default new KafkaService();