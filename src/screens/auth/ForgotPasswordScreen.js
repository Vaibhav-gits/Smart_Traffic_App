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
import { forgotPassword } from '../../services/authService';
import { isValidEmail, isEmpty } from '../../utils/validation';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (isEmpty(email)) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const data = await forgotPassword(email);
      console.log('Forgot password response:', data);

      // If OTP is returned (for development/testing), navigate to reset screen
      if (data?.otp) {
        Alert.alert(
          'OTP Generated',
          `Your OTP is: ${data.otp}\n\nUse this to reset your password.`,
          [
            {
              text: 'OK',
              onPress: () =>
                navigation.navigate('ResetPassword', { email, otp: data.otp }),
            },
          ],
        );
      } else {
        Alert.alert(
          'Success',
          data?.message || 'Password reset instructions sent to your email',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('ResetPassword', { email }),
            },
          ],
        );
      }
    } catch (error) {
      console.log('Forgot password error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to send reset instructions. Please try again.';
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

            {/* Forgot Password Card */}
            <View style={styles.card}>
              <Text style={styles.description}>
                Enter your email address and we'll send you instructions to
                reset your password.
              </Text>

              <TextInput
                placeholder="Email Address"
                placeholderTextColor="#999"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />

              <TouchableOpacity
                style={[styles.resetButton, loading && { opacity: 0.6 }]}
                onPress={handleForgotPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.resetButtonText}>
                    SEND RESET INSTRUCTIONS
                  </Text>
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

export default ForgotPasswordScreen;

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
    marginBottom: 24,
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
