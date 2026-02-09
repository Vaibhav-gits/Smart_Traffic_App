import api from './api';

/**
 * Send SMS notification to violator
 */
export const sendSMSNotification = async (payload) => {
  const response = await api.post('/notifications/sms', payload);
  return response.data;
};

/**
 * Send push notification (Firebase)
 */
export const sendPushNotification = async (payload) => {
  const response = await api.post('/notifications/push', payload);
  return response.data;
};
