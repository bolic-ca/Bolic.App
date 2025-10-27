import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

export default function GlassCard() {
  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="light" style={styles.blur}>
        <Ionicons name="heart" size={28} color="white" />
        <Text style={styles.text}>Welcome to Bolic</Text>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  blur: {
    borderRadius: 30,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  text: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
});