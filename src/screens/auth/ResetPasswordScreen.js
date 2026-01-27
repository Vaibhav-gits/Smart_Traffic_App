import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { resetPassword } from '../../services/authService';
import { COLORS, FONTS } from '../../utils/constants';
import { isEmpty } from '../../utils/validation';

const ResetPasswordScreen = ({ route }) => {
  const navigation = useNavigation();
  const { email, otp: initialOtp } = route.params || {}; // If email and otp are passed

  const [otp, setOtp] = useState(initialOtp || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (isEmpty(otp)) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    if (isEmpty(password)) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const data = await resetPassword(otp, password);
      console.log('Reset password response:', data);

      Alert.alert('Success', data?.message || 'Password reset successful', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error) {
      console.log('Reset password error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to reset password. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Logo Section */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoIcon}>🚦</Text>
              </View>
              <Text style={styles.appName}>Smart Traffic</Text>
              <Text style={styles.subtitle}>Reset Your Password</Text>
            </View>

            {/* Reset Password Card */}
            <View style={styles.card}>
              <Text style={styles.description}>
                Enter the OTP sent to your email and your new password.
              </Text>

              <TextInput
                placeholder="OTP"
                placeholderTextColor="#999"
                style={styles.input}
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                maxLength={6}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />

              <TextInput
                placeholder="New Password"
                placeholderTextColor="#999"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />

              <TextInput
                placeholder="Confirm New Password"
                placeholderTextColor="#999"
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />

              <TouchableOpacity
                style={[styles.resetButton, loading && { opacity: 0.6 }]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.resetButtonText}>RESET PASSWORD</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backContainer}
                onPress={() => navigation.navigate('Login')}
                disabled={loading}
              >
                <Text style={styles.backText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  content: {
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  logoIcon: {
    fontSize: 50,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
    color: '#333',
  },
  resetButton: {
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backContainer: {
    alignItems: 'center',
    paddingTop: 10,
  },
  backText: {
    fontSize: 14,
    color: '#E53935',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
