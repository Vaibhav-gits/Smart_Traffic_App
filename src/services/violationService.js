import { api, mlApi } from './api';

/**
 * Fetch all violations
 */
export const fetchViolations = async () => {
  const response = await api.get('/violations/my');
  return response.data;
};

/**
 * Fetch violation by ID
 */
export const fetchViolationById = async id => {
  const response = await api.get(`/violations/${id}`);
  return response.data;
};

/**
 * Upload image for detection
 */
export const uploadViolationImage = async formData => {
  const response = await mlApi.post('/detect/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Upload video for detection
 */
export const uploadViolationVideo = async formData => {
  const response = await api.post('/detect/video', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Create a new violation
 */
export const createViolation = async violationData => {
  const response = await api.post('/violations', violationData);
  return response.data;
};

/**
 * Get all violations (alias for fetchViolations for backward compatibility)
 */
export const getViolations = async () => {
  return await fetchViolations();
};

/**
 * Update violation payment status
 */
export const updatePaymentStatus = async (violationId, status) => {
  const response = await api.put(`/violations/${violationId}/payment`, {
    status,
  });
  return response.data;
};
