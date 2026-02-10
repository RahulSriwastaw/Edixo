import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Shield, Bell, Moon, LogOut, ChevronRight, Award, Trash2 } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, theme, setTheme, stats } = useAppContext();
  const navigation = useNavigation<any>();
  const isDark = theme === 'dark';

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) Alert.alert('Error', error.message);
          }
        }
      ]
    );
  };

  const SettingItem = ({ icon: Icon, title, value, type = 'navigate' as any, onPress, color = '#64748b' }: any) => (
    <TouchableOpacity
      style={[styles.item, isDark && styles.itemDark]}
      onPress={onPress}
      disabled={type === 'switch'}
    >
      <View style={[styles.itemIcon, { backgroundColor: color + '15' }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={[styles.itemTitle, isDark && styles.textLight]}>{title}</Text>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: '#e2e8f0', true: '#4f46e5' }}
        />
      ) : (
        <ChevronRight size={20} color="#94a3b8" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Header */}
        <View style={[styles.header, isDark && styles.headerDark]}>
          <View style={styles.avatarContainer}>
            <LinearGradient colors={['#4f46e5', '#818cf8']} style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.email?.charAt(0).toUpperCase() || 'S'}
              </Text>
            </LinearGradient>
            <TouchableOpacity style={styles.editBadge}>
              <Award size={14} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, isDark && styles.textLight]}>
            {user?.email?.split('@')[0]}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Award size={14} color="#f59e0b" />
              <Text style={styles.badgeText}>Level {stats.level}</Text>
            </View>
            <View style={styles.badge}>
              <Shield size={14} color="#059669" />
              <Text style={styles.badgeText}>Student</Text>
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <View style={styles.group}>
          <SettingItem icon={User} title="Edit Profile" color="#4f46e5" />
          <SettingItem icon={Mail} title="Email Notifications" color="#059669" />
          <SettingItem icon={Shield} title="Privacy & Security" color="#7c3aed" />
        </View>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.group}>
          <SettingItem
            icon={Moon}
            title="Dark Mode"
            type="switch"
            value={isDark}
            onPress={() => setTheme(isDark ? 'light' : 'dark')}
            color="#475569"
          />
          <SettingItem icon={Bell} title="Push Notifications" color="#ea580c" />
        </View>

        {/* Danger Zone */}
        <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>Danger Zone</Text>
        <View style={styles.group}>
          <SettingItem icon={LogOut} title="Logout" color="#ef4444" onPress={handleLogout} />
          <SettingItem icon={Trash2} title="Delete Account" color="#ef4444" />
        </View>

        <Text style={styles.version}>App Version 1.0.0 (Build 24)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  containerDark: { backgroundColor: '#0f172a' },
  content: { padding: 24, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 32, padding: 32, backgroundColor: '#fff', borderRadius: 32, elevation: 2 },
  headerDark: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 36, fontWeight: '900', color: '#fff' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#f59e0b', width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  userName: { fontSize: 24, fontWeight: '800', color: '#1e293b', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#64748b' },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
  group: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', marginBottom: 24, elevation: 1 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  itemDark: { backgroundColor: '#1e293b', borderBottomColor: '#334155' },
  itemIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#334155', flex: 1 },
  textLight: { color: '#f1f5f9' },
  version: { textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 12 }
});