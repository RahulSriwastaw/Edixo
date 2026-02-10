import { ScrollView, View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

const MOCK_VIDEOS = [
  { id: '1', title: 'Newton\'s Laws of Motion', duration: '12:30', category: 'Physics', views: '1.2k' },
  { id: '2', title: 'Thermodynamics: Entropy', duration: '18:45', category: 'Chemistry', views: '850' },
  { id: '3', title: 'Calculus: Derivatives', duration: '15:20', category: 'Math', views: '2.1k' },
  { id: '4', title: 'Plant Kingdom Overview', duration: '10:15', category: 'Biology', views: '1.5k' },
];

export default function VideosScreen() {
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
    categoryCard: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
    },
    cardTitle: {
      fontWeight: '600',
      fontSize: 16,
    },
    cardDesc: {
      marginTop: 4,
    },
    videoCard: {
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#e2e8f0',
    },
    thumbnail: {
      height: 120,
      backgroundColor: isDark ? '#334155' : '#cbd5e1',
      alignItems: 'center',
      justifyContent: 'center',
    },
    playIcon: {
      fontSize: 32,
    },
    videoContent: {
      padding: 12,
    },
    videoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#f1f5f9' : '#0f172a',
      marginBottom: 4,
    },
    videoMeta: {
      fontSize: 12,
      color: isDark ? '#94a3b8' : '#64748b',
    },
    badge: {
      position: 'absolute',
      bottom: 8,
      right: 8,
      backgroundColor: 'rgba(0,0,0,0.7)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    badgeText: {
      color: 'white',
      fontSize: 10,
      fontWeight: '600',
    }
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Video Library</Text>
        
        <View style={{ gap: 12 }}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={[styles.categoryCard, { backgroundColor: isDark ? '#1e1b4b' : '#eef2ff' }]}>
            <Text style={[styles.cardTitle, { color: isDark ? '#c7d2fe' : '#3730a3' }]}>Concept Building</Text>
            <Text style={[styles.cardDesc, { color: isDark ? '#a5b4fc' : '#4f46e5' }]}>Theory videos with bookmarks</Text>
          </View>
          <View style={[styles.categoryCard, { backgroundColor: isDark ? '#172554' : '#eff6ff' }]}>
            <Text style={[styles.cardTitle, { color: isDark ? '#bfdbfe' : '#1e40af' }]}>Problem Solving</Text>
            <Text style={[styles.cardDesc, { color: isDark ? '#93c5fd' : '#3b82f6' }]}>Worked examples & solutions</Text>
          </View>
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          {MOCK_VIDEOS.map((video) => (
            <Pressable key={video.id} style={styles.videoCard}>
              <View style={styles.thumbnail}>
                <Ionicons name="play-circle" size={48} color={isDark ? '#e2e8f0' : '#ffffff'} />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{video.duration}</Text>
                </View>
              </View>
              <View style={styles.videoContent}>
                <Text style={styles.videoTitle}>{video.title}</Text>
                <Text style={styles.videoMeta}>{video.category} • {video.views} views</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
