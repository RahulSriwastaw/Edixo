import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Plus, Trash2, Send, BarChart2, X } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../constants/colors';

interface Poll {
    id: string;
    question: string;
    options: string[];
    is_active: boolean;
    ended_at: string | null;
}

interface PollCreatorProps {
    streamId: string;
}

export default function PollCreator({ streamId }: PollCreatorProps) {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [activePoll, setActivePoll] = useState<Poll | null>(null);
    const [results, setResults] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchActivePoll();
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
                fetchVotes(data[0].id);
                subscribeToVotes(data[0].id);
            }
        } catch (error) {
            console.error('Error fetching active poll:', error);
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
            console.error('Error fetching votes:', error);
        }
    };

    const subscribeToVotes = (pollId: string) => {
        return supabase
            .channel(`public:stream_poll_votes:poll_id=eq.${pollId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'stream_poll_votes',
                    filter: `poll_id=eq.${pollId}`,
                },
                () => fetchVotes(pollId)
            )
            .subscribe();
    };

    const addOption = () => {
        if (options.length < 6) {
            setOptions([...options, '']);
        }
    };

    const removeOption = (index: number) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
        }
    };

    const updateOption = (text: string, index: number) => {
        const newOptions = [...options];
        newOptions[index] = text;
        setOptions(newOptions);
    };

    const createPoll = async () => {
        if (!question.trim()) {
            Alert.alert('Error', 'Please enter a question');
            return;
        }

        const validOptions = options.filter(o => o.trim() !== '');
        if (validOptions.length < 2) {
            Alert.alert('Error', 'Please provide at least 2 options');
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('stream_polls')
                .insert({
                    stream_id: streamId,
                    question: question.trim(),
                    options: validOptions,
                })
                .select()
                .single();

            if (error) throw error;

            setActivePoll(data);
            setQuestion('');
            setOptions(['', '']);
            fetchVotes(data.id);
            subscribeToVotes(data.id);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const endPoll = async () => {
        if (!activePoll) return;

        try {
            const { error } = await supabase
                .from('stream_polls')
                .update({ is_active: false, ended_at: new Date().toISOString() })
                .eq('id', activePoll.id);

            if (error) throw error;
            setActivePoll(null);
            setResults({});
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    if (activePoll) {
        const totalVotes = Object.values(results).reduce((a, b) => a + b, 0);

        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <BarChart2 size={20} color={COLORS.primary} />
                    <Text style={styles.headerTitle}>Live Poll Results</Text>
                </View>

                <ScrollView style={styles.content}>
                    <Text style={styles.pollQuestion}>{activePoll.question}</Text>

                    {activePoll.options.map((option, index) => {
                        const votes = results[index] || 0;
                        const percentage = totalVotes > 0 ? (votes / totalVotes) : 0;

                        return (
                            <View key={index} style={styles.resultItem}>
                                <View style={styles.resultLabel}>
                                    <Text style={styles.optionText}>{option}</Text>
                                    <Text style={styles.votesCount}>{votes} votes ({Math.round(percentage * 100)}%)</Text>
                                </View>
                                <View style={styles.progressContainer}>
                                    <View
                                        style={[
                                            styles.progressBar,
                                            { width: `${percentage * 100}%`, backgroundColor: COLORS.primary }
                                        ]}
                                    />
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>

                <TouchableOpacity
                    style={styles.endButton}
                    onPress={endPoll}
                >
                    <Text style={styles.endButtonText}>End Poll</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Plus size={20} color={COLORS.primary} />
                <Text style={styles.headerTitle}>Create New Poll</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Question</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Which topic do you want to cover next?"
                        value={question}
                        onChangeText={setQuestion}
                        multiline
                    />
                </View>

                <Text style={styles.label}>Options</Text>
                {options.map((option, index) => (
                    <View key={index} style={styles.optionRow}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChangeText={(text) => updateOption(text, index)}
                        />
                        {options.length > 2 && (
                            <TouchableOpacity
                                onPress={() => removeOption(index)}
                                style={styles.removeBtn}
                            >
                                <Trash2 size={20} color={COLORS.error} />
                            </TouchableOpacity>
                        )}
                    </View>
                ))}

                {options.length < 6 && (
                    <TouchableOpacity style={styles.addOptionBtn} onPress={addOption}>
                        <Plus size={16} color={COLORS.primary} />
                        <Text style={styles.addOptionText}>Add Option</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            <TouchableOpacity
                style={[styles.createBtn, loading && styles.disabledBtn]}
                onPress={createPoll}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <>
                        <Send size={18} color="#FFF" />
                        <Text style={styles.createBtnText}>Launch Poll</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    pollQuestion: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 20,
    },
    resultItem: {
        marginBottom: 16,
    },
    resultLabel: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    optionText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '600',
    },
    votesCount: {
        fontSize: 12,
        color: '#6B7280',
    },
    progressContainer: {
        height: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: '#111827',
        backgroundColor: '#F9FAFB',
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    removeBtn: {
        padding: 8,
    },
    addOptionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
        paddingVertical: 8,
    },
    addOptionText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
    },
    createBtn: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        margin: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    disabledBtn: {
        opacity: 0.6,
    },
    createBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    endButton: {
        borderWidth: 1,
        borderColor: COLORS.error,
        padding: 14,
        margin: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    endButtonText: {
        color: COLORS.error,
        fontWeight: 'bold',
    }
});
