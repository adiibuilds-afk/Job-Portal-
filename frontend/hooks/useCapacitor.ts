import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { PushNotifications } from '@capacitor/push-notifications';
import { Badge } from '@capawesome/capacitor-badge';
import { StatusBar, Style } from '@capacitor/status-bar';
import { NavigationBar } from '@capgo/capacitor-navigation-bar';
import { useSession } from 'next-auth/react';
import axios from 'axios';

export const useCapacitor = () => {
    const { data: session } = useSession();

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        // --- 0. UI Styling (StatusBar & NavigationBar) ---
        const setupUI = async () => {
            try {
                // Style Status Bar
                await StatusBar.setStyle({ style: Style.Dark }); // Light text on Dark background
                await StatusBar.setBackgroundColor({ color: '#18181b' }); // matches zinc-900

                // Style Navigation Bar (Android only)
                if (Capacitor.getPlatform() === 'android') {
                    // @ts-ignore - The plugin types might be lagging or different
                    await NavigationBar.setNavigationBarColor({ color: '#18181b', darkButtons: false });
                }
            } catch (error) {
                console.warn('UI Styling Error:', error);
            }
        };
        setupUI();

        // --- 1. Handle Back Button ---
        const backButtonListener = App.addListener('backButton', ({ canGoBack }) => {
            if (canGoBack) {
                window.history.back();
            } else {
                App.exitApp();
            }
        });

        // --- 2. Push Notifications & Badges ---
        const setupPush = async () => {
            let permStatus = await PushNotifications.checkPermissions();

            if (permStatus.receive === 'prompt') {
                permStatus = await PushNotifications.requestPermissions();
            }

            if (permStatus.receive !== 'granted') {
                console.warn('User denied push notification permissions');
                return;
            }

            await PushNotifications.register();

            // Handle registration (token generation)
            PushNotifications.addListener('registration', async (token) => {
                console.log('Push registration success, token: ' + token.value);

                // If user is logged in, send token to backend
                if (session?.user?.email) {
                    try {
                        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile/fcm-token`, {
                            email: session.user.email,
                            token: token.value
                        });
                        console.log('FCM token saved to backend');
                    } catch (error) {
                        console.error('Failed to save FCM token:', error);
                    }
                }
            });

            PushNotifications.addListener('registrationError', (error) => {
                console.error('Error on registration: ' + JSON.stringify(error));
            });

            // Handle notification arrival while app is open
            PushNotifications.addListener('pushNotificationReceived', (notification) => {
                console.log('Push received: ' + JSON.stringify(notification));
                // Increment badge count if needed
                Badge.increase();
            });

            // Handle tapping on a notification
            PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
                console.log('Push action performed: ' + JSON.stringify(notification));
                const data = notification.notification.data;
                if (data && data.url) {
                    window.location.href = data.url;
                }
                // Clear badge when user opens a notification
                Badge.clear();
            });
        };

        setupPush();

        // Cleanup listeners
        return () => {
            backButtonListener.then(l => l.remove());
        };
    }, []);
};
