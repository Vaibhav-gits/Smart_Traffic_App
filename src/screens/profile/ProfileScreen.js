import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { AuthContext } from '../../context/AuthContext';
import { COLORS, FONTS } from '../../utils/constants';

const ProfileScreen = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={COLORS.white} />
        </View>

        <Text style={styles.name}>{user?.name || 'Officer Name'}</Text>

        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {user?.role?.toUpperCase() || 'POLICE'}
          </Text>
        </View>

        {user?.station && (
          <Text style={styles.station}>
            <MaterialCommunityIcons
              name="police-station"
              size={16}
              color={COLORS.gray}
            />{' '}
            {user.station}
          </Text>
        )}
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <InfoRow
          icon="mail"
          label="Email"
          value={user?.email || 'officer@traffic.com'}
        />

        <InfoRow
          icon="checkmark-circle"
          label="Account Status"
          value="Active"
          valueColor={COLORS.success}
        />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <MaterialCommunityIcons
          name="logout"
          size={20}
          color={COLORS.white}
        />
        <Text style={styles.logoutText}> Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

/* ---------- Reusable Row ---------- */
const InfoRow = ({ icon, label, value, valueColor }) => (
  <View style={styles.row}>
    <Ionicons name={icon} size={20} color={COLORS.primary} />
    <View style={{ marginLeft: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor || COLORS.black }]}>
        {value}
      </Text>
    </View>
  </View>
);

export default ProfileScreen;

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },

  profileCard: {
    backgroundColor: COLORS.white,
    padding: 25,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  name: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
  },

  roleBadge: {
    marginTop: 5,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },

  roleText: {
    color: COLORS.primary,
    fontSize: FONTS.small,
    fontWeight: 'bold',
  },

  station: {
    marginTop: 8,
    fontSize: FONTS.small,
    color: COLORS.gray,
  },

  infoCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 14,
    elevation: 3,
    marginBottom: 30,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  label: {
    fontSize: FONTS.small,
    color: COLORS.gray,
  },

  value: {
    fontSize: FONTS.medium,
    fontWeight: '500',
  },

  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 12,
  },

  logoutText: {
    color: COLORS.white,
    fontSize: FONTS.medium,
    fontWeight: 'bold',
  },
});
