import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Image
} from 'react-native';
import {
    Radio,
    Users,
    Calendar,
    Clock,
    Play
} from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../constants/colors';

interface LiveStream {
    id: string;
    title: string;
    description: string;
    teacher?: {
        name: string;
        profile_image?: string;
    };
    status: 'live' | 'scheduled';
    scheduled_at: string;
    started_at?: string;
    viewers: number;
    playback_url: string;
}

export default function LiveClassesScreen({ navigation }: any) {
    const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
    const [scheduledStreams, setScheduledStreams] = useState<LiveStream[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'live' | 'scheduled'>('live');

    useEffect(() => {
        fetchStreams();

        // Poll for updates every 30 seconds
        const interval = setInterval(fetchStreams, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchStreams = async () => {
        try {
            const { data: live, error: liveError } = await supabase
                .from('live_streams')
                .select(`
          *,
          teacher:users(name, profile_image)
        `)
                .eq('status', 'live')
                .order('started_at', { ascending: false });

            const { data: scheduled, error: scheduledError } = await supabase
                .from('live_streams')
                .select(`
          *,
          teacher:users(name, profile_image)
        `)
                .eq('status', 'scheduled')
                .order('scheduled_at', { ascending: true });

            if (liveError) throw liveError;
            if (scheduledError) throw scheduledError;

            setLiveStreams(live || []);
            setScheduledStreams(scheduled || []);
        } catch (error) {
            console.error('Error fetching streams:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinStream = (stream: LiveStream) => {
        navigation.navigate('LivePlayer', {
            streamId: stream.id,
            streamUrl: stream.playback_url,
            title: stream.title,
        });
    };

    const renderStreamCard = ({ item }: { item: LiveStream }) => (
        <TouchableOpacity
            style={styles.streamCard}
            onPress={() => item.status === 'live' && handleJoinStream(item)}
            disabled={item.status !== 'live'}
        >
            {/* Thumbnail/Status */}
            <View style={styles.thumbnail}>
                <View style={[
                    styles.statusBadge,
                    item.status === 'live' ? styles.liveBadge : styles.scheduledBadge
                ]}>
                    <Radio size={12} color="#FFF" />
                    <Text style={styles.statusText}>
                        {item.status === 'live' ? 'LIVE' : 'SCHEDULED'}
                    </Text>
                </View>
                {item.status === 'live' && (
                    <View style={styles.viewersBadge}>
                        <Users size={12} color="#FFF" />
                        <Text style={styles.viewersText}>{item.viewers || 0}</Text>
                    </View>
                )}
            </View>

            {/* Content */}
            <View style={styles.streamContent}>
                <Text style={styles.streamTitle} numberOfLines={2}>
                    {item.title}
                </Text>

                {item.teacher && (
                    <View style={styles.teacherInfo}>
                        <View style={styles.teacherAvatar}>
                            <Text style={styles.teacherInitial}>
                                {item.teacher.name?.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <Text style={styles.teacherName}>{item.teacher.name}</Text>
                    </View>
                )}

                <View style={styles.streamMeta}>
                    <View style={styles.metaItem}>
                        <Calendar size={14} color={COLORS.textMuted} />
                        <Text style={styles.metaText}>
                            {new Date(item.status === 'live' ? item.started_at! : item.scheduled_at)
                                .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Clock size={14} color={COLORS.textMuted} />
                        <Text style={styles.metaText}>
                            {new Date(item.status === 'live' ? item.started_at! : item.scheduled_at)
                                .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                </View>

                {item.status === 'live' && (
                    <TouchableOpacity
                        style={styles.joinButton}
                        onPress={() => handleJoinStream(item)}
                    >
                        <Play size={16} color="#FFF" fill="#FFF" />
                        <Text style={styles.joinButtonText}>Join Live Class</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

    const displayStreams = activeTab === 'live' ? liveStreams : scheduledStreams;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Live Classes</Text>
                <Text style={styles.headerSubtitle}>
                    {liveStreams.length} live now · {scheduledStreams.length} scheduled
                </Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'live' && styles.activeTab]}
                    onPress={() => setActiveTab('live')}
                >
                    <Text style={[styles.tabText, activeTab === 'live' && styles.activeTabText]}>
                        Live Now ({liveStreams.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'scheduled' && styles.activeTab]}
                    onPress={() => setActiveTab('scheduled')}
                >
                    <Text style={[styles.tabText, activeTab === 'scheduled' && styles.activeTabText]}>
                        Scheduled ({scheduledStreams.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Streams List */}
            <FlatList
                data={displayStreams}
                renderItem={renderStreamCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Radio size={48} color={COLORS.textMuted} />
                        <Text style={styles.emptyTitle}>
                            {activeTab === 'live' ? 'No Live Classes' : 'No Scheduled Classes'}
                        </Text>
                        <Text style={styles.emptyText}>
                            {activeTab === 'live'
                                ? 'Check back later for live classes'
                                : 'Your scheduled classes will appear here'}
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginTop: 4,
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: COLORS.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textMuted,
    },
    activeTabText: {
        color: COLORS.primary,
    },
    listContent: {
        padding: 16,
    },
    streamCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    thumbnail: {
        height: 180,
        backgroundColor: '#F3F4F6',
        justifyContent: 'space-between',
        padding: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
    },
    liveBadge: {
        backgroundColor: COLORS.error,
    },
    scheduledBadge: {
        backgroundColor: COLORS.warning,
    },
    statusText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '700',
    },
    viewersBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
    },
    viewersText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    streamContent: {
        padding: 16,
    },
    streamTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 12,
    },
    teacherInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    teacherAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    teacherInitial: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    teacherName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    streamMeta: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    joinButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
    },
    joinButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textMuted,
        textAlign: 'center',
    },
});
