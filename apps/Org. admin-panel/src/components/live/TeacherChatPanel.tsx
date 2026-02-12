import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Alert
} from 'react-native';
import { Send, Trash2, Shield, User } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../constants/colors';

interface Message {
    id: string;
    content: string;
    user_id: string;
    created_at: string;
    is_hidden: boolean;
    user?: {
        full_name: string;
        role?: string;
    };
}

interface TeacherChatPanelProps {
    streamId: string;
}

export default function TeacherChatPanel({ streamId }: TeacherChatPanelProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        fetchMessages();
        const subscription = subscribeToMessages();

        return () => {
            subscription.unsubscribe();
        };
    }, [streamId]);

    const fetchMessages = async () => {
        try {
            const { data, error } = await supabase
                .from('stream_messages')
                .select(`
          *,
          user:users(full_name, role)
        `)
                .eq('stream_id', streamId)
                .order('created_at', { ascending: true })
                .limit(50);

            if (error) throw error;
            setMessages(data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setLoading(false);
        }
    };

    const subscribeToMessages = () => {
        return supabase
            .channel(`public:stream_messages:stream_id=eq.${streamId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'stream_messages',
                    filter: `stream_id=eq.${streamId}`,
                },
                async (payload) => {
                    const { data: userData } = await supabase
                        .from('users')
                        .select('full_name, role')
                        .eq('id', payload.new.user_id)
                        .single();

                    const newMsg = {
                        ...payload.new,
                        user: userData,
                    } as Message;

                    setMessages((prev) => [...prev, newMsg]);

                    setTimeout(() => {
                        flatListRef.current?.scrollToEnd({ animated: true });
                    }, 100);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'stream_messages',
                    filter: `stream_id=eq.${streamId}`,
                },
                (payload) => {
                    // Handle hidden/deleted messages update
                    setMessages(prev => prev.map(msg =>
                        msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
                    ));
                }
            )
            .subscribe();
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const messageContent = newMessage.trim();
        setNewMessage('');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get user record to link message
            const { data: userRecord } = await supabase
                .from('users')
                .select('id')
                .eq('auth_user_id', user.id)
                .single();

            if (!userRecord) return;

            const { error } = await supabase
                .from('stream_messages')
                .insert({
                    stream_id: streamId,
                    user_id: userRecord.id,
                    content: messageContent,
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Error', 'Failed to send message');
        }
    };

    const deleteMessage = async (messageId: string) => {
        try {
            const { error } = await supabase
                .from('stream_messages')
                .update({ is_hidden: true })
                .eq('id', messageId);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting message:', error);
            Alert.alert('Error', 'Failed to delete message');
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        if (item.is_hidden) {
            return (
                <View style={styles.hiddenMessageRow}>
                    <Text style={styles.hiddenText}>Message deleted by moderator</Text>
                </View>
            );
        }

        const isTeacher = item.user?.role === 'teacher' || item.user?.role === 'org_admin';

        return (
            <View style={styles.messageRow}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {item.user?.full_name?.charAt(0) || 'U'}
                    </Text>
                </View>
                <View style={styles.bubbleContainer}>
                    <View style={styles.nameRow}>
                        <Text style={styles.userName}>{item.user?.full_name}</Text>
                        {isTeacher && (
                            <View style={styles.teacherBadge}>
                                <Shield size={10} color="#FFF" />
                                <Text style={styles.teacherBadgeText}>Teacher</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.messageText}>{item.content}</Text>
                </View>

                {/* Delete Button */}
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteMessage(item.id)}
                >
                    <Trash2 size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Live Chat & Moderation</Text>
            </View>

            {loading ? (
                <ActivityIndicator style={{ marginTop: 20 }} color={COLORS.primary} />
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />
            )}

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Send a message as Teacher..."
                    placeholderTextColor="#9CA3AF"
                    value={newMessage}
                    onChangeText={setNewMessage}
                    onSubmitEditing={sendMessage}
                />
                <TouchableOpacity
                    style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
                    onPress={sendMessage}
                    disabled={!newMessage.trim()}
                >
                    <Send size={20} color={newMessage.trim() ? '#FFF' : '#9CA3AF'} />
                </TouchableOpacity>
            </View>
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
        backgroundColor: '#F9FAFB',
    },
    headerTitle: {
        fontWeight: 'bold',
        color: '#374151',
        fontSize: 16,
    },
    listContent: {
        padding: 16,
        paddingBottom: 20,
    },
    hiddenMessageRow: {
        padding: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        marginBottom: 8,
        alignItems: 'center',
    },
    hiddenText: {
        fontSize: 12,
        color: '#9CA3AF',
        fontStyle: 'italic',
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#6B7280',
    },
    bubbleContainer: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 12,
        borderTopLeftRadius: 2,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 6,
    },
    userName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#374151',
    },
    teacherBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        gap: 4,
    },
    teacherBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    messageText: {
        fontSize: 14,
        color: '#1F2937',
        lineHeight: 20,
    },
    deleteButton: {
        padding: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        backgroundColor: '#FFF',
    },
    input: {
        flex: 1,
        height: 44,
        backgroundColor: '#F3F4F6',
        borderRadius: 22,
        paddingHorizontal: 16,
        fontSize: 14,
        color: '#1F2937',
        marginRight: 8,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#E5E7EB',
    },
});
