import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, useColorScheme, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as WebBrowser from 'expo-web-browser';
import { useThemeCustomization } from '@/contexts/ThemeContext';
import { exportToFile, importFromFile, getStorageStats } from '@/services/storage/storage-export';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  color?: string;
}

const supportMenuItems: MenuItem[] = [
  {
    icon: 'help-circle-outline',
    title: 'Help Center',
    subtitle: 'Get help and support',
    onPress: () => WebBrowser.openBrowserAsync('https://bolic.ca/support'),
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Privacy Policy',
    subtitle: 'How your data is handled',
    onPress: () => WebBrowser.openBrowserAsync('https://bolic.ca/privacy-policy'),
  },
  { icon: 'star-outline', title: 'Rate App', subtitle: 'Share your feedback' },
  { icon: 'information-circle-outline', title: 'About', subtitle: 'Version 1.0.0' },
];

export default function ProfilePage() {
  const colorScheme = useColorScheme();
  const { customColors, setCustomColors, presetColors, preferences, setWeightUnit, setShowRir, setShowRpe, setShowNotes } = useThemeCustomization();
  const [colorPickerExpanded, setColorPickerExpanded] = useState(false);
  const [storageStats, setStorageStats] = useState<{ totalKeys: number; totalSize: number } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const isDark = colorScheme === 'dark';

  // Load storage stats on mount
  useEffect(() => {
    loadStorageStats();
  }, []);

  async function loadStorageStats() {
    const stats = await getStorageStats();
    setStorageStats(stats);
  }

  // Athletic color palette
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const accent = customColors.primaryButton;
  const palette = {
    bg: isDark ? '#0A0A0B' : '#FAFAF9',
    cardBg: isDark ? '#141416' : '#FFFFFF',
    cardBorder: isDark ? '#2A2A2E' : '#E8E8E6',
    text: isDark ? '#FAFAFA' : '#0A0A0B',
    textMuted: isDark ? '#71717A' : '#71717A',
    accent,
    accentGlow: isDark ? hexToRgba(accent, 0.15) : hexToRgba(accent, 0.08),
    danger: '#EF4444',
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      await exportToFile();
      Alert.alert(
        'Export Successful',
        'Your data has been exported. Keep this file safe to restore your data later.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Export Failed', error instanceof Error ? error.message : 'An unknown error occurred');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    Alert.alert(
      'Import Data',
      'Choose how to import your data:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Merge with Existing',
          onPress: () => performImport(true),
        },
        {
          text: 'Replace All Data',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Replace',
              'This will delete all current data and replace it with the imported data. This cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Replace', style: 'destructive', onPress: () => performImport(false) },
              ]
            );
          },
        },
      ]
    );
  };

  const performImport = async (mergeMode: boolean) => {
    try {
      setIsImporting(true);

      // Pick a file
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setIsImporting(false);
        return;
      }

      const fileUri = result.assets[0].uri;
      await importFromFile(fileUri, mergeMode);

      Alert.alert(
        'Import Successful',
        'Your data has been imported. Please restart the app for changes to take effect.',
        [{ text: 'OK' }]
      );

      // Reload storage stats
      await loadStorageStats();
    } catch (error) {
      Alert.alert('Import Failed', error instanceof Error ? error.message : 'An unknown error occurred');
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleResetAllData = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete ALL your data including:\n\n• All workout sessions\n• All programs\n• All exercises\n• All statistics\n• All settings\n\nThis action CANNOT be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'This is your last chance. All data will be permanently deleted.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete All Data',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await AsyncStorage.clear();
                      Alert.alert(
                        'Data Cleared',
                        'All data has been deleted. Please restart the app.',
                        [{ text: 'OK' }]
                      );
                      await loadStorageStats();
                    } catch (error) {
                      Alert.alert('Error', 'Failed to clear data. Please try again.');
                      console.error('Error clearing AsyncStorage:', error);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerLabel, { color: palette.textMuted }]}>PREFERENCES</Text>
          <Text style={[styles.headerTitle, { color: palette.text }]}>Settings</Text>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionBadge, { backgroundColor: palette.accentGlow }]}>
              <Text style={[styles.sectionBadgeText, { color: palette.accent }]}>APPEARANCE</Text>
            </View>
          </View>
          <View style={[styles.menuCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setColorPickerExpanded(!colorPickerExpanded)}
              activeOpacity={0.8}
            >
              <View style={[styles.menuIcon, { backgroundColor: palette.accentGlow }]}>
                <Ionicons name="color-palette" size={20} color={palette.accent} />
              </View>
              <View style={styles.menuText}>
                <Text style={[styles.menuTitle, { color: palette.text }]}>Button Color</Text>
                <Text style={[styles.menuSubtitle, { color: palette.textMuted }]}>Customize accent color</Text>
              </View>
              <View style={[styles.colorPreview, { backgroundColor: palette.accent }]} />
              <Ionicons name={colorPickerExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={palette.textMuted} />
            </TouchableOpacity>

            {colorPickerExpanded && (
              <View style={[styles.colorPicker, { borderTopColor: palette.cardBorder }]}>
                <View style={styles.colorGrid}>
                  {presetColors.map((preset) => (
                    <TouchableOpacity
                      key={preset.name}
                      style={styles.colorOption}
                      onPress={() => setCustomColors({ primaryButton: preset.button, primaryButtonText: preset.text })}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.colorCircle,
                          { backgroundColor: preset.button },
                          customColors.primaryButton === preset.button && styles.colorCircleSelected,
                        ]}
                      >
                        {customColors.primaryButton === preset.button && (
                          <Ionicons name="checkmark" size={18} color="#FFF" />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.colorName,
                          { color: palette.textMuted },
                          customColors.primaryButton === preset.button && { color: palette.text, fontWeight: '600' },
                        ]}
                      >
                        {preset.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={[styles.menuDivider, { backgroundColor: palette.cardBorder }]} />

            {/* Weight Unit Toggle */}
            <View style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: palette.accentGlow }]}>
                <Ionicons name="barbell" size={20} color={palette.accent} />
              </View>
              <View style={styles.menuText}>
                <Text style={[styles.menuTitle, { color: palette.text }]}>Weight Unit</Text>
                <Text style={[styles.menuSubtitle, { color: palette.textMuted }]}>Choose pounds or kilograms</Text>
              </View>
              <View style={styles.unitToggle}>
                <TouchableOpacity
                  style={[
                    styles.unitOption,
                    { backgroundColor: preferences.weightUnit === 'lbs' ? palette.accent : 'transparent' },
                  ]}
                  onPress={() => setWeightUnit('lbs')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.unitOptionText,
                      { color: preferences.weightUnit === 'lbs' ? '#FFF' : palette.textMuted },
                    ]}
                  >
                    lbs
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.unitOption,
                    { backgroundColor: preferences.weightUnit === 'kg' ? palette.accent : 'transparent' },
                  ]}
                  onPress={() => setWeightUnit('kg')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.unitOptionText,
                      { color: preferences.weightUnit === 'kg' ? '#FFF' : palette.textMuted },
                    ]}
                  >
                    kg
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.menuDivider, { backgroundColor: palette.cardBorder }]} />

            {/* Show RIR Toggle */}
            <View style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: palette.accentGlow }]}>
                <Ionicons name="layers-outline" size={20} color={palette.accent} />
              </View>
              <View style={styles.menuText}>
                <Text style={[styles.menuTitle, { color: palette.text }]}>Show RIR</Text>
                <Text style={[styles.menuSubtitle, { color: palette.textMuted }]}>Reps in Reserve tracking</Text>
              </View>
              <Switch
                value={preferences.showRir}
                onValueChange={setShowRir}
                trackColor={{ false: palette.cardBorder, true: palette.accent }}
                thumbColor="#FFF"
              />
            </View>

            <View style={[styles.menuDivider, { backgroundColor: palette.cardBorder }]} />

            {/* Show RPE Toggle */}
            <View style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: palette.accentGlow }]}>
                <Ionicons name="speedometer-outline" size={20} color={palette.accent} />
              </View>
              <View style={styles.menuText}>
                <Text style={[styles.menuTitle, { color: palette.text }]}>Show RPE</Text>
                <Text style={[styles.menuSubtitle, { color: palette.textMuted }]}>Rate of Perceived Exertion tracking</Text>
              </View>
              <Switch
                value={preferences.showRpe}
                onValueChange={setShowRpe}
                trackColor={{ false: palette.cardBorder, true: palette.accent }}
                thumbColor="#FFF"
              />
            </View>

            <View style={[styles.menuDivider, { backgroundColor: palette.cardBorder }]} />

            {/* Show Notes Toggle */}
            <View style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: palette.accentGlow }]}>
                <Ionicons name="document-text-outline" size={20} color={palette.accent} />
              </View>
              <View style={styles.menuText}>
                <Text style={[styles.menuTitle, { color: palette.text }]}>Show Notes</Text>
                <Text style={[styles.menuSubtitle, { color: palette.textMuted }]}>Set notes field during workouts</Text>
              </View>
              <Switch
                value={preferences.showNotes}
                onValueChange={setShowNotes}
                trackColor={{ false: palette.cardBorder, true: palette.accent }}
                thumbColor="#FFF"
              />
            </View>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Support</Text>
          </View>
          <View style={[styles.menuCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
            {supportMenuItems.map((item, index) => (
              <React.Fragment key={item.title}>
                <TouchableOpacity style={styles.menuItem} activeOpacity={0.8} onPress={item.onPress} disabled={!item.onPress}>
                  <View style={[styles.menuIcon, { backgroundColor: palette.accentGlow }]}>
                    <Ionicons name={item.icon} size={20} color={palette.accent} />
                  </View>
                  <View style={styles.menuText}>
                    <Text style={[styles.menuTitle, { color: palette.text }]}>{item.title}</Text>
                    {item.subtitle && <Text style={[styles.menuSubtitle, { color: palette.textMuted }]}>{item.subtitle}</Text>}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />
                </TouchableOpacity>
                {index < supportMenuItems.length - 1 && <View style={[styles.menuDivider, { backgroundColor: palette.cardBorder }]} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Data Management</Text>
          </View>

          {/* Storage Stats Card */}
          {storageStats && (
            <View style={[styles.storageStatsCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
              <View style={styles.storageStatsRow}>
                <View style={styles.storageStatItem}>
                  <Text style={[styles.storageStatLabel, { color: palette.textMuted }]}>Total Items</Text>
                  <Text style={[styles.storageStatValue, { color: palette.text }]}>{storageStats.totalKeys}</Text>
                </View>
                <View style={styles.storageStatDivider} />
                <View style={styles.storageStatItem}>
                  <Text style={[styles.storageStatLabel, { color: palette.textMuted }]}>Storage Size</Text>
                  <Text style={[styles.storageStatValue, { color: palette.text }]}>
                    {(storageStats.totalSize / 1024).toFixed(1)} KB
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={[styles.menuCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleExportData}
              activeOpacity={0.8}
              disabled={isExporting}
            >
              <View style={[styles.menuIcon, { backgroundColor: palette.accentGlow }]}>
                {isExporting ? (
                  <ActivityIndicator size="small" color={palette.accent} />
                ) : (
                  <Ionicons name="download-outline" size={20} color={palette.accent} />
                )}
              </View>
              <View style={styles.menuText}>
                <Text style={[styles.menuTitle, { color: palette.text }]}>Export All Data</Text>
                <Text style={[styles.menuSubtitle, { color: palette.textMuted }]}>
                  Backup all workouts, programs & settings
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />
            </TouchableOpacity>

            <View style={[styles.menuDivider, { backgroundColor: palette.cardBorder }]} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleImportData}
              activeOpacity={0.8}
              disabled={isImporting}
            >
              <View style={[styles.menuIcon, { backgroundColor: palette.accentGlow }]}>
                {isImporting ? (
                  <ActivityIndicator size="small" color={palette.accent} />
                ) : (
                  <Ionicons name="cloud-upload-outline" size={20} color={palette.accent} />
                )}
              </View>
              <View style={styles.menuText}>
                <Text style={[styles.menuTitle, { color: palette.text }]}>Import Data</Text>
                <Text style={[styles.menuSubtitle, { color: palette.textMuted }]}>
                  Restore from a previous backup file
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: palette.danger }]}>Danger Zone</Text>
          </View>
          <View style={[styles.menuCard, { backgroundColor: palette.cardBg, borderColor: `${palette.danger}30` }]}>
            <TouchableOpacity style={styles.menuItem} onPress={handleResetAllData} activeOpacity={0.8}>
              <View style={[styles.menuIcon, { backgroundColor: `${palette.danger}12` }]}>
                <Ionicons name="trash-outline" size={20} color={palette.danger} />
              </View>
              <View style={styles.menuText}>
                <Text style={[styles.menuTitle, { color: palette.danger }]}>Reset All Data</Text>
                <Text style={[styles.menuSubtitle, { color: palette.textMuted }]}>Permanently delete all app data</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={palette.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  contentContainer: { paddingHorizontal: 20, paddingBottom: 155 },

  // Header
  header: { paddingTop: 8, paddingBottom: 24 },
  headerLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1.2, marginBottom: 4 },
  headerTitle: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },

  // Section
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  sectionBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },

  // Menu Card
  menuCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  menuIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuText: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: '600', letterSpacing: -0.2, marginBottom: 2 },
  menuSubtitle: { fontSize: 12, fontWeight: '500' },
  menuDivider: { height: 1, marginLeft: 66 },
  colorPreview: { width: 24, height: 24, borderRadius: 12, marginRight: 8 },

  // Color Picker
  colorPicker: { padding: 16, borderTopWidth: 1 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  colorOption: { alignItems: 'center', width: 64 },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  colorCircleSelected: { borderWidth: 3, borderColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  colorName: { fontSize: 10, fontWeight: '500', textAlign: 'center' },

  // Unit Toggle
  unitToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(113, 113, 122, 0.3)',
  },
  unitOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  unitOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Storage Stats
  storageStatsCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  storageStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storageStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  storageStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(113, 113, 122, 0.2)',
  },
  storageStatLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  storageStatValue: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
