import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Presentation, FileText, Calendar, MoreHorizontal } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

type TeachingSet = {
    id: string;
    title: string;
    set_id: string;
    is_active: boolean;
    expires_at: string | null;
    created_at: string;
};

export default function SetsListScreen() {
    const navigation = useNavigation();
    const [sets, setSets] = useState<TeachingSet[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSets();
    }, []);

    const fetchSets = async () => {
        try {
            const { data, error } = await supabase
                .from('sets')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSets(data || []);
        } catch (error: any) {
            if (error.message.includes('relation "sets" does not exist')) {
                setSets([]);
            } else {
                Alert.alert('Error', error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const renderSetItem = ({ item }: { item: TeachingSet }) => (
        <View style={styles.card}>
            <LinearGradient
                colors={['#fef3c7', '#fde68a']}
                style={styles.iconContainer}
            >
                <Presentation size={24} color="#d97706" />
            </LinearGradient>

            <View style={styles.cardContent}>
                <View style={styles.row}>
                    <Text style={styles.setTitle}>{item.title}</Text>
                    <TouchableOpacity>
                        <MoreHorizontal size={20} color="#94a3b8" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.setId}>ID: {item.set_id}</Text>

                <View style={styles.footer}>
                    <View style={[styles.statusBadge, { backgroundColor: item.is_active ? '#dcfce7' : '#f1f5f9' }]}>
                        <Text style={[styles.statusText, { color: item.is_active ? '#166534' : '#64748b' }]}>
                            {item.is_active ? 'Active' : 'Inactive'}
                        </Text>
                    </View>

                    {item.expires_at && (
                        <View style={styles.expireInfo}>
                            <Calendar size={12} color="#64748b" />
                            <Text style={styles.expireText}>Exp: {new Date(item.expires_at).toLocaleDateString()}</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <SafeAreaView edges={['top']} style={styles.safeHeader}>
                    <View style={styles.headerContent}>
                        <Text style={styles.title}>Whiteboard</Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => navigation.navigate('CreateSet' as never)}
                        >
                            <Plus color="#fff" size={20} />
                            <Text style={styles.addButtonText}>New Set</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            ) : (
                <FlatList
                    data={sets}
                    renderItem={renderSetItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconBg}>
                                <Presentation size={48} color="#94a3b8" />
                            </View>
                            <Text style={styles.emptyText}>No teaching sets</Text>
                            <Text style={styles.emptySubtext}>Create secure content sets for whiteboard sessions</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        backgroundColor: '#fff',
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    safeHeader: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0f172a',
    },
    addButton: {
        backgroundColor: '#4f46e5',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    listContent: {
        padding: 20,
        gap: 16,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(226, 232, 240, 0.6)',
        flexDirection: 'row',
        gap: 16,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardContent: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    setTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        flex: 1,
    },
    setId: {
        fontSize: 14,
        fontFamily: 'monospace',
        color: '#64748b',
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    expireInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    expireText: {
        fontSize: 12,
        color: '#64748b',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyIconBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 8,
    },
    emptySubtext: {
        color: '#94a3b8',
        textAlign: 'center',
        maxWidth: 250,
        lineHeight: 20,
    },
});
