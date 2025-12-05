import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useThemeCustomization } from '@/contexts/ThemeContext';
import { useStats } from '@/hooks/useStats';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  color?: string;
}

const profileMenuItems: MenuItem[] = [
  { icon: 'person-outline', title: 'Edit Profile', subtitle: 'Update your personal information' },
  { icon: 'settings-outline', title: 'Settings', subtitle: 'App preferences and configuration' },
  { icon: 'notifications-outline', title: 'Notifications', subtitle: 'Manage notification settings' },
  { icon: 'shield-checkmark-outline', title: 'Privacy & Security', subtitle: 'Manage your privacy settings' },
];

const supportMenuItems: MenuItem[] = [
  { icon: 'help-circle-outline', title: 'Help Center', subtitle: 'Get help and support' },
  { icon: 'star-outline', title: 'Rate App', subtitle: 'Share your feedback' },
  { icon: 'information-circle-outline', title: 'About', subtitle: 'Version 1.0.0' },
];

export default function ProfilePage() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { customColors, setCustomColors, presetColors } = useThemeCustomization();
  const { stats } = useStats();
  const [colorPickerExpanded, setColorPickerExpanded] = useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={[styles.avatarContainer, { backgroundColor: customColors.primaryButton }]}>
          <Ionicons name="person" size={48} color="white" />
        </View>
        <Text style={[styles.name, { color: theme.text }]}>John Doe</Text>
        <Text style={[styles.email, { color: theme.textSecondary }]}>johndoe@example.com</Text>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          onPress={() => console.log('Edit profile')}
        >
          <Ionicons name="create-outline" size={18} color={customColors.primaryButton} />
          <Text style={[styles.editButtonText, { color: customColors.primaryButton }]}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View style={[styles.statsContainer, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>{stats?.totalWorkouts || 0}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Workouts</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.cardBorder }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>{stats?.currentStreak || 0}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Day Streak</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.cardBorder }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>{stats?.activeTime || 0}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Hours</Text>
        </View>
      </View>

      

      {/* Profile Options */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Account</Text>
        <View style={[styles.menuCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          {profileMenuItems.map((item, index) => (
            <React.Fragment key={item.title}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => console.log(item.title)}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconContainer, { backgroundColor: `${customColors.primaryButton}15` }]}>
                    <Ionicons name={item.icon} size={22} color={customColors.primaryButton} />
                  </View>
                  <View style={styles.menuItemText}>
                    <Text style={[styles.menuItemTitle, { color: theme.text }]}>{item.title}</Text>
                    {item.subtitle && (
                      <Text style={[styles.menuItemSubtitle, { color: theme.textSecondary }]}>
                        {item.subtitle}
                      </Text>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
              {index < profileMenuItems.length - 1 && (
                <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* Theme Customization */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
        <View style={[styles.menuCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setColorPickerExpanded(!colorPickerExpanded)}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: `${customColors.primaryButton}15` }]}>
                <Ionicons name="color-palette-outline" size={22} color={customColors.primaryButton} />
              </View>
              <View style={styles.menuItemText}>
                <Text style={[styles.menuItemTitle, { color: theme.text }]}>Button Color</Text>
                <Text style={[styles.menuItemSubtitle, { color: theme.textSecondary }]}>
                  Customize your primary action button
                </Text>
              </View>
            </View>
            <Ionicons
              name={colorPickerExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>

          {/* Color Picker Expanded */}
          {colorPickerExpanded && (
            <View style={styles.colorPickerContainer}>
              <View style={styles.colorGrid}>
                {presetColors.map((preset) => (
                  <View key={preset.name} style={styles.colorOptionContainer}>
                    <TouchableOpacity
                      style={[
                        styles.colorOption,
                        { backgroundColor: preset.button },
                        customColors.primaryButton === preset.button && {
                          borderColor: theme.text,
                          borderWidth: 3,
                        },
                      ]}
                      onPress={() => {
                        setCustomColors({ primaryButton: preset.button, primaryButtonText: preset.text });
                      }}
                      activeOpacity={0.7}
                    >
                      {customColors.primaryButton === preset.button && (
                        <Ionicons name="checkmark" size={24} color="white" />
                      )}
                    </TouchableOpacity>
                    <Text
                      style={[
                        styles.colorLabel,
                        { color: theme.textSecondary },
                        customColors.primaryButton === preset.button && {
                          color: theme.text,
                          fontWeight: '700',
                        },
                      ]}
                    >
                      {preset.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Support Options */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Support</Text>
        <View style={[styles.menuCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          {supportMenuItems.map((item, index) => (
            <React.Fragment key={item.title}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => console.log(item.title)}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconContainer, { backgroundColor: `${customColors.primaryButton}15` }]}>
                    <Ionicons name={item.icon} size={22} color={customColors.primaryButton} />
                  </View>
                  <View style={styles.menuItemText}>
                    <Text style={[styles.menuItemTitle, { color: theme.text }]}>{item.title}</Text>
                    {item.subtitle && (
                      <Text style={[styles.menuItemSubtitle, { color: theme.textSecondary }]}>
                        {item.subtitle}
                      </Text>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
              {index < supportMenuItems.length - 1 && (
                <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: theme.card, borderColor: '#ff6b6b' }]}
        onPress={() => console.log('Logout')}
      >
        <Ionicons name="log-out-outline" size={22} color="#ff6b6b" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: '100%',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  menuCard: {
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  divider: {
    height: 1,
    marginLeft: 72,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff6b6b',
  },
  colorPickerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#00000010',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOptionContainer: {
    alignItems: 'center',
    gap: 8,
  },
  colorOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  colorLabel: {
    width: 56,
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
});
