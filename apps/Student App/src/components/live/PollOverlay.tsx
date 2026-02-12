import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Animated,
    Dimensions
} from 'react-native';
import { BarChart2, CheckCircle, X } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../constants/colors';

interface Poll {
    id: string;
    question: string;
    options: string[];
}

interface PollOverlayProps {
    streamId: string;
    studentId: string;
}

export default function PollOverlay({ streamId, studentId }: PollOverlayProps) {
    const [activePoll, setActivePoll] = useState<Poll | null>(null);
    const [userVote, setUserVote] = useState<number | null>(null);
    const [results, setResults] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);

    const slideAnim = useState(new Animated.Value(Dimensions.get('window').height))[0];

    useEffect(() => {
        fetchActivePoll();
        const subscription = subscribeToPolls();

        return () => {
            subscription.unsubscribe();
        };
    }, [streamId]);

    const fetchActivePoll = async () => {
        try {
            const { data, error } = await supabase
                .from('stream_polls')
                .select('*')
                .eq('stream_id', streamId)
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) throw error;
            if (data && data.length > 0) {
                setActivePoll(data[0]);
                checkUserVote(data[0].id);
                if (visible === false) showPoll();
            } else {
                hidePoll();
            }
        } catch (error) {
            console.error('Error fetching active poll:', error);
        }
    };

    const activePollIdRef = useRef<string | null>(null);

    useEffect(() => {
        activePollIdRef.current = activePoll?.id || null;
    }, [activePoll]);

    const subscribeToPolls = () => {
        const pollSub = supabase
            .channel(`public:stream_polls:stream_id=eq.${streamId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'stream_polls',
                    filter: `stream_id=eq.${streamId}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT' && payload.new.is_active) {
                        setActivePoll(payload.new as Poll);
                        setUserVote(null);
                        setResults({});
                        showPoll();
                    } else if (payload.eventType === 'UPDATE' && !payload.new.is_active) {
                        hidePoll();
                    }
                }
            )
            .subscribe();

        // Subscribe to votes for live percentage updates
        const voteSub = supabase
            .channel(`votes_${streamId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'stream_poll_votes',
                },
                (payload) => {
                    // Only update if it's for the active poll
                    if (activePollIdRef.current && payload.new.poll_id === activePollIdRef.current) {
                        fetchVotes(activePollIdRef.current);
                    }
                }
            )
            .subscribe();

        return {
            unsubscribe: () => {
                pollSub.unsubscribe();
                voteSub.unsubscribe();
            }
        };
    };

    const checkUserVote = async (pollId: string) => {
        try {
            const { data, error } = await supabase
                .from('stream_poll_votes')
                .select('option_index')
                .eq('poll_id', pollId)
                .eq('user_id', studentId)
                .single();

            if (!error && data) {
                setUserVote(data.option_index);
                fetchVotes(pollId);
            }
        } catch (error) {
            // No vote found is fine
        }
    };

    const fetchVotes = async (pollId: string) => {
        try {
            const { data, error } = await supabase
                .from('stream_poll_votes')
                .select('option_index')
                .eq('poll_id', pollId);

            if (error) throw error;

            const counts: Record<number, number> = {};
            data?.forEach(v => {
                counts[v.option_index] = (counts[v.option_index] || 0) + 1;
            });
            setResults(counts);
        } catch (error) {
            console.error('Error fetching results:', error);
        }
    };

    const handleVote = async (index: number) => {
        if (!activePoll || userVote !== null || loading) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('stream_poll_votes')
                .insert({
                    poll_id: activePoll.id,
                    user_id: studentId,
                    option_index: index,
                });

            if (error) throw error;
            setUserVote(index);
            fetchVotes(activePoll.id);
        } catch (error) {
            console.error('Error voting:', error);
        } finally {
            setLoading(false);
        }
    };

    const showPoll = () => {
        setVisible(true);
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8
        }).start();
    };

    const hidePoll = () => {
        Animated.timing(slideAnim, {
            toValue: Dimensions.get('window').height,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setVisible(false);
            setActivePoll(null);
        });
    };

    if (!visible || !activePoll) return null;

    const totalVotes = Object.values(results).reduce((a, b) => a + b, 0);

    return (
        <Animated.View style={[styles.overlay, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.card}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <BarChart2 size={20} color={COLORS.primary} />
                        <Text style={styles.headerTitle}>Live Poll</Text>
                    </View>
                    <TouchableOpacity onPress={hidePoll} style={styles.closeBtn}>
                        <X size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.question}>{activePoll.question}</Text>

                <View style={styles.optionsContainer}>
                    {activePoll.options.map((option, index) => {
                        const isSelected = userVote === index;
                        const votes = results[index] || 0;
                        const percentage = totalVotes > 0 ? (votes / totalVotes) : 0;

                        if (userVote !== null) {
                            // Results View
                            return (
                                <View key={index} style={styles.resultItem}>
                                    <View style={styles.resultInfo}>
                                        <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                                            {option} {isSelected && '(Your Vote)'}
                                        </Text>
                                        <Text style={styles.percentageText}>{Math.round(percentage * 100)}%</Text>
                                    </View>
                                    <View style={styles.progressTrack}>
                                        <View
                                            style={[
                                                styles.progressBar,
                                                { width: `${percentage * 100}%`, backgroundColor: isSelected ? COLORS.primary : '#D1D5DB' }
                                            ]}
                                        />
                                    </View>
                                </View>
                            );
                        }

                        // Voting View
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[styles.optionButton, loading && styles.disabledOption]}
                                onPress={() => handleVote(index)}
                                disabled={loading}
                            >
                                <Text style={styles.optionButtonText}>{option}</Text>
                                {loading && <ActivityIndicator size="small" color={COLORS.primary} />}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {userVote !== null && (
                    <View style={styles.footer}>
                        <CheckCircle size={16} color={COLORS.success} />
                        <Text style={styles.footerText}>{totalVotes} total votes</Text>
                    </View>
                )}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        zIndex: 1000,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    closeBtn: {
        padding: 4,
    },
    question: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 20,
        lineHeight: 24,
    },
    optionsContainer: {
        gap: 12,
    },
    optionButton: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    optionButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
    },
    disabledOption: {
        opacity: 0.7,
    },
    resultItem: {
        marginBottom: 4,
    },
    resultInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    optionText: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
    },
    selectedOptionText: {
        color: '#111827',
        fontWeight: 'bold',
    },
    percentageText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
    },
    progressTrack: {
        height: 10,
        backgroundColor: '#E5E7EB',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 5,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    footerText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
});
