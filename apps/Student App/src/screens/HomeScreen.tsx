import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Trophy, Activity, ChevronRight, Clock } from 'lucide-react-native';

const MOCK_ENROLLED_COURSES = [
  { id: '1', title: 'JEE Advanced Physics', progress: 45, color: ['#4f46e5', '#818cf8'] },
  { id: '2', title: 'Organic Chemistry Masterclass', progress: 12, color: ['#059669', '#34d399'] },
  { id: '3', title: 'Mathematics: Calculus', progress: 78, color: ['#db2777', '#f472b6'] },
];

export default function HomeScreen() {
  const { user, stats, theme } = useAppContext();
  const navigation = useNavigation<any>();
  const isDark = theme === 'dark';
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate fetch
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <View style={[styles.statCard, isDark && styles.statCardDark]}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Icon size={24} color={color} />
      </View>
      <View>
        <Text style={[styles.statValue, isDark && styles.textLight]}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, isDark && styles.textLight]}>
              Hello, Can you check?
            </Text>
            <Text style={styles.subGreeting}>Ready to learn today?</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <View style={styles.profileButton}>
              <Text style={styles.profileText}>
                {user?.email?.charAt(0).toUpperCase() || 'S'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard title="Tests Taken" value={stats.level * 5} icon={BookOpen} color="#4f46e5" />
          <StatCard title="Avg Score" value="78%" icon={Activity} color="#059669" />
          <StatCard title="XP Earned" value={stats.xp} icon={Trophy} color="#db2777" />
        </View>

        {/* Continue Learning */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>Continue Learning</Text>
        </View>

        <FlatList
          horizontal
          data={MOCK_ENROLLED_COURSES}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.coursesList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.courseCard, isDark && styles.cardDark]}
              onPress={() => navigation.navigate('CourseDetail', { course: item })}
            >
              <LinearGradient
                colors={item.color}
                style={styles.courseGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.courseTitle}>{item.title}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{item.progress}% Complete</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
        />

        {/* Recent Tests */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>Recent Tests</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Tests')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {[1, 2].map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.testItem, isDark && styles.cardDark]}
            onPress={() => navigation.navigate('TestRunner', { testId: 'mock' })}
          >
            <View style={styles.testIcon}>
              <Clock size={20} color="#64748b" />
            </View>
            <View style={styles.testInfo}>
              <Text style={[styles.testTitle, isDark && styles.textLight]}>Mock Test {index + 1}: Physics Full Sylabus</Text>
              <Text style={styles.testSubtitle}>2 days ago • Score: 85/100</Text>
            </View>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  textLight: {
    color: '#f1f5f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  subGreeting: {
    fontSize: 14,
    color: '#64748b',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4f46e5',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    width: '31%',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardDark: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  statTitle: {
    fontSize: 12,
    color: '#64748b',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4f46e5',
  },
  coursesList: {
    paddingRight: 20,
    marginBottom: 32,
  },
  courseCard: {
    width: 240,
    height: 140,
    borderRadius: 20,
    marginRight: 16,
    overflow: 'hidden',
  },
  cardDark: {
    // No redundant bg, linear gradient covers it
  },
  courseGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  testItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  testIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  testInfo: {
    flex: 1,
  },
  testTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  testSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
});
