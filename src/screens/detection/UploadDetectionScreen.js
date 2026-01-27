import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  uploadViolationImage,
  uploadViolationVideo,
} from '../../services/violationService';
import { ViolationContext } from '../../context/ViolationContext';
import { COLORS } from '../../utils/constants';

const UploadDetectionScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const { addViolation } = useContext(ViolationContext);

  const uploadImage = async () => {
    try {
      setLoading(true);

      const options = {
        mediaType: 'mixed',
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
      };

      launchImageLibrary(options, async response => {
        if (response.didCancel) {
          setLoading(false);
          return;
        } else if (response.errorMessage) {
          Alert.alert('Error', response.errorMessage);
          setLoading(false);
          return;
        } else if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          const isVideo = asset.type && asset.type.startsWith('video/');
          const formData = new FormData();
          formData.append(isVideo ? 'video' : 'image', {
            uri: asset.uri,
            type: asset.type,
            name: asset.fileName || (isVideo ? 'video.mp4' : 'image.jpg'),
          });

          try {
            const detectionResult = isVideo
              ? await uploadViolationVideo(formData)
              : await uploadViolationImage(formData);

            // Build result from ML response
            const vehicleNumber = detectionResult.vehicleNumber || 'Unknown';
            const vehicleType = detectionResult.vehicle || 'unknown';
            const helmet = detectionResult.helmet;
            const seatbelt = detectionResult.seatbelt;
            const fine = detectionResult.fine || 0;

            const violations = [];
            if (vehicleType === 'bike' && helmet === false)
              violations.push('No Helmet');
            if (vehicleType === 'car' && seatbelt === false)
              violations.push('No Seatbelt');

            const result = {
              vehicleNumber,
              vehicleType,
              helmet,
              seatbelt,
              violations,
              fine,
            };

            // Always create violation records for detections (store in history)
            const violationTypes = [];
            if (vehicleType === 'bike' && helmet === false)
              violationTypes.push('Helmet');
            if (vehicleType === 'car' && seatbelt === false)
              violationTypes.push('Seatbelt');

            // Create separate violation for each type
            for (const violationType of violationTypes) {
              const violationData = {
                vehicleNumber,
                vehicleType,
                type: violationType,
                fine: 500,
                ...(isVideo
                  ? { videoUrl: asset.uri }
                  : { imageUrl: asset.uri }),
              };
              try {
                await addViolation(violationData);
              } catch (err) {
                console.log('Failed to create violation record:', err);
              }
            }

            // If no violations detected, still create a record for the detection
            if (violationTypes.length === 0) {
              const violationData = {
                vehicleNumber,
                vehicleType,
                type: 'Other', // No violation detected
                fine: 0,
                ...(isVideo
                  ? { videoUrl: asset.uri }
                  : { imageUrl: asset.uri }),
              };
              try {
                await addViolation(violationData);
              } catch (err) {
                console.log('Failed to create detection record:', err);
              }
            }

            navigation.navigate('Result', { result });
          } catch (error) {
            const serverMsg =
              error.response &&
              (error.response.data?.message || error.response.data);
            const msg = serverMsg || error.message;
            Alert.alert('Error', 'Detection failed: ' + msg);
          } finally {
            setLoading(false);
          }
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.uploadBtn} onPress={uploadImage}>
        <Text style={styles.uploadText}>
          {loading ? 'Processing...' : 'Upload Image / Video'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default UploadDetectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  uploadBtn: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 12,
  },
  uploadText: {
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
