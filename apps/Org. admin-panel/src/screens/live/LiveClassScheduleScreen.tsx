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
    Eye
} from 'lucide-react-native';
import { supabase } from '../../config/supabase';
import { COLORS } from '../../constants/colors';

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
    }, []);

    const fetchStreams = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('live_streams')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setStreams(data || []);
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

    const copyToClipboard = (text: string, label: string) => {
        Clipboard.setString(text);
        Alert.alert('Copied!', `${label} copied to clipboard`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'live': return COLORS.success;
            case 'scheduled': return COLORS.warning;
            case 'ended': return COLORS.textSecondary;
            default: return COLORS.textSecondary;
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
                                    <Eye color={COLORS.textSecondary} size={14} />
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
                                <Calendar color={COLORS.textSecondary} size={14} />
                                <Text style={styles.metaText}>
                                    {new Date(stream.scheduled_at).toLocaleDateString()}
                                </Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Clock color={COLORS.textSecondary} size={14} />
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
                                placeholderTextColor={COLORS.textSecondary}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="What will you cover in this class?"
                                placeholderTextColor={COLORS.textSecondary}
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
                                placeholderTextColor={COLORS.textSecondary}
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

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={() => setShowOBSModal(false)}
                        >
                            <Text style={styles.submitButtonText}>Got It!</Text>
                        </TouchableOpacity>
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
        color: COLORS.textSecondary,
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
        color: COLORS.textSecondary,
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
        color: COLORS.textSecondary,
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
        color: COLORS.textSecondary,
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
        color: COLORS.textSecondary,
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
        color: COLORS.textSecondary,
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
        color: COLORS.textSecondary,
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
        color: COLORS.textSecondary,
        lineHeight: 22,
    },
});
