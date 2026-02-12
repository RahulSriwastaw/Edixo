import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Linking,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Video,
    FileText,
    ExternalLink,
    Search,
    Filter,
    ChevronRight,
    Play
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { COLORS } from '../constants/colors';
import { useAppContext } from '../context/AppContext';

const { width } = Dimensions.get('window');

interface ContentItem {
    id: string;
    title: string;
    description: string;
    type: 'video' | 'pdf' | 'document' | 'link';
    category: string;
    thumbnail_url?: string;
    file_url: string;
    created_at: string;
}

export default function StudyMaterialsScreen({ navigation }: any) {
    const { theme } = useAppContext();
    const isDark = theme === 'dark';

    const [content, setContent] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeType, setActiveType] = useState<string>('all');

    useEffect(() => {
        fetchContent();
    }, [activeType]);

    const fetchContent = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('content')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (activeType !== 'all') {
                query = query.eq('type', activeType);
            }

            const { data, error } = await query;
            if (error) throw error;
            setContent(data || []);
        } catch (error) {
            console.error('Error fetching study materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenContent = (item: ContentItem) => {
        if (item.type === 'video') {
            // Deep link or navigate to a specialized video player if needed
            // For now, open in browser/app
            Linking.openURL(item.file_url);
        } else {
            Linking.openURL(item.file_url);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video size={20} color={COLORS.error} />;
            case 'pdf': return <FileText size={20} color={COLORS.primary} />;
            case 'link': return <ExternalLink size={20} color="#3b82f6" />;
            default: return <FileText size={20} color="#64748b" />;
        }
    };

    const TypeFilter = ({ label, value }: { label: string, value: string }) => (
        <TouchableOpacity
            style={[
                styles.filterChip,
                activeType === value && styles.filterChipActive,
                isDark && styles.filterChipDark
            ]}
            onPress={() => setActiveType(value)}
        >
            <Text style={[
                styles.filterText,
                activeType === value && styles.filterTextActive,
                isDark && styles.textLight
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const renderItem = ({ item }: { item: ContentItem }) => (
        <TouchableOpacity
            style={[styles.contentCard, isDark && styles.cardDark]}
            onPress={() => handleOpenContent(item)}
        >
            <View style={styles.thumbnailContainer}>
                {item.thumbnail_url ? (
                    <Image source={{ uri: item.thumbnail_url }} style={styles.thumbnail} />
                ) : (
                    <View style={styles.placeholderThumbnail}>
                        {getIcon(item.type)}
                    </View>
                )}
                {item.type === 'video' && (
                    <View style={styles.playOverlay}>
                        <Play size={24} color="#FFF" fill="#FFF" />
                    </View>
                )}
            </View>

            <View style={styles.contentInfo}>
                <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
                </View>
                <Text style={[styles.title, isDark && styles.textLight]} numberOfLines={2}>
                    {item.title}
                </Text>
                <Text style={styles.description} numberOfLines={2}>
                    {item.description || 'No description available.'}
                </Text>
                <View style={styles.footer}>
                    <Text style={styles.category}>{item.category || 'General'}</Text>
                    <ChevronRight size={16} color="#94a3b8" />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, isDark && styles.textLight]}>Study Materials</Text>
                <Text style={styles.headerSubtitle}>Books, Videos & Notes</Text>
            </View>

            {/* Filters */}
            <View style={styles.filterContainer}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={[
                        { label: 'All', value: 'all' },
                        { label: 'Videos', value: 'video' },
                        { label: 'PDFs', value: 'pdf' },
                        { label: 'Links', value: 'link' }
                    ]}
                    keyExtractor={(item) => item.value}
                    renderItem={({ item }) => <TypeFilter label={item.label} value={item.value} />}
                    contentContainerStyle={styles.filterList}
                />
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : content.length === 0 ? (
                <View style={styles.center}>
                    <FileText size={64} color="#CBD5E1" />
                    <Text style={styles.emptyTitle}>No materials found</Text>
                    <Text style={styles.emptyText}>Check back later for new updates.</Text>
                </View>
            ) : (
                <FlatList
                    data={content}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    containerDark: {
        backgroundColor: '#0F172A',
    },
    header: {
        padding: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1E293B',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 4,
    },
    filterContainer: {
        backgroundColor: '#FFF',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    filterList: {
        paddingHorizontal: 20,
        gap: 12,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: COLORS.primary,
    },
    filterChipDark: {
        backgroundColor: '#1E293B',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    filterTextActive: {
        color: '#FFF',
    },
    textLight: {
        color: '#F1F5F9',
    },
    listContent: {
        padding: 20,
        gap: 16,
    },
    contentCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    cardDark: {
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
    },
    thumbnailContainer: {
        width: 120,
        height: 120,
        backgroundColor: '#F1F5F9',
        position: 'relative',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderThumbnail: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentInfo: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    typeBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: 4,
    },
    typeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#64748B',
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
    },
    description: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 18,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    category: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginTop: 16,
    },
    emptyText: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 8,
    },
});
