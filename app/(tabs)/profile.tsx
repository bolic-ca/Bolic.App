import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ProfilePage() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://placekitten.com/200/200' }} // placeholder avatar
          style={styles.avatar}
        />
        <Text style={[styles.name, { color: theme.text }]}>John Doe</Text>
        <Text style={[styles.email, { color: theme.text }]}>johndoe@example.com</Text>
      </View>

      {/* Options */}
      <View style={styles.options}>
        <TouchableOpacity style={[styles.optionCard, { backgroundColor: theme.card }]}>
          <Ionicons name="pencil" size={22} color={theme.text} />
          <Text style={[styles.optionText, { color: theme.text }]}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.optionCard, { backgroundColor: theme.card }]}>
          <Ionicons name="notifications" size={22} color={theme.text} />
          <Text style={[styles.optionText, { color: theme.text }]}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.optionCard, { backgroundColor: theme.card }]}>
          <Ionicons name="key" size={22} color={theme.text} />
          <Text style={[styles.optionText, { color: theme.text }]}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.optionCard, { backgroundColor: theme.card }]}>
          <Ionicons name="log-out" size={22} color={theme.text} />
          <Text style={[styles.optionText, { color: theme.text }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: { fontSize: 24, fontWeight: '600', marginBottom: 4 },
  email: { fontSize: 16, fontWeight: '400', color: '#888' },
  options: { paddingHorizontal: 16 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: { fontSize: 18, marginLeft: 12, fontWeight: '500' },
});
