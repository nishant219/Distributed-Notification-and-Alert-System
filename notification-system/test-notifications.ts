import axios from 'axios';
import { NotificationType, NotificationPriority } from './models/notification.model';

const BASE_URL = 'http://localhost:3000/api/v1';

async function testNotificationSystem() {
    try {
        // 1. Create User Preferences
        const userPreferences = await axios.post(`${BASE_URL}/user-preferences`, {
            userId: 'test_user_001',
            channels: [NotificationType.EMAIL, NotificationType.SMS, NotificationType.PUSH],
            quietHoursStart: '22:00',
            quietHoursEnd: '08:00',
            notificationLimit: 5
        });
        console.log('User Preferences Created:', userPreferences.data);

        // 2. Send Various Notifications
        const notifications = [
            {
                userId: 'test_user_001',
                message: 'Low Priority System Update',
                types: [NotificationType.EMAIL],
                priority: NotificationPriority.LOW
            },
            {
                userId: 'test_user_001',
                message: 'Urgent Security Alert',
                types: [NotificationType.PUSH, NotificationType.SMS],
                priority: NotificationPriority.URGENT
            },
            {
                userId: 'test_user_001',
                message: 'Scheduled Weekly Report',
                types: [NotificationType.EMAIL],
                priority: NotificationPriority.MEDIUM,
                sendTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }
        ];

        const sentNotifications = [];
        for (let notification of notifications) {
            try {
                const result = await axios.post(`${BASE_URL}/notifications/notify`, notification);
                sentNotifications.push(result.data);
                console.log('Notification Sent:', result.data);
            } catch (notificationError: any) {
                console.error('Failed to send notification:', notificationError.response ? notificationError.response.data : notificationError.message);
            }
        }

        // 3. Get Overall Delivery Stats
        try {
            const deliveryStats = await axios.get(`${BASE_URL}/analytics/delivery-stats`);
            console.log('Delivery Analytics:', deliveryStats.data);
        } catch (analyticsError: any) {
            console.error('Failed to fetch delivery stats:', analyticsError.response ? analyticsError.response.data : analyticsError.message);
        }

        // 4. Get User Engagement Metrics
        try {
            const userEngagement = await axios.get(`${BASE_URL}/analytics/user-engagement/test_user_001`);
            console.log('User Engagement Metrics:', userEngagement.data);
        } catch (engagementError: any) {
            console.error('Failed to fetch user engagement metrics:', engagementError.response ? engagementError.response.data : engagementError.message);
        }

        // 5. Get User Preferences
        try {
            const preferences = await axios.get(`${BASE_URL}/user-preferences/test_user_001`);
            console.log('User Preferences:', preferences.data);
        } catch (preferencesError: any) {
            console.error('Failed to fetch user preferences:', preferencesError.response ? preferencesError.response.data : preferencesError.message);
        }

    } catch (error: any) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
    }
}

testNotificationSystem();