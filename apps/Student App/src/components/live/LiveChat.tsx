import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Send, User as UserIcon } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../constants/colors';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  is_hidden?: boolean;
  user?: {
    full_name: string;
  };
}

interface LiveChatProps {
  streamId: string;
  studentId: string;
  studentName: string;
}

export default function LiveChat({ streamId, studentId, studentName }: LiveChatProps) {
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
          user:users(full_name)
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
          // Fetch user details for the new message
          const { data: userData } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', payload.new.user_id)
            .single();

          const newMsg = {
            ...payload.new,
            user: userData,
          } as Message;

          setMessages((prev) => [...prev, newMsg]);

          // Scroll to bottom
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

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userData) {
        console.error("User record not found");
        return;
      }

      const { error } = await supabase
        .from('stream_messages')
        .insert({
          stream_id: streamId,
          user_id: userData.id,
          content: messageContent,
        });

      if (error) throw error;

    } catch (error) {
      console.error('Error sending message:', error);
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

    const isMe = item.user?.full_name === studentName;

    return (
      <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow]}>
        {!isMe && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.user?.full_name?.charAt(0) || 'U'}
            </Text>
          </View>
        )}
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
          {!isMe && <Text style={styles.userName}>{item.user?.full_name}</Text>}
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Chat</Text>
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Say something..."
            placeholderTextColor="#9CA3AF"
            value={newMessage}
            onChangeText={setNewMessage}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Send size={20} color={newMessage.trim() ? '#FFF' : '#9CA3AF'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  header: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#374151',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  hiddenMessageRow: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  hiddenText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  bubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#FFF',
  },
  otherMessageText: {
    color: '#1F2937',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#1F2937',
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
});
