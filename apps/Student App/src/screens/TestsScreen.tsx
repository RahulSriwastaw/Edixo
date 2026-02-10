import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

export default function TestsScreen() {
  const { theme } = useAppContext();
  const nav = useNavigation();
  const isDark = theme === 'dark';

  const launchList = (category: string, title: string) => {
    (nav as any).navigate('TestList', { category, title });
  };

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
      fontSize: 28,
      fontWeight: '800',
      color: isDark ? '#f1f5f9' : '#1e293b',
      marginBottom: 8,
    },
    grid: {
      gap: 16,
    },
    card: {
      padding: 20,
      borderRadius: 20,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: isDark ? '#000' : '#64748b',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 2,
    },
    cardContent: {
      flex: 1,
      marginLeft: 16,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 4,
    },
    cardDesc: {
      fontSize: 14,
      opacity: 0.8,
      lineHeight: 20,
    },
    iconBox: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    arrow: {
      marginLeft: 12,
    }
  });

  const Card = ({ title, desc, category, bg, border, text, icon, iconColor }: any) => (
    <Pressable
      onPress={() => launchList(category, title)}
      style={({ pressed }: { pressed: boolean }) => [
        styles.card,
        {
          backgroundColor: isDark ? '#1e293b' : 'white',
          borderColor: isDark ? '#334155' : '#e2e8f0',
          transform: [{ scale: pressed ? 0.98 : 1 }]
        }
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={24} color={text} />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: isDark ? '#e2e8f0' : '#1e293b' }]}>{title}</Text>
        <Text style={[styles.cardDesc, { color: isDark ? '#94a3b8' : '#64748b' }]}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={isDark ? '#475569' : '#cbd5e1'} style={styles.arrow} />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Test Series</Text>
        <View style={styles.grid}>
          <Card
            title="Chapter Tests"
            desc="Topic-specific assessments to master each chapter"
            category="chapter"
            bg="#eef2ff"
            text="#4f46e5"
            icon="book-outline"
          />
          <Card
            title="Mock Tests"
            desc="Full-length simulated exams for JEE/NEET"
            category="mock"
            bg="#f0fdf4"
            text="#166534"
            icon="timer-outline"
          />
          <Card
            title="Quick Practice"
            desc="Rapid-fire sessions to boost speed and accuracy"
            category="practice"
            bg="#fff7ed"
            text="#c2410c"
            icon="flash-outline"
          />
          <Card
            title="Previous Year Papers"
            desc="Solve past exam papers with detailed solutions"
            category="previous"
            bg="#f8fafc"
            text="#475569"
            icon="library-outline"
          />
          <Card
            title="Custom Quiz"
            desc="Create your own test by selecting topics"
            category="custom"
            bg="#ecfeff"
            text="#0891b2"
            icon="options-outline"
          />
        </View>
      </ScrollView>
    </View>
  );
}
