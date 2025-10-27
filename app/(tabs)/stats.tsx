import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

export default function StatsPage() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.background }]}
            contentContainerStyle={styles.contentContainer}
        >
            <Text style={[styles.heading, { color: theme.text }]}>Stats</Text>

            {/* Example Stat Card */}
            <View style={[styles.card, { backgroundColor: theme.card }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>Total Sessions</Text>
                <Text style={[styles.cardValue, { color: theme.text }]}>12</Text>
            </View>

            <View style={[styles.card, { backgroundColor: theme.card }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>Weekly Progress</Text>
                <Text style={[styles.cardValue, { color: theme.text }]}>3 sessions</Text>
            </View>

            <View style={[styles.card, { backgroundColor: theme.card }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>Best Streak</Text>
                <Text style={[styles.cardValue, { color: theme.text }]}>5 days</Text>
            </View>

            {/* You can add charts or graphs here later */}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
    },
    heading: {
        fontSize: 32,
        fontWeight: '600',
        marginBottom: 16,
    },
    card: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 8,
    },
    cardValue: {
        fontSize: 28,
        fontWeight: '700',
    },
});
