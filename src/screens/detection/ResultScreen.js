import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../utils/constants';

const ResultScreen = ({ route }) => {
  const { result } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Detection Result</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Vehicle Number</Text>
        <Text style={styles.value}>{result.vehicleNumber}</Text>

        <Text style={styles.label}>Vehicle Type</Text>
        <Text style={styles.value}>{result.vehicleType}</Text>

        {result.vehicleType === 'bike' && (
          <>
            <Text style={styles.label}>Helmet</Text>
            <Text style={styles.value}>
              {result.helmet ? 'Wearing' : 'Not Wearing'}
            </Text>
          </>
        )}

        {result.vehicleType === 'car' && (
          <>
            <Text style={styles.label}>Seatbelt</Text>
            <Text style={styles.value}>
              {result.seatbelt ? 'Wearing' : 'Not Wearing'}
            </Text>
          </>
        )}

        <Text style={styles.label}>Violations</Text>
        {result.violations && result.violations.length > 0 ? (
          result.violations.map((v, index) => (
            <Text key={index} style={styles.violation}>
              {v}
            </Text>
          ))
        ) : (
          <Text style={styles.value}>No Violations</Text>
        )}

        <Text style={styles.fine}>Fine: ₹{result.fine}</Text>
      </View>
    </View>
  );
};

export default ResultScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  heading: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
  },
  label: {
    fontSize: FONTS.small,
    color: COLORS.gray,
  },
  value: {
    fontSize: FONTS.medium,
    marginBottom: 10,
  },
  violation: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  fine: {
    marginTop: 15,
    fontSize: FONTS.medium,
    fontWeight: 'bold',
  },
});
