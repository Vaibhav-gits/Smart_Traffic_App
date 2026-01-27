import React, { useContext, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { ViolationContext } from '../../context/ViolationContext';
import { COLORS, FONTS } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';

const HistoryScreen = () => {
  const { violations, fetchViolations, loading } = useContext(ViolationContext);

  useEffect(() => {
    loadViolations();
  }, []);

  const loadViolations = async () => {
    try {
      await fetchViolations();
    } catch (error) {
      console.log('Error fetching violations:', error);
      // Optionally, show an error message to the user
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Violation History</Text>

      <FlatList
        data={violations}
        keyExtractor={item => String(item.id || item._id || Math.random())}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.vehicle}>{item.vehicleNumber}</Text>
            <Text style={styles.violation}>{item.type}</Text>
            <Text style={styles.date}>
              {formatDate(item.createdAt || item.date)}
            </Text>
            <Text style={styles.fine}>₹{item.fine}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  heading: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  vehicle: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
  },
  violation: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginTop: 3,
  },
  date: {
    fontSize: FONTS.small,
    color: COLORS.gray,
    marginTop: 3,
  },
  fine: {
    marginTop: 5,
    fontWeight: 'bold',
  },
});
