import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, User, Mail, Shield, Search, Filter } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import { useAppContext } from '../../../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';

type Teacher = {
    id: string;
    auth_user_id: string;
    role: string;
    email: string;
};

export default function TeacherListScreen({ navigation }: any) {
    const { session } = useAppContext();
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            if (!session?.user) return;

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'teacher')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTeachers(data || []);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderTeacherItem = ({ item }: { item: Teacher }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <LinearGradient
                    colors={['#e0e7ff', '#c7d2fe']}
                    style={styles.avatar}
                >
                    <User color="#4f46e5" size={24} />
                </LinearGradient>
                <View style={styles.cardInfo}>
                    <Text style={styles.name}>{item.email.split('@')[0]}</Text>
                    <View style={styles.emailRow}>
                        <Mail size={14} color="#64748b" />
                        <Text style={styles.emailText}>{item.email}</Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: '#dcfce7' }]}>
                    <Text style={[styles.statusText, { color: '#166534' }]}>Active</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <SafeAreaView edges={['top']} style={styles.safeHeader}>
                    <View style={styles.headerContent}>
                        <Text style={styles.title}>Teachers</Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => navigation.navigate('AddTeacher')}
                        >
                            <Plus color="#fff" size={20} />
                            <Text style={styles.addButtonText}>Add Teacher</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchBar}>
                        <Search color="#94a3b8" size={20} />
                        <TextInput
                            placeholder="Search teachers..."
                            placeholderTextColor="#94a3b8"
                            style={styles.searchInput}
                        />
                        <TouchableOpacity>
                            <Filter color="#64748b" size={20} />
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
                    data={teachers}
                    renderItem={renderTeacherItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconBg}>
                                <User size={48} color="#94a3b8" />
                            </View>
                            <Text style={styles.emptyText}>No teachers found</Text>
                            <Text style={styles.emptySubtext}>Invite teachers to begin managing your organization</Text>
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
        marginBottom: 16,
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
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#0f172a',
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
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardInfo: {
        flex: 1,
        gap: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    emailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    emailText: {
        fontSize: 14,
        color: '#64748b',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
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
