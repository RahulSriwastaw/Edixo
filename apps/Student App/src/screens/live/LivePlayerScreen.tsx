import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    StatusBar
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import {
    ArrowLeft,
    Maximize,
    Minimize,
    Users,
    Wifi,
    Signal,
    Activity,
    Clock,
    Presentation
} from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../constants/colors';
import LiveChat from '../../components/live/LiveChat';
import PollOverlay from '../../components/live/PollOverlay';
import AnnotationLayer from '../../components/live/AnnotationLayer';
import WhiteboardPlayer from '../../components/live/WhiteboardPlayer';
import { Edit2 } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface LivePlayerScreenProps {
    route: {
        params: {
            streamId: string;
            streamUrl: string;
            title: string;
        };
    };
    navigation: any;
}

export default function LivePlayerScreen({ route, navigation }: any) {
    const { streamId, streamUrl, title } = route.params;
    const videoRef = useRef<Video>(null);

    const [viewers, setViewers] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isBuffering, setIsBuffering] = useState(true);
    const [quality, setQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('excellent');
    const [bitrate, setBitrate] = useState(0); // in kbps
    const [latency, setLatency] = useState(0); // in ms
    const [showStats, setShowStats] = useState(false);
    const [studentId, setStudentId] = useState<string | null>(null);
    const [studentName, setStudentName] = useState('');
    const [showAnnotations, setShowAnnotations] = useState(false);
    const [showWhiteboard, setShowWhiteboard] = useState(false);

    useEffect(() => {
        // Track viewer join
        trackViewerJoin();

        // Fetch viewer count periodically
        const interval = setInterval(fetchViewerCount, 5000);

        // Simulate quality monitoring
        const qualityInterval = setInterval(monitorQuality, 3000);

        return () => {
            clearInterval(interval);
            clearInterval(qualityInterval);
            trackViewerLeave();
        };
    }, []);

    const monitorQuality = () => {
        // In a real app, this would come from the player engine (e.g. Agora SDK)
        // Here we simulate based on buffering state and random variations
        if (isBuffering) {
            setQuality('poor');
            setBitrate(prev => Math.max(0, prev - 500));
        } else {
            const baseBitrate = 2500; // 2.5 Mbps
            const variation = Math.random() * 400 - 200;
            setBitrate(Math.floor(baseBitrate + variation));
            setQuality('excellent');
            setLatency(Math.floor(Math.random() * 50 + 20)); // 20-70ms
        }
    };

    const trackViewerJoin = async () => {
        try {
            // Get current student ID from session
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: student } = await supabase
                .from('students')
                .select('id')
                .eq('auth_user_id', user.id)
                .single();

            if (student) {
                setStudentId(student.id);

                // Fetch student name from users table
                const { data: userRecord } = await supabase
                    .from('users')
                    .select('full_name')
                    .eq('auth_user_id', user.id)
                    .single();

                if (userRecord) setStudentName(userRecord.full_name);

                // Track viewer join
                await supabase
                    .from('stream_viewers')
                    .insert([{
                        stream_id: streamId,
                        student_id: student.id,
                        joined_at: new Date().toISOString(),
                    }]);
            }
        } catch (error) {
            console.error('Error tracking viewer join:', error);
        }
    };

    const trackViewerLeave = async () => {
        if (!studentId) return;

        try {
            await supabase
                .from('stream_viewers')
                .update({ left_at: new Date().toISOString() })
                .eq('stream_id', streamId)
                .eq('student_id', studentId)
                .is('left_at', null);
        } catch (error) {
            console.error('Error tracking viewer leave:', error);
        }
    };

    const fetchViewerCount = async () => {
        try {
            const { data, error } = await supabase
                .from('stream_viewers')
                .select('id')
                .eq('stream_id', streamId)
                .is('left_at', null);

            if (!error && data) {
                setViewers(data.length);
            }
        } catch (error) {
            console.error('Error fetching viewer count:', error);
        }
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        if (isFullscreen) {
            StatusBar.setHidden(false);
        } else {
            StatusBar.setHidden(true);
        }
    };

    return (
        <View style={styles.container}>
            {/* Video Player */}
            <View style={[
                styles.videoContainer,
                isFullscreen && styles.fullscreenVideo
            ]}>
                <Video
                    ref={videoRef}
                    source={{ uri: streamUrl }}
                    style={[styles.video, showWhiteboard && { opacity: 0 }]}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping={false}
                    shouldPlay
                    onLoadStart={() => setIsBuffering(true)}
                    onLoad={() => setIsBuffering(false)}
                    onPlaybackStatusUpdate={status => {
                        if (!status.isLoaded) {
                            setIsBuffering(true);
                        } else {
                            setIsBuffering(status.isBuffering);
                        }
                    }}
                />

                <WhiteboardPlayer
                    streamId={streamId}
                    visible={showWhiteboard}
                />

                <AnnotationLayer visible={showAnnotations} />

                {isBuffering && (
                    <View style={styles.bufferingOverlay}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.bufferingText}>Connecting to live stream...</Text>
                    </View>
                )}

                {/* Live Badge */}
                <View style={styles.liveBadge}>
                    <View style={styles.liveIndicator} />
                    <Text style={styles.liveText}>LIVE</Text>
                </View>

                {/* Viewer Count */}
                <View style={styles.viewersIndicator}>
                    <Users size={14} color="#FFF" />
                    <Text style={styles.viewersText}>{viewers}</Text>
                </View>

                {/* Quality Indicator */}
                <TouchableOpacity
                    style={styles.qualityIndicator}
                    onPress={() => setShowStats(!showStats)}
                >
                    <Signal
                        size={14}
                        color={quality === 'excellent' ? COLORS.success : quality === 'poor' ? COLORS.error : '#EAB308'}
                    />
                    <Text style={styles.viewersText}>{quality.toUpperCase()}</Text>
                </TouchableOpacity>

                {/* Extended Stats Overlay */}
                {showStats && (
                    <View style={styles.statsOverlay}>
                        <View style={styles.statRow}>
                            <Activity size={12} color="#AAA" />
                            <Text style={styles.statLabel}>Bitrate:</Text>
                            <Text style={styles.statValue}>{(bitrate / 1024).toFixed(1)} Mbps</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Clock size={12} color="#AAA" />
                            <Text style={styles.statLabel}>Latency:</Text>
                            <Text style={styles.statValue}>{latency} ms</Text>
                        </View>
                    </View>
                )}

                {/* Top Controls */}
                {!isFullscreen && (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <ArrowLeft size={24} color="#FFF" />
                    </TouchableOpacity>
                )}

                {/* Fullscreen Toggle */}
                <TouchableOpacity
                    style={styles.fullscreenButton}
                    onPress={toggleFullscreen}
                >
                    {isFullscreen ? (
                        <Minimize size={24} color="#FFF" />
                    ) : (
                        <Maximize size={24} color="#FFF" />
                    )}
                </TouchableOpacity>

                {/* Whiteboard Mode Toggle */}
                <TouchableOpacity
                    style={[
                        styles.whiteboardToggle,
                        showWhiteboard && { backgroundColor: COLORS.primary }
                    ]}
                    onPress={() => setShowWhiteboard(!showWhiteboard)}
                >
                    <Presentation size={20} color="#FFF" />
                </TouchableOpacity>

                {/* Annotation Toggle */}
                <TouchableOpacity
                    style={[
                        styles.annotationToggle,
                        showAnnotations && { backgroundColor: COLORS.primary }
                    ]}
                    onPress={() => setShowAnnotations(!showAnnotations)}
                >
                    <Edit2 size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            {/* Stream Info (hidden in fullscreen) */}
            {!isFullscreen && (
                <View style={styles.streamInfo}>
                    <View style={styles.streamHeader}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <Text style={styles.streamTitle} numberOfLines={1}>{title}</Text>
                            <View style={styles.statItem}>
                                <Users size={14} color={COLORS.textMuted} />
                                <Text style={styles.statText}>{viewers} watching</Text>
                            </View>
                        </View>
                        <View style={styles.qualityBadge}>
                            <Wifi size={14} color={COLORS.success} />
                            <Text style={styles.qualityText}>HD</Text>
                        </View>
                    </View>

                    {/* Chat Section */}
                    <View style={styles.chatContainer}>
                        {studentId && (
                            <LiveChat
                                streamId={streamId}
                                studentId={studentId}
                                studentName={studentName}
                            />
                        )}
                    </View>
                </View>
            )}

            {/* Poll Overlay for Students */}
            {studentId && (
                <PollOverlay
                    streamId={streamId}
                    studentId={studentId}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    videoContainer: {
        width: width,
        height: width * (9 / 16),
        backgroundColor: '#000',
        position: 'relative',
    },
    fullscreenVideo: {
        width: height,
        height: width,
        transform: [{ rotate: '90deg' }],
        position: 'absolute',
        top: (width - height) / 2,
        left: (height - width) / 2,
    },
    video: {
        width: '100%',
        height: '100%',
    },
    bufferingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bufferingText: {
        color: '#FFF',
        marginTop: 12,
        fontSize: 14,
    },
    liveBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.error,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 6,
    },
    liveIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFF',
    },
    liveText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    viewersIndicator: {
        position: 'absolute',
        top: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
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
    qualityIndicator: {
        position: 'absolute',
        top: 16,
        right: 80,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 6,
    },
    statsOverlay: {
        position: 'absolute',
        top: 55,
        right: 16,
        backgroundColor: 'rgba(0,0,0,0.85)',
        padding: 12,
        borderRadius: 12,
        minWidth: 150,
        gap: 8,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statLabel: {
        color: '#AAA',
        fontSize: 11,
        flex: 1,
    },
    statValue: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '700',
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullscreenButton: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    streamInfo: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 16,
    },
    streamHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    qualityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0FDF4',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    qualityText: {
        color: COLORS.success,
        fontSize: 12,
        fontWeight: '700',
    },
    streamTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 12,
    },
    streamStats: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 14,
        color: COLORS.textMuted,
        fontWeight: '600',
    },
    descriptionBox: {
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
    },
    descriptionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 14,
        color: COLORS.textMuted,
        lineHeight: 20,
    },
    chatContainer: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    annotationToggle: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    whiteboardToggle: {
        position: 'absolute',
        bottom: 16,
        left: 64,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
