import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeAuthData = async (token, user) => {
  try {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.log('Error storing auth data:', error);
  }
};

export const getAuthData = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const user = await AsyncStorage.getItem('user');
    return {
      token,
      user: user ? JSON.parse(user) : null,
    };
  } catch (error) {
    console.log('Error reading auth data:', error);
    return { token: null, user: null };
  }
};

export const clearAuthData = async () => {
  try {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  } catch (error) {
    console.log('Error clearing auth data:', error);
  }
};
