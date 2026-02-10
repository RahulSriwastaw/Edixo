import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

const PRACTICE_QUESTIONS = [
  { id: 'p1', type: 'mcq', prompt: 'Square root of 16?', options: ['2', '4', '6', '8'], answerIndex: 1 },
  { id: 'p2', type: 'mcq', prompt: 'Synonym of quick?', options: ['Slow', 'Rapid', 'Late', 'Dull'], answerIndex: 1 },
  { id: 'p3', type: 'mcq', prompt: 'Chemical symbol for Gold?', options: ['Ag', 'Au', 'Fe', 'Hg'], answerIndex: 1 },
  { id: 'p4', type: 'mcq', prompt: 'Capital of India?', options: ['Mumbai', 'Delhi', 'Kolkata', 'Chennai'], answerIndex: 1 },
];

export default function PracticeScreen() {
  const nav = useNavigation();
  const { theme } = useAppContext();
  const isDark = theme === 'dark';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
    },
    scrollContent: {
      padding: 16,
      gap: 16,
    },
    header: {
      fontSize: 24,
      fontWeight: '700',
      color: isDark ? '#f1f5f9' : '#1e293b',
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#e2e8f0' : '#1e293b',
      marginBottom: 8,
    },
    card: {
      borderRadius: 12,
      padding: 16,
    },
    rowBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardTitle: {
      fontWeight: '700',
      fontSize: 16,
    },
    cardDesc: {
      marginTop: 4,
    },
    icon: {
      fontSize: 24,
    },
    gridRow: {
      flexDirection: 'row',
      gap: 12,
    },
    gridItem: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      gap: 8,
    },
    gridTitle: {
      fontWeight: '600',
    }
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Practice & Learn</Text>

        <View style={{ gap: 12 }}>
          <Text style={styles.sectionTitle}>Quick Practice</Text>
          <Pressable
            onPress={() => (nav as any).navigate('TestRunner', { mode: 'practice', questions: PRACTICE_QUESTIONS })}
            style={[styles.card, { backgroundColor: isDark ? '#064e3b' : '#dcfce7' }]}
          >
            <View style={styles.rowBetween}>
              <View>
                <Text style={[styles.cardTitle, { color: isDark ? '#a7f3d0' : '#14532d' }]}>Start 5-Min Challenge</Text>
                <Text style={[styles.cardDesc, { color: isDark ? '#6ee7b7' : '#166534' }]}>Short session with instant feedback</Text>
              </View>
              <Ionicons name="flash" size={24} color={isDark ? '#34d399' : '#15803d'} />
            </View>
          </Pressable>

          <View style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={[styles.cardTitle, { color: isDark ? '#e2e8f0' : '#0f172a' }]}>Daily Challenge</Text>
                <Text style={[styles.cardDesc, { color: isDark ? '#94a3b8' : '#64748b' }]}>Topic: Algebra Basics</Text>
              </View>
              <Pressable style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#3b82f6', borderRadius: 20 }}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Start</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={{ gap: 12, marginTop: 8 }}>
          <Text style={styles.sectionTitle}>Study Resources</Text>

          <View style={styles.gridRow}>
            <Pressable style={[styles.gridItem, { backgroundColor: isDark ? '#172554' : '#eff6ff' }]}>
              <Ionicons name="document-text" size={24} color={isDark ? '#60a5fa' : '#2563eb'} />
              <Text style={[styles.gridTitle, { color: isDark ? '#bfdbfe' : '#1e40af' }]}>Revision Notes</Text>
            </Pressable>
            <Pressable style={[styles.gridItem, { backgroundColor: isDark ? '#431407' : '#fff7ed' }]}>
              <Ionicons name="calculator" size={24} color={isDark ? '#fb923c' : '#ea580c'} />
              <Text style={[styles.gridTitle, { color: isDark ? '#fed7aa' : '#9a3412' }]}>Formula Sheets</Text>
            </Pressable>
          </View>

          <View style={styles.gridRow}>
            <Pressable style={[styles.gridItem, { backgroundColor: isDark ? '#581c87' : '#faf5ff' }]}>
              <Ionicons name="book" size={24} color={isDark ? '#a855f7' : '#9333ea'} />
              <Text style={[styles.gridTitle, { color: isDark ? '#e9d5ff' : '#6b21a8' }]}>NCERT Solutions</Text>
            </Pressable>
            <Pressable style={[styles.gridItem, { backgroundColor: isDark ? '#134e4a' : '#f0fdfa' }]}>
              <Ionicons name="git-network" size={24} color={isDark ? '#2dd4bf' : '#0d9488'} />
              <Text style={[styles.gridTitle, { color: isDark ? '#99f6e4' : '#115e59' }]}>Mind Maps</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: isDark ? '#881337' : '#fff1f2', marginTop: 8 }]}>
          <Text style={{ fontWeight: '700', color: isDark ? '#fecdd3' : '#9f1239' }}>Saved for Later</Text>
          <Text style={{ marginTop: 4, color: isDark ? '#fda4af' : '#be123c' }}>You have 3 bookmarked questions to review.</Text>
        </View>
      </ScrollView>
    </View>
  );
}
