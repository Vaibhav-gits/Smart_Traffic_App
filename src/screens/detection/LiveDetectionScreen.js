import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { COLORS, FONTS } from '../../utils/constants';
import { uploadViolationImage } from '../../services/violationService';
import { ViolationContext } from '../../context/ViolationContext';

const LiveDetectionScreen = ({ navigation }) => {
  const [status, setStatus] = useState('Idle');
  const [isDetecting, setIsDetecting] = useState(false);
  const { addViolation } = useContext(ViolationContext);

  const device = useCameraDevice('back') || useCameraDevice('front');
  const cameraRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, []);

  const requestPermission = async () => {
    const status = await Camera.getCameraPermissionStatus();
    if (status !== 'authorized') {
      const newStatus = await Camera.requestCameraPermission();
      return newStatus === 'authorized';
    }
    return true;
  };

  const takeAndSend = async () => {
    try {
      if (!cameraRef.current) return;
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'speed',
      });
      const uri =
        photo.path && !photo.path.startsWith('file://')
          ? 'file://' + photo.path
          : photo.path;

      const formData = new FormData();
      formData.append('image', {
        uri,
        type: 'image/jpeg',
        name: 'live.jpg',
      });

      const detectionResult = await uploadViolationImage(formData);

      const violations = [];
      if (detectionResult.vehicle === 'bike' && !detectionResult.helmet)
        violations.push('Helmet');
      if (detectionResult.vehicle === 'car' && !detectionResult.seatbelt)
        violations.push('Seatbelt');

      // Create separate violation for each type
      for (const violationType of violations) {
        const violationData = {
          vehicleNumber: detectionResult.vehicleNumber || 'Unknown',
          vehicleType: detectionResult.vehicle,
          type: violationType,
          fine: 500,
          imageUrl: uri,
        };
        try {
          await addViolation(violationData);
        } catch (e) {
          console.warn('Failed to create violation:', e.message);
        }
      }
    } catch (error) {
      // If many errors occur, notify user once
      console.warn('Live detection error', error?.message || error);
    }
  };

  const startDetection = async () => {
    const ok = await requestPermission();
    if (!ok) {
      Alert.alert(
        'Permission required',
        'Camera permission is required for live detection',
      );
      return;
    }

    setStatus('Detecting Violations...');
    setIsDetecting(true);

    // Capture every 3 seconds
    intervalRef.current = setInterval(() => {
      takeAndSend();
    }, 3000);
  };

  const stopDetection = () => {
    setIsDetecting(false);
    setStatus('Idle');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cameraBox}>
        {device ? (
          <Camera
            ref={cameraRef}
            style={styles.camera}
            device={device}
            isActive={isDetecting}
            photo={true}
          />
        ) : (
          <Text style={styles.cameraText}>Camera not available</Text>
        )}
      </View>

      <Text style={styles.status}>{status}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={isDetecting ? stopDetection : startDetection}
      >
        <Text style={styles.buttonText}>
          {isDetecting ? 'Stop Detection' : 'Start Detection'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.uploadButton]}
        onPress={() => navigation.navigate('Upload Detection')}
      >
        <Text style={styles.buttonText}>Upload Image / Video</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LiveDetectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  camera: {
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
  },
  status: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: FONTS.small,
  },
  resultContainer: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  resultText: {
    fontSize: FONTS.small,
    marginBottom: 5,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: COLORS.secondary,
  },
});
