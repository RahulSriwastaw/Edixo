import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Clock, Award, CheckCircle2, ChevronLeft, PlayCircle } from 'lucide-react-native';

export default function CourseDetailScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { theme } = useAppContext();
    const isDark = theme === 'dark';

    const course = route.params?.course || {
        id: '1',
        title: 'JEE Advanced Physics Mastery',
        instructor: 'Dr. H.C. Verma',
        description: 'Complete syllabus coverage for JEE Advanced Physics with focus on conceptual depth and problem-solving techniques.',
        lessons: 45,
        duration: '60+ Hours',
        students: '15k+ Enrolled',
        price: 'Free',
        modules: [
            { id: 'm1', title: 'Mechanics & Kinematics', lessons: 12 },
            { id: 'm2', title: 'Thermodynamics', lessons: 8 },
            { id: 'm3', title: 'Electromagnetism', lessons: 15 },
            { id: 'm4', title: 'Modern Physics', lessons: 10 },
        ]
    };

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header Image/Card */}
                <View style={styles.imageContainer}>
                    <LinearGradient colors={['#4f46e5', '#818cf8']} style={styles.gradientHeader}>
                        <BookOpen size={80} color="rgba(255,255,255,0.3)" />
                    </LinearGradient>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <ChevronLeft color="#fff" size={28} />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={[styles.contentWrapper, isDark && styles.contentDark]}>
                    <View style={styles.headerInfo}>
                        <Text style={[styles.title, isDark && styles.textLight]}>{course.title}</Text>
                        <Text style={styles.instructor}>by {course.instructor}</Text>
                    </View>

                    {/* Quick Stats */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <PlayCircle size={18} color="#4f46e5" />
                            <Text style={styles.statText}>{course.lessons} Lessons</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Clock size={18} color="#4f46e5" />
                            <Text style={styles.statText}>{course.duration}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Award size={18} color="#f59e0b" />
                            <Text style={styles.statText}>Certificate</Text>
                        </View>
                    </View>

                    <Text style={[styles.sectionTitle, isDark && styles.textLight]}>About this Course</Text>
                    <Text style={styles.description}>{course.description}</Text>

                    <Text style={[styles.sectionTitle, isDark && styles.textLight]}>Curriculum</Text>
                    {course.modules.map((m: any, idx: number) => (
                        <TouchableOpacity key={m.id} style={[styles.moduleCard, isDark && styles.cardDark]}>
                            <View style={styles.moduleNumber}>
                                <Text style={styles.moduleNumberText}>{idx + 1}</Text>
                            </View>
                            <View style={styles.moduleInfo}>
                                <Text style={[styles.moduleTitle, isDark && styles.textLight]}>{m.title}</Text>
                                <Text style={styles.moduleLessons}>{m.lessons} Lessons</Text>
                            </View>
                            <PlayCircle size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Sticky Action Button */}
            <View style={[styles.footer, isDark && styles.footerDark]}>
                <View>
                    <Text style={styles.priceLabel}>Price</Text>
                    <Text style={[styles.priceValue, isDark && styles.textLight]}>{course.price}</Text>
                </View>
                <TouchableOpacity style={styles.enrollBtn}>
                    <LinearGradient colors={['#4f46e5', '#4338ca']} style={styles.enrollGradient}>
                        <Text style={styles.enrollBtnText}>Start Learning</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    containerDark: { backgroundColor: '#0f172a' },
    textLight: { color: '#f1f5f9' },
    scrollContent: { paddingBottom: 100 },
    imageContainer: { height: 250, position: 'relative' },
    gradientHeader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    backBtn: { position: 'absolute', top: 50, left: 20, width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    contentWrapper: { marginTop: -30, borderTopLeftRadius: 32, borderTopRightRadius: 32, backgroundColor: '#f8fafc', padding: 24, minHeight: 500 },
    contentDark: { backgroundColor: '#0f172a' },
    headerInfo: { marginBottom: 24 },
    title: { fontSize: 24, fontWeight: '900', color: '#1e293b', marginBottom: 6 },
    instructor: { fontSize: 16, color: '#64748b', fontWeight: '500' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32, padding: 16, backgroundColor: '#fff', borderRadius: 20, elevation: 1 },
    statItem: { alignItems: 'center', gap: 6 },
    statText: { fontSize: 12, color: '#475569', fontWeight: '600' },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginTop: 8, marginBottom: 12 },
    description: { fontSize: 15, color: '#64748b', lineHeight: 24, marginBottom: 24 },
    moduleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
    cardDark: { backgroundColor: '#1e293b', borderColor: '#334155' },
    moduleNumber: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    moduleNumberText: { color: '#4f46e5', fontWeight: '800', fontSize: 14 },
    moduleInfo: { flex: 1 },
    moduleTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
    moduleLessons: { fontSize: 13, color: '#64748b' },
    footer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', padding: 20, paddingBottom: 34, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    footerDark: { backgroundColor: '#1e293b', borderTopColor: '#334155' },
    priceLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' },
    priceValue: { fontSize: 24, fontWeight: '900', color: '#1e293b' },
    enrollBtn: { width: '60%', borderRadius: 16, overflow: 'hidden' },
    enrollGradient: { paddingVertical: 16, alignItems: 'center' },
    enrollBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});
