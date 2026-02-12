'use client';

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Modal,
    ScrollView,
    ActivityIndicator,
    Alert
} from 'react-native';
import {
    Plus,
    Search,
    Filter,
    Video,
    FileText,
    ExternalLink,
    MoreVertical,
    Trash2,
    Edit2,
    Save,
    X
} from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../constants/colors';
import { useAppContext } from '../../context/AppContext';

interface ContentItem {
    id: string;
    title: string;
    type: 'video' | 'pdf' | 'document' | 'link';
    category: string;
    file_url: string;
    is_active: boolean;
}

export default function MaterialManagementScreen() {
    const { user } = useAppContext();
    const [content, setContent] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'pdf',
        category: '',
        file_url: '',
        thumbnail_url: '',
        is_active: true
    });

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('content')
                .select('*')
                .eq('organization_id', (user as any)?.org_id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setContent(data || []);
        } catch (error) {
            console.error('Error fetching materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.file_url) {
            Alert.alert('Error', 'Please fill title and URL');
            return;
        }

        try {
            if (isEditing && editingId) {
                const { error } = await supabase
                    .from('content')
                    .update({
                        ...formData,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', editingId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('content')
                    .insert([{
                        ...formData,
                        organization_id: (user as any)?.org_id,
                    }]);
                if (error) throw error;
            }

            setModalVisible(false);
            resetForm();
            fetchContent();
        } catch (error) {
            console.error('Error saving content:', error);
            Alert.alert('Error', 'Failed to save material');
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert('Delete', 'Are you sure you want to delete this material?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        const { error } = await supabase.from('content').delete().eq('id', id);
                        if (error) throw error;
                        fetchContent();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete');
                    }
                }
            }
        ]);
    };

    const openEdit = (item: ContentItem) => {
        setFormData({
            title: item.title,
            description: (item as any).description || '',
            type: item.type,
            category: item.category,
            file_url: item.file_url,
            thumbnail_url: (item as any).thumbnail_url || '',
            is_active: item.is_active
        });
        setEditingId(item.id);
        setIsEditing(true);
        setModalVisible(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            type: 'pdf',
            category: '',
            file_url: '',
            thumbnail_url: '',
            is_active: true
        });
        setIsEditing(false);
        setEditingId(null);
    };

    const renderItem = ({ item }: { item: ContentItem }) => (
        <View style={styles.card}>
            <View style={styles.cardInfo}>
                <View style={[styles.iconContainer, { backgroundColor: item.type === 'video' ? '#FEE2E2' : '#E0F2FE' }]}>
                    {item.type === 'video' ? <Video size={20} color={COLORS.error} /> : <FileText size={20} color={COLORS.primary} />}
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.subtitle}>{item.category || 'General'} · {item.type.toUpperCase()}</Text>
                </View>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
                    <Edit2 size={18} color="#64748B" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                    <Trash2 size={18} color={COLORS.error} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Study Materials</Text>
                    <Text style={styles.headerSubtitle}>Manage your classes resources</Text>
                </View>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => { resetForm(); setModalVisible(true); }}
                >
                    <Plus size={20} color="#FFF" />
                    <Text style={styles.addBtnText}>Add Material</Text>
                </TouchableOpacity>
            </View>

            {/* List */}
            {loading ? (
                <ActivityIndicator style={{ marginTop: 40 }} size="large" color={COLORS.primary} />
            ) : (
                <FlatList
                    data={content}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <FileText size={48} color="#CBD5E1" />
                            <Text style={styles.emptyText}>No materials added yet.</Text>
                        </View>
                    }
                />
            )}

            {/* Modal Form */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{isEditing ? 'Edit Material' : 'Add Material'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.form}>
                            <Text style={styles.label}>Title</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.title}
                                onChangeText={(val) => setFormData({ ...formData, title: val })}
                                placeholder="Material Title"
                            />

                            <Text style={styles.label}>Type</Text>
                            <View style={styles.typeRow}>
                                {['pdf', 'video', 'link'].map((t) => (
                                    <TouchableOpacity
                                        key={t}
                                        onPress={() => setFormData({ ...formData, type: t as any })}
                                        style={[styles.typeChip, formData.type === t && styles.activeTypeChip]}
                                    >
                                        <Text style={[styles.typeChipText, formData.type === t && styles.activeTypeText]}>{t.toUpperCase()}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.label}>Category</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.category}
                                onChangeText={(val) => setFormData({ ...formData, category: val })}
                                placeholder="e.g. Worksheet, Video Lecture"
                            />

                            <Text style={styles.label}>Resource URL</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.file_url}
                                onChangeText={(val) => setFormData({ ...formData, file_url: val })}
                                placeholder="https://..."
                            />

                            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                                <Text style={styles.submitBtnText}>{isEditing ? 'Update Material' : 'Save Material'}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 2,
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    addBtnText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
    list: {
        padding: 16,
        gap: 12,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    cardInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1E293B',
    },
    subtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: '#F1F5F9',
    },
    empty: {
        alignItems: 'center',
        padding: 60,
    },
    emptyText: {
        marginTop: 12,
        color: '#64748B',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    form: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
    },
    typeRow: {
        flexDirection: 'row',
        gap: 10,
    },
    typeChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    activeTypeChip: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    typeChipText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#64748B',
    },
    activeTypeText: {
        color: '#FFF',
    },
    submitBtn: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 32,
        marginBottom: 40,
    },
    submitBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
