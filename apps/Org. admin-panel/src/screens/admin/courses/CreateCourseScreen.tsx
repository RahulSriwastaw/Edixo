import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

export default function CreateCourseScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        isPublished: false,
        thumbnail: null as string | null,
        thumbnailBase64: null as string | null | undefined
    });

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled) {
            setFormData({
                ...formData,
                thumbnail: result.assets[0].uri,
                thumbnailBase64: result.assets[0].base64
            });
        }
    };

    const handleCreate = async () => {
        if (!formData.title) {
            Alert.alert('Error', 'Title is required');
            return;
        }

        setLoading(true);
        try {
            let thumbnailUrl = null;

            // Upload Image if exists
            if (formData.thumbnail && formData.thumbnailBase64) {
                const fileName = `${Date.now()}-${formData.title.replace(/\s+/g, '-').toLowerCase()}.jpg`;
                const { data, error: uploadError } = await supabase.storage
                    .from('thumbnails')
                    .upload(fileName, decode(formData.thumbnailBase64), {
                        contentType: 'image/jpeg'
                    });

                if (uploadError) throw uploadError;

                if (data) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('thumbnails')
                        .getPublicUrl(fileName);
                    thumbnailUrl = publicUrl;
                }
            }

            const { error: insertError } = await supabase
                .from('courses')
                .insert({
                    title: formData.title,
                    description: formData.description,
                    price: parseFloat(formData.price) || 0,
                    is_published: formData.isPublished,
                    thumbnail_url: thumbnailUrl,
                    created_at: new Date().toISOString()
                });

            if (insertError) throw insertError;

            Alert.alert('Success', 'Course created successfully', [
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
                <Text style={styles.title}>Create New Course</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {formData.thumbnail ? (
                        <Image source={{ uri: formData.thumbnail }} style={styles.thumbnail} />
                    ) : (
                        <View style={styles.placeholder}>
                            <ImageIcon color="#94a3b8" size={32} />
                            <Text style={styles.placeholderText}>Tap to add course thumbnail</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Course Title *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Advanced Physics Mechanics"
                        value={formData.title}
                        onChangeText={t => setFormData({ ...formData, title: t })}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Course details..."
                        multiline
                        numberOfLines={4}
                        value={formData.description}
                        onChangeText={t => setFormData({ ...formData, description: t })}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Price (₹)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0 for free"
                        keyboardType="numeric"
                        value={formData.price}
                        onChangeText={t => setFormData({ ...formData, price: t })}
                    />
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Publish Immediately</Text>
                    <Switch
                        value={formData.isPublished}
                        onValueChange={v => setFormData({ ...formData, isPublished: v })}
                        trackColor={{ false: '#e2e8f0', true: '#c7d2fe' }}
                        thumbColor={formData.isPublished ? '#4f46e5' : '#f1f5f9'}
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
                            <Text style={styles.submitButtonText}>Save Course</Text>
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
    imagePicker: {
        height: 200,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        overflow: 'hidden',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    placeholderText: {
        color: '#64748b',
        fontSize: 14,
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
    textArea: {
        height: 100,
        textAlignVertical: 'top',
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
