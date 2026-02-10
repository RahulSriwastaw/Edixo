import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, BookOpen, Clock, Users, MoreVertical } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

type Course = {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string | null;
    price: number;
    is_published: boolean;
    created_at: string;
};

export default function CourseListScreen() {
    const navigation = useNavigation();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCourses(data || []);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderCourseItem = ({ item }: { item: Course }) => (
        <View style={styles.card}>
            <View style={styles.thumbnailContainer}>
                {item.thumbnail_url ? (
                    <Image source={{ uri: item.thumbnail_url }} style={styles.thumbnail} />
                ) : (
                    <LinearGradient
                        colors={['#f1f5f9', '#e2e8f0']}
                        style={[styles.thumbnail, styles.placeholderThumbnail]}
                    >
                        <BookOpen size={40} color="#94a3b8" />
                    </LinearGradient>
                )}
                <View style={[styles.statusBadge, { backgroundColor: item.is_published ? 'rgba(220, 252, 231, 0.9)' : 'rgba(241, 245, 249, 0.9)' }]}>
                    <Text style={[styles.statusText, { color: item.is_published ? '#166534' : '#64748b' }]}>
                        {item.is_published ? 'Published' : 'Draft'}
                    </Text>
                </View>
            </View>

            <View style={styles.cardContent}>
                <View style={styles.titleRow}>
                    <Text style={styles.courseTitle} numberOfLines={2}>{item.title}</Text>
                    <TouchableOpacity>
                        <MoreVertical size={20} color="#94a3b8" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.coursePrice}>
                    {item.price > 0 ? `₹${item.price.toLocaleString()}` : 'Free'}
                </Text>

                <View style={styles.divider} />

                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Users size={14} color="#64748b" />
                        <Text style={styles.metaText}>0 Students</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Clock size={14} color="#64748b" />
                        <Text style={styles.metaText}>{new Date(item.created_at).toLocaleDateString()}</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <SafeAreaView edges={['top']} style={styles.safeHeader}>
                    <View style={styles.headerContent}>
                        <Text style={styles.title}>Courses</Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => navigation.navigate('CreateCourse' as never)}
                        >
                            <Plus color="#fff" size={20} />
                            <Text style={styles.addButtonText}>Create</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            ) : (
                <FlatList
                    data={courses}
                    renderItem={renderCourseItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconBg}>
                                <BookOpen size={48} color="#94a3b8" />
                            </View>
                            <Text style={styles.emptyText}>No courses available</Text>
                            <Text style={styles.emptySubtext}>Create your first course to start teaching</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        backgroundColor: '#fff',
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    safeHeader: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0f172a',
    },
    addButton: {
        backgroundColor: '#4f46e5',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    listContent: {
        padding: 20,
        gap: 20,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(226, 232, 240, 0.6)',
    },
    thumbnailContainer: {
        height: 180,
        backgroundColor: '#f1f5f9',
        position: 'relative',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderThumbnail: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        // @ts-ignore
        backdropFilter: 'blur(4px)',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardContent: {
        padding: 20,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    courseTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 8,
        lineHeight: 26,
        flex: 1,
        marginRight: 8,
    },
    coursePrice: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4f46e5',
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginBottom: 12,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyIconBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 8,
    },
    emptySubtext: {
        color: '#94a3b8',
        textAlign: 'center',
        maxWidth: 250,
        lineHeight: 20,
    },
});
