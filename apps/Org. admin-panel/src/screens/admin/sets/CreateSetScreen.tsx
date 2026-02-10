import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Save, Upload } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

export default function CreateSetScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        setId: '',
        password: '',
        isActive: true,
        file: null as any
    });

    const pickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
                copyToCacheDirectory: true
            });

            if (!result.canceled) {
                setFormData({ ...formData, file: result.assets[0] });
            }
        } catch (err) {
            console.log('Document picker error:', err);
        }
    };

    const handleCreate = async () => {
        if (!formData.title || !formData.setId || !formData.password) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            let fileUrl = null;

            // 1. Upload File
            if (formData.file) {
                const base64 = await FileSystem.readAsStringAsync(formData.file.uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                const fileName = `${Date.now()}-${formData.file.name.replace(/\s+/g, '-')}`;
                const { data, error: uploadError } = await supabase.storage
                    .from('sets')
                    .upload(fileName, decode(base64), {
                        contentType: formData.file.mimeType || 'application/octet-stream'
                    });

                if (uploadError) throw uploadError;

                if (data) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('sets')
                        .getPublicUrl(fileName);
                    fileUrl = publicUrl;
                }
            }

            // 2. Create Set Record
            const { error: insertError } = await supabase
                .from('sets')
                .insert({
                    title: formData.title,
                    set_id: formData.setId,
                    password: formData.password,
                    is_active: formData.isActive,
                    file_url: fileUrl,
                    created_at: new Date().toISOString()
                });

            if (insertError) throw insertError;

            Alert.alert('Success', 'Teaching set created successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.title}>New Teaching Set</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Set Title *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Physics Chapter 1"
                        value={formData.title}
                        onChangeText={t => setFormData({ ...formData, title: t })}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Set ID (Unique) *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="PHYS-001"
                        autoCapitalize="characters"
                        value={formData.setId}
                        onChangeText={t => setFormData({ ...formData, setId: t.toUpperCase() })}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Access Password *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Secret123"
                        value={formData.password}
                        onChangeText={t => setFormData({ ...formData, password: t })}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Teaching Content (PDF/PPT)</Text>
                    <TouchableOpacity style={styles.uploadButton} onPress={pickFile}>
                        <Upload color="#4f46e5" size={20} />
                        <Text style={styles.uploadText}>
                            {formData.file ? formData.file.name : 'Select File'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Active Status</Text>
                    <Switch
                        value={formData.isActive}
                        onValueChange={v => setFormData({ ...formData, isActive: v })}
                        trackColor={{ false: '#e2e8f0', true: '#c7d2fe' }}
                        thumbColor={formData.isActive ? '#4f46e5' : '#f1f5f9'}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.disabledButton]}
                    onPress={handleCreate}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Save color="#fff" size={20} />
                            <Text style={styles.submitButtonText}>Create Set</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    content: {
        padding: 24,
        gap: 20,
    },
    formGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#334155',
    },
    input: {
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#0f172a',
        backgroundColor: '#fff',
    },
    uploadButton: {
        borderWidth: 1,
        borderColor: '#4f46e5',
        borderStyle: 'dashed',
        borderRadius: 8,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#eef2ff',
    },
    uploadText: {
        color: '#4f46e5',
        fontWeight: '500',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    submitButton: {
        backgroundColor: '#4f46e5',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 8,
        gap: 8,
        marginTop: 24,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
