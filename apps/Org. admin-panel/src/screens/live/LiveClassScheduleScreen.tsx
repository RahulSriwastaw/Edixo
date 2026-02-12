import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Modal,
    StyleSheet,
    Alert,
    Clipboard
} from 'react-native';
import {
    Radio,
    Plus,
    Copy,
    ExternalLink,
    Calendar,
    Clock,
    Users,
    Eye,
    X
} from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../constants/colors';
import TeacherChatPanel from '../../components/live/TeacherChatPanel';
import PollCreator from '../../components/live/PollCreator';

interface LiveStream {
    id: string;
    title: string;
    description: string;
    stream_key: string;
    rtmp_url: string;
    playback_url: string;
    status: 'scheduled' | 'live' | 'ended';
    scheduled_at: string;
    started_at?: string;
    created_at?: string;
    viewers: number;
}

export default function LiveClassScheduleScreen({ navigation }: any) {
    const [streams, setStreams] = useState<LiveStream[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showOBSModal, setShowOBSModal] = useState(false);
    const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');

    useEffect(() => {
        fetchStreams();

        // Real-time subscription for live_streams
        const subscription = supabase
            .channel('live_streams_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'live_streams' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setStreams(prev => [payload.new as LiveStream, ...prev].sort(sortStreams));
                    } else if (payload.eventType === 'UPDATE') {
                        setStreams(prev => prev.map(s => s.id === payload.new.id ? (payload.new as LiveStream) : s).sort(sortStreams));
                        if (selectedStream?.id === payload.new.id) {
                            setSelectedStream(payload.new as LiveStream);
                        }
                    } else if (payload.eventType === 'DELETE') {
                        setStreams(prev => prev.filter(s => s.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [selectedStream?.id]);

    const sortStreams = (a: LiveStream, b: LiveStream) => {
        if (a.status === 'live' && b.status !== 'live') return -1;
        if (a.status !== 'live' && b.status === 'live') return 1;
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    };

    const fetchStreams = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('live_streams')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setStreams((data || []).sort(sortStreams));
        } catch (error) {
            console.error('Error fetching streams:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateStreamKey = () => {
        return `stream_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    };

    const handleCreateStream = async () => {
        if (!title || !scheduledDate) {
            Alert.alert('Error', 'Please fill in title and scheduled date');
            return;
        }

        try {
            const streamKey = generateStreamKey();
            const rtmpUrl = 'rtmp://stream.qbank.com/live';
            const playbackUrl = `https://stream.qbank.com/live/${streamKey}/index.m3u8`;

            const { data, error } = await supabase
                .from('live_streams')
                .insert([
                    {
                        title,
                        description,
                        stream_key: streamKey,
                        rtmp_url: rtmpUrl,
                        playback_url: playbackUrl,
                        status: 'scheduled',
                        scheduled_at: scheduledDate,
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            setStreams([data, ...streams]);
            setSelectedStream(data);
            setShowCreateModal(false);
            setShowOBSModal(true);

            // Reset form
            setTitle('');
            setDescription('');
            setScheduledDate('');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleStartStream = async () => {
        if (!selectedStream) return;
        try {
            const { data, error } = await supabase
                .from('live_streams')
                .update({
                    status: 'live',
                    started_at: new Date().toISOString()
                })
                .eq('id', selectedStream.id)
                .select()
                .single();

            if (error) throw error;
            setSelectedStream(data);
            setStreams(streams.map(s => s.id === data.id ? data : s));
            Alert.alert('Success', 'Class is now LIVE! Your students have been notified.');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleEndStream = async () => {
        if (!selectedStream) return;
        Alert.alert(
            'End Class',
            'Are you sure you want to end this live session?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'End Session',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { data, error } = await supabase
                                .from('live_streams')
                                .update({ status: 'ended' })
                                .eq('id', selectedStream.id)
                                .select()
                                .single();

                            if (error) throw error;
                            setSelectedStream(data);
                            setStreams(streams.map(s => s.id === data.id ? data : s));
                            Alert.alert('Ended', 'This class session has been archived.');
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        }
                    }
                }
            ]
        );
    };

    const copyToClipboard = (text: string, label: string) => {
        Clipboard.setString(text);
        Alert.alert('Copied!', `${label} copied to clipboard`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'live': return COLORS.success;
            case 'scheduled': return COLORS.warning;
            case 'ended': return COLORS.textMuted;
            default: return COLORS.textMuted;
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Live Classes</Text>
                    <Text style={styles.headerSubtitle}>Schedule and manage live streams</Text>
                </View>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => setShowCreateModal(true)}
                >
                    <Plus color="#FFF" size={20} />
                    <Text style={styles.createButtonText}>Schedule Live</Text>
                </TouchableOpacity>
            </View>

            {/* Streams List */}
            <ScrollView style={styles.streamsList}>
                {streams.map((stream) => (
                    <TouchableOpacity
                        key={stream.id}
                        style={styles.streamCard}
                        onPress={() => {
                            setSelectedStream(stream);
                            setShowOBSModal(true);
                        }}
                    >
                        <View style={styles.streamHeader}>
                            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(stream.status)}20` }]}>
                                <Radio color={getStatusColor(stream.status)} size={14} />
                                <Text style={[styles.statusText, { color: getStatusColor(stream.status) }]}>
                                    {stream.status.toUpperCase()}
                                </Text>
                            </View>
                            {stream.status === 'live' && (
                                <View style={styles.viewersCount}>
                                    <Eye color={COLORS.textMuted} size={14} />
                                    <Text style={styles.viewersText}>{stream.viewers || 0}</Text>
                                </View>
                            )}
                        </View>

                        <Text style={styles.streamTitle}>{stream.title}</Text>
                        <Text style={styles.streamDescription} numberOfLines={2}>
                            {stream.description}
                        </Text>

                        <View style={styles.streamMeta}>
                            <View style={styles.metaItem}>
                                <Calendar color={COLORS.textMuted} size={14} />
                                <Text style={styles.metaText}>
                                    {new Date(stream.scheduled_at).toLocaleDateString()}
                                </Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Clock color={COLORS.textMuted} size={14} />
                                <Text style={styles.metaText}>
                                    {new Date(stream.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Create Stream Modal */}
            <Modal
                visible={showCreateModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCreateModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Schedule Live Class</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Title *</Text>
                            <TextInput
                                style={styles.input}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="e.g., Physics Chapter 5"
                                placeholderTextColor={COLORS.textMuted}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="What will you cover in this class?"
                                placeholderTextColor={COLORS.textMuted}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Scheduled Date & Time *</Text>
                            <TextInput
                                style={styles.input}
                                value={scheduledDate}
                                onChangeText={setScheduledDate}
                                placeholder="YYYY-MM-DD HH:MM:SS"
                                placeholderTextColor={COLORS.textMuted}
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowCreateModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleCreateStream}
                            >
                                <Text style={styles.submitButtonText}>Create Live Class</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* OBS Setup Instructions Modal */}
            <Modal
                visible={showOBSModal && selectedStream !== null}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowOBSModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <ScrollView style={styles.modalContent}>
                        <Text style={styles.modalTitle}>OBS Setup Instructions</Text>
                        <Text style={styles.modalSubtitle}>{selectedStream?.title}</Text>

                        {/* Stream Credentials */}
                        <View style={styles.credentialsBox}>
                            <Text style={styles.credentialLabel}>RTMP Server URL</Text>
                            <View style={styles.credentialRow}>
                                <Text style={styles.credentialValue} numberOfLines={1}>
                                    {selectedStream?.rtmp_url}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => copyToClipboard(selectedStream?.rtmp_url || '', 'RTMP URL')}
                                >
                                    <Copy color={COLORS.primary} size={20} />
                                </TouchableOpacity>
                            </View>

                            <Text style={[styles.credentialLabel, { marginTop: 16 }]}>Stream Key</Text>
                            <View style={styles.credentialRow}>
                                <Text style={styles.credentialValue} numberOfLines={1}>
                                    {selectedStream?.stream_key}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => copyToClipboard(selectedStream?.stream_key || '', 'Stream Key')}
                                >
                                    <Copy color={COLORS.primary} size={20} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Instructions */}
                        <View style={styles.instructionsBox}>
                            <Text style={styles.sectionTitle}>Step 1: Download OBS Studio</Text>
                            <Text style={styles.instructionText}>
                                Visit obsproject.com/download and install OBS Studio
                            </Text>

                            <Text style={styles.sectionTitle}>Step 2: Configure Stream Settings</Text>
                            <Text style={styles.instructionText}>
                                • Open OBS → Settings → Stream{'\n'}
                                • Service: Custom{'\n'}
                                • Server: (paste RTMP URL above){'\n'}
                                • Stream Key: (paste Stream Key above)
                            </Text>

                            <Text style={styles.sectionTitle}>Step 3: Add Sources</Text>
                            <Text style={styles.instructionText}>
                                • Screen Capture (for presentations){'\n'}
                                • Video Capture Device (webcam){'\n'}
                                • Audio Input Capture (microphone)
                            </Text>

                            <Text style={styles.sectionTitle}>Step 4: Start Streaming</Text>
                            <Text style={styles.instructionText}>
                                Click "Start Streaming" in OBS and your live class will begin!
                            </Text>
                        </View>

                        {/* Stream Controls */}
                        <View style={styles.controlSection}>
                            {selectedStream?.status === 'scheduled' && (
                                <TouchableOpacity
                                    style={[styles.fullWidthButton, { backgroundColor: COLORS.success }]}
                                    onPress={handleStartStream}
                                >
                                    <Radio color="#FFF" size={20} />
                                    <Text style={styles.fullWidthButtonText}>GO LIVE NOW</Text>
                                </TouchableOpacity>
                            )}

                            {selectedStream?.status === 'live' && (
                                <TouchableOpacity
                                    style={[styles.fullWidthButton, { backgroundColor: COLORS.error }]}
                                    onPress={handleEndStream}
                                >
                                    <X color="#FFF" size={20} />
                                    <Text style={styles.fullWidthButtonText}>END STREAM</Text>
                                </TouchableOpacity>
                            )}

                            {selectedStream?.status === 'ended' && (
                                <View style={[styles.infoBox, { backgroundColor: '#F1F5F9' }]}>
                                    <Text style={[styles.infoText, { color: '#64748B' }]}>
                                        This stream has ended and is being archived.
                                    </Text>
                                </View>
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={() => setShowOBSModal(false)}
                        >
                            <Text style={styles.submitButtonText}>Got It!</Text>
                        </TouchableOpacity>

                        {/* Chat Panel for Teachers */}
                        <View style={styles.chatSection}>
                            <Text style={styles.sectionTitle}>Live Chat Moderation</Text>
                            <View style={styles.chatContainer}>
                                <TeacherChatPanel streamId={selectedStream?.id || ''} />
                            </View>
                        </View>

                        {/* Poll Section for Teachers */}
                        <View style={styles.chatSection}>
                            <Text style={styles.sectionTitle}>Interactive Polls</Text>
                            <View style={styles.pollContainer}>
                                <PollCreator streamId={selectedStream?.id || ''} />
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    createButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
    streamsList: {
        flex: 1,
        padding: 16,
    },
    streamCard: {
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    streamHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    viewersCount: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewersText: {
        fontSize: 14,
        color: COLORS.textMuted,
        fontWeight: '600',
    },
    streamTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 6,
    },
    streamDescription: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginBottom: 12,
    },
    streamMeta: {
        flexDirection: 'row',
        gap: 16,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
        width: '90%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginBottom: 20,
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: COLORS.text,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    cancelButton: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: COLORS.textMuted,
        fontWeight: '600',
        fontSize: 14,
    },
    submitButton: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
    credentialsBox: {
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    credentialLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textMuted,
        marginBottom: 6,
    },
    credentialRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    credentialValue: {
        flex: 1,
        fontFamily: 'monospace',
        fontSize: 12,
        color: COLORS.text,
    },
    instructionsBox: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
        marginTop: 16,
    },
    instructionText: {
        fontSize: 14,
        color: COLORS.textMuted,
        lineHeight: 22,
    },
    chatSection: {
        marginTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 16,
    },
    chatContainer: {
        height: 400,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginTop: 12,
    },
    pollContainer: {
        height: 450,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginTop: 12,
        marginBottom: 20,
    },
    controlSection: {
        marginTop: 8,
        gap: 12,
    },
    fullWidthButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    fullWidthButtonText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    infoBox: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    infoText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
