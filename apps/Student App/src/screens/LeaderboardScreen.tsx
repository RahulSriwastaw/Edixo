import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';

const MOCK_DATA = {
  weekly: [
    { id: '1', name: 'Rahul Kumar', score: 2500, rank: 1, avatar: null },
    { id: '2', name: 'Sneha Gupta', score: 2350, rank: 2, avatar: null },
    { id: '3', name: 'Amit Patel', score: 2100, rank: 3, avatar: null },
    { id: '4', name: 'Priya Sharma', score: 1950, rank: 4, avatar: null },
    { id: '5', name: 'Vikram Singh', score: 1800, rank: 5, avatar: null },
    { id: 'me', name: 'You', score: 1200, rank: 42, avatar: null, isMe: true },
  ],
  allTime: [
    { id: '2', name: 'Sneha Gupta', score: 15000, rank: 1, avatar: null },
    { id: '1', name: 'Rahul Kumar', score: 14200, rank: 2, avatar: null },
    { id: '6', name: 'Arjun Reddy', score: 13500, rank: 3, avatar: null },
    { id: '3', name: 'Amit Patel', score: 12000, rank: 4, avatar: null },
    { id: 'me', name: 'You', score: 5600, rank: 156, avatar: null, isMe: true },
  ]
};

export default function LeaderboardScreen() {
  const navigation = useNavigation();
  const { theme } = useAppContext();
  const isDark = theme === 'dark';
  const [period, setPeriod] = useState<'weekly' | 'allTime'>('weekly');

  const data = MOCK_DATA[period];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
    },
    header: {
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1e293b' : '#e2e8f0',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDark ? '#f1f5f9' : '#0f172a',
      marginLeft: 16,
    },
    tabContainer: {
      flexDirection: 'row',
      margin: 16,
      backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
      borderRadius: 12,
      padding: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 8,
    },
    activeTab: {
      backgroundColor: isDark ? '#3b82f6' : '#ffffff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    tabText: {
      fontWeight: '600',
      color: isDark ? '#94a3b8' : '#64748b',
    },
    activeTabText: {
      color: isDark ? '#ffffff' : '#0f172a',
    },
    listContent: {
      padding: 16,
      paddingBottom: 100,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    meItem: {
      backgroundColor: isDark ? '#1e293b' : '#eff6ff',
      borderColor: '#3b82f6',
      borderWidth: 1,
    },
    rank: {
      width: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rankText: {
      fontSize: 18,
      fontWeight: '700',
      color: isDark ? '#94a3b8' : '#64748b',
    },
    topRank: {
      color: '#f59e0b', // Gold-ish
      fontSize: 22,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? '#334155' : '#cbd5e1',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 12,
    },
    avatarText: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#f1f5f9' : '#0f172a',
    },
    info: {
      flex: 1,
    },
    name: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#f1f5f9' : '#0f172a',
    },
    scoreContainer: {
      alignItems: 'flex-end',
    },
    score: {
      fontSize: 16,
      fontWeight: '700',
      color: '#3b82f6',
    },
    scoreLabel: {
      fontSize: 12,
      color: isDark ? '#94a3b8' : '#64748b',
    },
    podiumContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'flex-end',
      marginBottom: 24,
      height: 180,
    },
    podiumItem: {
      alignItems: 'center',
      marginHorizontal: 8,
    },
    podiumBar: {
      width: 80,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: 12,
    },
    podiumRank1: {
      height: 140,
      backgroundColor: '#f59e0b',
    },
    podiumRank2: {
      height: 110,
      backgroundColor: '#94a3b8',
    },
    podiumRank3: {
      height: 90,
      backgroundColor: '#b45309', // Bronze-ish
    },
    podiumAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#fff',
      marginBottom: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#fff',
    },
    podiumName: {
      marginTop: 8,
      fontSize: 12,
      fontWeight: '600',
      color: '#fff',
      textAlign: 'center',
    },
    podiumScore: {
      fontSize: 14,
      fontWeight: '700',
      color: 'rgba(255,255,255,0.9)',
    },
  });

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.item, item.isMe && styles.meItem]}>
      <View style={styles.rank}>
        {item.rank <= 3 ? (
          <Ionicons
            name="trophy"
            size={24}
            color={item.rank === 1 ? '#f59e0b' : item.rank === 2 ? '#94a3b8' : '#b45309'}
          />
        ) : (
          <Text style={styles.rankText}>{item.rank}</Text>
        )}
      </View>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name} {item.isMe && '(You)'}</Text>
      </View>
      <View style={styles.scoreContainer}>
        <Text style={styles.score}>{item.score}</Text>
        <Text style={styles.scoreLabel}>XP</Text>
      </View>
    </View>
  );

  const top3 = data.filter(d => d.rank <= 3).sort((a, b) => a.rank - b.rank);
  const others = data.filter(d => d.rank > 3);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#f1f5f9' : '#0f172a'} />
        </TouchableOpacity>
        <Text style={styles.title}>Leaderboard</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, period === 'weekly' && styles.activeTab]}
          onPress={() => setPeriod('weekly')}
        >
          <Text style={[styles.tabText, period === 'weekly' && styles.activeTabText]}>This Week</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, period === 'allTime' && styles.activeTab]}
          onPress={() => setPeriod('allTime')}
        >
          <Text style={[styles.tabText, period === 'allTime' && styles.activeTabText]}>All Time</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={others}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.podiumContainer}>
            {/* Rank 2 */}
            <View style={styles.podiumItem}>
              <View style={styles.podiumAvatar}>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{top3[1]?.name.charAt(0)}</Text>
              </View>
              <View style={[styles.podiumBar, styles.podiumRank2]}>
                <Text style={styles.podiumScore}>{top3[1]?.score}</Text>
                <Text style={styles.podiumName}>{top3[1]?.name.split(' ')[0]}</Text>
              </View>
            </View>

            {/* Rank 1 */}
            <View style={styles.podiumItem}>
              <View style={[styles.podiumAvatar, { width: 64, height: 64, borderRadius: 32 }]}>
                <Ionicons name="trophy" size={32} color="#f59e0b" />
              </View>
              <View style={[styles.podiumBar, styles.podiumRank1]}>
                <Text style={styles.podiumScore}>{top3[0]?.score}</Text>
                <Text style={styles.podiumName}>{top3[0]?.name.split(' ')[0]}</Text>
              </View>
            </View>

            {/* Rank 3 */}
            <View style={styles.podiumItem}>
              <View style={styles.podiumAvatar}>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{top3[2]?.name.charAt(0)}</Text>
              </View>
              <View style={[styles.podiumBar, styles.podiumRank3]}>
                <Text style={styles.podiumScore}>{top3[2]?.score}</Text>
                <Text style={styles.podiumName}>{top3[2]?.name.split(' ')[0]}</Text>
              </View>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}
