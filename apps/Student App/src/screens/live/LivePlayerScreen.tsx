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
    Wifi
} from 'lucide-react-native';
import { supabase } from '../../config/supabase';
import { COLORS } from '../../constants/colors';

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

export default function LivePlayerScreen({ route, navigation }: LivePlayerScreenProps) {
    const { streamId, streamUrl, title } = route.params;
    const videoRef = useRef<Video>(null);

    const [viewers, setViewers] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isBuffering, setIsBuffering] = useState(true);
    const [studentId, setStudentId] = useState<string | null>(null);

    useEffect(() => {
        // Track viewer join
        trackViewerJoin();

        // Fetch viewer count periodically
        const interval = setInterval(fetchViewerCount, 5000);

        return () => {
            clearInterval(interval);
            trackViewerLeave();
        };
    }, []);

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
                    style={styles.video}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping={false}
                    shouldPlay
                    onLoadStart={() => setIsBuffering(true)}
                    onLoad={() => setIsBuffering(false)}
                    onBuffer={({ isBuffering }) => setIsBuffering(isBuffering)}
                />

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
            </View>

            {/* Stream Info (hidden in fullscreen) */}
            {!isFullscreen && (
                <View style={styles.streamInfo}>
                    <View style={styles.streamHeader}>
                        <View style={styles.qualityBadge}>
                            <Wifi size={14} color={COLORS.success} />
                            <Text style={styles.qualityText}>HD</Text>
                        </View>
                    </View>

                    <Text style={styles.streamTitle}>{title}</Text>

                    <View style={styles.streamStats}>
                        <View style={styles.statItem}>
                            <Users size={16} color={COLORS.textSecondary} />
                            <Text style={styles.statText}>{viewers} watching now</Text>
                        </View>
                    </View>

                    {/* Stream Description */}
                    <View style={styles.descriptionBox}>
                        <Text style={styles.descriptionTitle}>About this live class</Text>
                        <Text style={styles.descriptionText}>
                            You're watching a live class. Questions? Use the chat to interact with your teacher.
                        </Text>
                    </View>
                </View>
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
        color: COLORS.textSecondary,
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
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
});
