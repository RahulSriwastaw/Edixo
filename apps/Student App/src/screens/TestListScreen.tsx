import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Play, FileText, ChevronLeft, Star } from 'lucide-react-native';

type Test = {
  id: string;
  title: string;
  questions_count: number;
  duration_mins: number;
  difficulty: string;
  type: string;
};

export default function TestListScreen() {
  const route = useRoute<RouteProp<Record<string, { category: string; title: string }>, string>>();
  const navigation = useNavigation<any>();
  const { theme } = useAppContext();
  const isDark = theme === 'dark';

  const category = route.params?.category || 'mock';
  const categoryTitle = route.params?.title || 'Tests';

  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, [category]);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('type', category);

      if (error) throw error;
      setTests(data || []);
    } catch (error: any) {
      console.error('Error fetching tests:', error.message);
      // Mock data if fetch fails
      setTests([
        { id: '1', title: 'Physics: Kinematics Mastery', questions_count: 30, duration_mins: 45, difficulty: 'Intermediate', type: 'chapter' },
        { id: '2', title: 'Chemistry: Atomic Structure', questions_count: 25, duration_mins: 30, difficulty: 'Beginner', type: 'chapter' },
        { id: '3', title: 'Mathematics: Integration Pro', questions_count: 40, duration_mins: 60, difficulty: 'Advanced', type: 'chapter' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderTestItem = ({ item }: { item: Test }) => (
    <TouchableOpacity
      style={[styles.testCard, isDark && styles.testCardDark]}
      onPress={() => navigation.navigate('TestRunner', {
        testId: item.id,
        mode: item.type,
        questions: [ // Mock questions for now
          { id: 'q1', type: 'mcq', prompt: 'What is the SI unit of force?', options: ['Newton', 'Joule', 'Pascal', 'Watt'], answerIndex: 0 },
          { id: 'q2', type: 'mcq', prompt: 'Which gas is most abundant in Earth atmosphere?', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'], answerIndex: 2 },
        ]
      })}
    >
      <View style={styles.testCardMain}>
        <View style={[styles.iconBox, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
          <FileText size={20} color="#FF5A1F" />
        </View>
        <View style={styles.testInfo}>
          <Text style={[styles.testTitle, isDark && styles.textLight]}>{item.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="help-circle-outline" size={14} color="#64748b" />
              <Text style={styles.metaText}>{item.questions_count} Qs</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={14} color="#64748b" />
              <Text style={styles.metaText}>{item.duration_mins} mins</Text>
            </View>
          </View>
        </View>
        <View style={[styles.difficultyBadge,
        item.difficulty === 'Advanced' ? styles.diffAdv :
          item.difficulty === 'Intermediate' ? styles.diffInt : styles.diffBeg
        ]}>
          <Text style={styles.diffText}>{item.difficulty}</Text>
        </View>
      </View>
      <View style={styles.testCardAction}>
        <Text style={styles.startCta}>Start Test</Text>
        <Play size={16} color="#FF5A1F" fill="#FF5A1F" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color={isDark ? '#fff' : '#1e293b'} size={28} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, isDark && styles.textLight]}>{categoryTitle}</Text>
          <Text style={styles.headerSubtitle}>{tests.length} Assessments Available</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF5A1F" />
        </View>
      ) : (
        <FlatList
          data={tests}
          renderItem={renderTestItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyText}>No tests found in this category</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  containerDark: { backgroundColor: '#0f172a' },
  textLight: { color: '#f1f5f9' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
  headerSubtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 20, paddingTop: 0, gap: 16 },
  testCard: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden', elevation: 2 },
  testCardDark: { backgroundColor: '#1e293b', borderColor: '#334155' },
  testCardMain: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  testInfo: { flex: 1 },
  testTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 6 },
  metaRow: { flexDirection: 'row', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  difficultyBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  diffBeg: { backgroundColor: '#dcfce7' },
  diffInt: { backgroundColor: '#fef3c7' },
  diffAdv: { backgroundColor: '#fee2e2' },
  diffText: { fontSize: 10, fontWeight: '700', color: '#475569' },
  testCardAction: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#f8fafc', borderTopWidth: 1, borderTopColor: '#f1f5f9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  startCta: { fontSize: 13, fontWeight: '700', color: '#FF5A1F' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: '#94a3b8', marginTop: 16, fontWeight: '500' }
});

