import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { ViolationContext } from '../../context/ViolationContext';
import { COLORS, FONTS } from '../../utils/constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const DashboardScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { violations, fetchViolations } = useContext(ViolationContext);
  const [stats, setStats] = useState({
    todayViolations: 0,
    totalFine: 0,
    vehiclesChecked: 0,
    notificationsSent: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await fetchViolations();
      calculateStats();
    } catch (error) {
      console.log('Error loading dashboard data:', error);
    }
  };

  const calculateStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let todayViolations = 0;
    let todayFine = 0;
    let todayVehiclesChecked = 0;
    let todayNotifications = 0;
    const todayUniqueVehicles = new Set();

    violations.forEach(violation => {
      const violationDate = new Date(violation.createdAt);
      violationDate.setHours(0, 0, 0, 0);

      if (violationDate.getTime() === today.getTime()) {
        todayViolations++;
        todayFine += violation.fine || 0;
        todayUniqueVehicles.add(violation.vehicleNumber);
        todayNotifications++;
      }
    });

    todayVehiclesChecked = todayUniqueVehicles.size;

    setStats({
      todayViolations,
      totalFine: todayFine,
      vehiclesChecked: todayVehiclesChecked,
      notificationsSent: todayNotifications,
    });
  };

  useEffect(() => {
    calculateStats();
  }, [violations]);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Dashboard</Text>
        <Text style={styles.sub}>Welcome, {user?.name}</Text>
      </View>

      {/* Cards */}
      <View style={styles.cardRow}>
        <View style={[styles.card, styles.shadow]}>
          <Ionicons name="warning-outline" size={28} color={COLORS.primary} />
          <Text style={styles.cardValue}>{stats.todayViolations}</Text>
          <Text style={styles.cardTitle}>Today's Violations</Text>
        </View>

        <View style={[styles.card, styles.shadow]}>
          <MaterialCommunityIcons
            name="currency-inr"
            size={28}
            color={COLORS.primary}
          />
          <Text style={styles.cardValue}>₹{stats.totalFine}</Text>
          <Text style={styles.cardTitle}>Today's Fine</Text>
        </View>
      </View>

      <View style={styles.cardRow}>
        <View style={[styles.card, styles.shadow]}>
          <Ionicons name="car-sport-outline" size={28} color={COLORS.primary} />
          <Text style={styles.cardValue}>{stats.vehiclesChecked}</Text>
          <Text style={styles.cardTitle}>Today's Vehicles</Text>
        </View>

        <View style={[styles.card, styles.shadow]}>
          <Ionicons
            name="notifications-outline"
            size={28}
            color={COLORS.primary}
          />
          <Text style={styles.cardValue}>{stats.notificationsSent}</Text>
          <Text style={styles.cardTitle}>Today's Notifications</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('Analytics')}
      >
        <Text style={styles.btnText}>View Analytics</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  heading: {
    fontSize: FONTS.xLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  sub: {
    color: COLORS.gray,
    marginTop: 5,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  card: {
    width: '48%',
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  cardTitle: {
    fontSize: FONTS.small,
    color: COLORS.gray,
    marginTop: 10,
    textAlign: 'center',
  },
  cardValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 5,
  },
  btn: {
    marginTop: 25,
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 12,
  },
  btnText: {
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: FONTS.medium,
  },
  btnOutline: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: 15,
    borderRadius: 12,
  },
  btnOutlineText: {
    color: COLORS.primary,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: FONTS.medium,
  },
});
