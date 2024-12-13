import mongoose, { Schema, Document, Model } from 'mongoose';

export enum NotificationType {
    EMAIL = 'email',
    SMS = 'sms',
    PUSH = 'push',
}

export enum NotificationPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent',
}

export interface INotification extends Document {
    userId: string;
    message: string;
    types: NotificationType[];
    priority: NotificationPriority;
    sendTime?: Date;
    status: 'pending' | 'sent' | 'failed';
    attempts: number;
    payload?: Record<string, any>;
}

export interface IUserPreference extends Document {
    userId: string;
    channels: NotificationType[];
    quietHoursStart: string;
    quietHoursEnd: string;
    notificationLimit: number;
}

export class NotificationModel {
    private schema: Schema<INotification>;
    public model: Model<INotification>;

    constructor() {
        this.schema = new Schema<INotification>(
            {
                userId: { 
                    type: String, 
                    required: true, 
                    index: true 
                },
                message: { 
                    type: String, 
                    required: true 
                },
                types: [
                    {
                        type: String,
                        enum: Object.values(NotificationType),
                        required: true,
                    },
                ],
                priority: {
                    type: String,
                    enum: Object.values(NotificationPriority),
                    default: NotificationPriority.LOW,
                },
                sendTime: { 
                    type: Date, 
                    default: Date.now 
                },
                status: {
                    type: String,
                    enum: ['pending', 'sent', 'failed'],
                    default: 'pending',
                },
                attempts: { 
                    type: Number, 
                    default: 0 
                },
                payload: { 
                    type: Schema.Types.Mixed 
                },
            },
            { timestamps: true }
        );

        this.model = mongoose.model<INotification>('Notification', this.schema);
    }
}

export class UserPreferenceModel {
    private schema: Schema<IUserPreference>;
    public model: Model<IUserPreference>;

    constructor() {
        this.schema = new Schema<IUserPreference>(
            {
                userId: { 
                    type: String, 
                    required: true, 
                    unique: true 
                },
                channels: [
                    {
                        type: String,
                        enum: Object.values(NotificationType),
                    },
                ],
                quietHoursStart: { 
                    type: String, 
                    default: '22:00' 
                },
                quietHoursEnd: { 
                    type: String, 
                    default: '08:00' 
                },
                notificationLimit: { 
                    type: Number, 
                    default: 3 
                },
            }
        );

        this.model = mongoose.model<IUserPreference>(
            'UserPreference',
            this.schema
        );
    }
}

export const Notification = new NotificationModel().model;
export const UserPreference = new UserPreferenceModel().model;
