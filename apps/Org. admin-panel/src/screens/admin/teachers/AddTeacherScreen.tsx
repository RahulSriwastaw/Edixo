import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, UserPlus } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import { useNavigation } from '@react-navigation/native';

export default function AddTeacherScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        password: '',
        phone: ''
    });

    const handleCreate = async () => {
        if (!formData.email || !formData.password || !formData.fullName) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            // 1. Create Auth User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (authError) throw authError;

            if (authData.user) {
                // 2. Create User Profile
                const { error: profileError } = await supabase
                    .from('users')
                    .insert({
                        auth_user_id: authData.user.id,
                        email: formData.email,
                        role: 'teacher',
                        phone_number: formData.phone || null,
                        // full_name would go here if schema supports it
                        created_at: new Date().toISOString()
                    });

                if (profileError) throw profileError;

                Alert.alert('Success', 'Teacher account created successfully', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            }
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
                <Text style={styles.title}>Add New Teacher</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Full Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChangeText={t => setFormData({ ...formData, fullName: t })}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Email Address *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="teacher@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={formData.email}
                        onChangeText={t => setFormData({ ...formData, email: t })}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Password *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Min. 6 characters"
                        secureTextEntry
                        value={formData.password}
                        onChangeText={t => setFormData({ ...formData, password: t })}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="+91 9876543210"
                        keyboardType="phone-pad"
                        value={formData.phone}
                        onChangeText={t => setFormData({ ...formData, phone: t })}
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
                            <UserPlus color="#fff" size={20} />
                            <Text style={styles.submitButtonText}>Create Teacher Account</Text>
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
    submitButton: {
        backgroundColor: '#FF5A1F',
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

