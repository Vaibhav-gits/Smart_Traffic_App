import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ViolationContext } from '../../context/ViolationContext';
import { COLORS, FONTS } from '../../utils/constants';

const AnalyticsScreen = () => {
  const { violations, fetchViolations } = useContext(ViolationContext);
  const [analytics, setAnalytics] = useState({
    totalViolations: 0,
    totalFine: 0,
    totalVehiclesChecked: 0,
    totalNotifications: 0,
    bikeViolations: 0,
    carViolations: 0,
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      await fetchViolations();
      calculateAnalytics();
    } catch (error) {
      console.log('Error loading analytics:', error);
    }
  };

  const calculateAnalytics = () => {
    if (violations.length === 0) return;

    let helmetCount = 0;
    let seatbeltCount = 0;
    let bikeCount = 0;
    let carCount = 0;
    let totalFine = 0;
    let totalNotifications = 0;
    const uniqueVehicles = new Set();

    violations.forEach(violation => {
      if (violation.type === 'Helmet') helmetCount++;
      if (violation.type === 'Seatbelt') seatbeltCount++;
      if (violation.vehicleType === 'bike') bikeCount++;
      if (violation.vehicleType === 'car') carCount++;

      totalFine += violation.fine || 0;
      uniqueVehicles.add(violation.vehicleNumber);
      totalNotifications++;
    });

    const total = violations.length;
    const bikePercentage =
      total > 0 ? Math.round((bikeCount / total) * 100) : 0;
    const carPercentage = total > 0 ? Math.round((carCount / total) * 100) : 0;

    setAnalytics({
      totalViolations: total,
      totalFine,
      totalVehiclesChecked: uniqueVehicles.size,
      totalNotifications,
      bikeViolations: bikePercentage,
      carViolations: carPercentage,
      helmetCount,
      seatbeltCount,
    });
  };

  useEffect(() => {
    calculateAnalytics();
  }, [violations]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Analytics</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Total Violations</Text>
        <Text style={styles.value}>{analytics.totalViolations}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Bike Violations</Text>
        <Text style={styles.value}>{analytics.bikeViolations}%</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Car Violations</Text>
        <Text style={styles.value}>{analytics.carViolations}%</Text>
      </View>

      {/* Violation Types Distribution Chart */}
      {analytics.totalViolations > 0 &&
        (analytics.helmetCount > 0 || analytics.seatbeltCount > 0) && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Violation Types Distribution</Text>

            <View style={styles.chartContainer}>
              {analytics.helmetCount > 0 && (
                <View style={styles.chartItem}>
                  <View style={styles.chartLabelContainer}>
                    <View
                      style={[
                        styles.chartColor,
                        { backgroundColor: COLORS.primary },
                      ]}
                    />
                    <Text style={styles.chartLabel}>Helmet</Text>
                  </View>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          backgroundColor: COLORS.primary,
                          width: `${
                            (analytics.helmetCount /
                              analytics.totalViolations) *
                            100
                          }%`,
                        },
                      ]}
                    />
                    <Text style={styles.barValue}>{analytics.helmetCount}</Text>
                  </View>
                </View>
              )}

              {analytics.seatbeltCount > 0 && (
                <View style={styles.chartItem}>
                  <View style={styles.chartLabelContainer}>
                    <View
                      style={[
                        styles.chartColor,
                        { backgroundColor: '#FF9800' },
                      ]}
                    />
                    <Text style={styles.chartLabel}>Seatbelt</Text>
                  </View>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          backgroundColor: '#FF9800',
                          width: `${
                            (analytics.seatbeltCount /
                              analytics.totalViolations) *
                            100
                          }%`,
                        },
                      ]}
                    />
                    <Text style={styles.barValue}>
                      {analytics.seatbeltCount}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
    </View>
  );
};

export default AnalyticsScreen;

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
    marginBottom: 15,
    elevation: 3,
  },
  label: {
    color: COLORS.gray,
    fontSize: FONTS.small,
  },
  value: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    marginTop: 5,
    color: COLORS.primary,
  },
  chartCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
  },
  chartTitle: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: COLORS.primary,
  },

  chartContainer: {
    marginTop: 10,
  },
  chartItem: {
    marginBottom: 15,
  },
  chartLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  chartColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  chartLabel: {
    fontSize: FONTS.small,
    color: COLORS.gray,
    fontWeight: 'bold',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 15,
    minWidth: 30,
  },
  barValue: {
    position: 'absolute',
    right: 10,
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: FONTS.small,
  },
});
