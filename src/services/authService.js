import api from './api';

export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data; // { user, token }
};

export const registerUser = async userData => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const forgotPassword = async email => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (otp, password) => {
  const response = await api.post('/auth/reset-password', { otp, password });
  return response.data;
};
