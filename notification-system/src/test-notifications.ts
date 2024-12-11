import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/v1';

async function testNotificationSystem() {
    try {
        // 1. Create User Preferences
        const userPreferences = await axios.post(`${BASE_URL}/user-preferences`, {
            userId: 'test_user_001',
            channels: ['email', 'sms', 'push'],
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
                types: ['email'],
                priority: 'low'
            },
            {
                userId: 'test_user_001',
                message: 'Urgent Security Alert',
                types: ['push', 'sms'],
                priority: 'urgent'
            },
            {
                userId: 'test_user_001',
                message: 'Scheduled Weekly Report',
                types: ['email'],
                priority: 'medium',
                sendTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }
        ];

        const sentNotifications = [];
        for (let notification of notifications) {
            try {
                const result = await axios.post(`${BASE_URL}/notifications/notify`, notification);
                sentNotifications.push(result.data);
                console.log('Notification Sent:', result.data);
            } catch (notificationError) {
                if (axios.isAxiosError(notificationError)) {
                    console.error('Failed to send notification:', notificationError.response ? notificationError.response.data : notificationError.message);
                } else {
                    console.error('Failed to send notification:', notificationError);
                }
            }
        }

        // 3. Get Analytics
        try {
            const analytics = await axios.get(`${BASE_URL}/notifications/analytics`);
            console.log('Analytics:', analytics.data);
        } catch (analyticsError) {
            if (axios.isAxiosError(analyticsError)) {
                console.error('Failed to fetch analytics:', analyticsError.response ? analyticsError.response.data : analyticsError.message);
            } else {
                console.error('Failed to fetch analytics:', analyticsError);
            }
        }

        // 4. Get User Preferences
        try {
            const preferences = await axios.get(`${BASE_URL}/user-preferences?userId=test_user_001`);
            console.log('User Preferences:', preferences.data);
        } catch (preferencesError) {
            if (axios.isAxiosError(preferencesError)) {
                console.error('Failed to fetch user preferences:', preferencesError.response ? preferencesError.response.data : preferencesError.message);
            } else {
                console.error('Failed to fetch user preferences:', preferencesError);
            }
        }

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Test Failed:', error.response ? error.response.data : error.message);
        } else {
            console.error('Test Failed:', error);
        }
    }
}

testNotificationSystem();