import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, BookOpen, GraduationCap, Plus, ChevronRight, Bell } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type StatCardProps = {
    title: string;
    count: string | number;
    icon: any;
    gradient: string[];
};

const StatCard = ({ title, count, icon: Icon, gradient }: StatCardProps) => (
    <View style={styles.statCardWrapper}>
        <LinearGradient
            colors={gradient}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.statIconContainer}>
                <Icon color="#fff" size={24} />
            </View>
            <View>
                <Text style={styles.statCount}>{count}</Text>
                <Text style={styles.statTitle}>{title}</Text>
            </View>
        </LinearGradient>
    </View>
);

type QuickActionProps = {
    title: string;
    icon: any;
    onPress: () => void;
    color: string;
};

const QuickAction = ({ title, icon: Icon, onPress, color }: QuickActionProps) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
        <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
            <Icon color={color} size={24} />
        </View>
        <Text style={styles.actionTitle}>{title}</Text>
        <ChevronRight color="#cbd5e1" size={20} style={styles.actionArrow} />
    </TouchableOpacity>
);

export default function DashboardScreen() {
    const navigation = useNavigation<any>();
    const { user, signOut } = useAppContext();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Hello, Admin 👋</Text>
                        <Text style={styles.orgName}>Organization Panel</Text>
                    </View>
                    <TouchableOpacity onPress={signOut} style={styles.profileButton}>
                        {/* <Image source={{ uri: user?.user_metadata?.avatar_url }} style={styles.avatar} /> */}
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>A</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Stats Grid */}
                <Text style={styles.sectionTitle}>Overview</Text>
                <View style={styles.statsGrid}>
                    <StatCard
                        title="Total Teachers"
                        count="12"
                        icon={Users}
                        gradient={['#FF5A1F', '#F97316']}
                    />
                    <StatCard
                        title="Active Courses"
                        count="8"
                        icon={BookOpen}
                        gradient={['#0ea5e9', '#38bdf8']}
                    />
                    <StatCard
                        title="Tests Taken"
                        count="1.2k"
                        icon={GraduationCap}
                        gradient={['#8b5cf6', '#a78bfa']}
                    />
                    <StatCard
                        title="Whiteboard Sets"
                        count="24"
                        icon={BookOpen}
                        gradient={['#f59e0b', '#fbbf24']}
                    />
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    <QuickAction
                        title="Add New Teacher"
                        icon={Plus}
                        color="#FF5A1F"
                        onPress={() => navigation.navigate('AddTeacher')}
                    />
                    <QuickAction
                        title="Create Course"
                        icon={BookOpen}
                        color="#0ea5e9"
                        onPress={() => navigation.navigate('CreateCourse')}
                    />
                    <QuickAction
                        title="Upload Whiteboard Set"
                        icon={BookOpen}
                        color="#f59e0b"
                        onPress={() => navigation.navigate('CreateSet')}
                    />
                </View>

                {/* Recent Activity Stub */}
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <View style={styles.activityCard}>
                    <View style={styles.emptyState}>
                        <Bell color="#94a3b8" size={32} />
                        <Text style={styles.emptyStateText}>No recent activity</Text>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    greeting: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0f172a',
    },
    orgName: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },
    profileButton: {
        padding: 2,
        backgroundColor: '#fff',
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#eff6ff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF7ED',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FF5A1F',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 16,
        marginLeft: 4,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 32,
    },
    statCardWrapper: {
        width: (width - 48 - 16) / 2,
        borderRadius: 20,
        shadowColor: '#FF5A1F',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    },
    statCard: {
        padding: 20,
        borderRadius: 20,
        height: 140,
        justifyContent: 'space-between',
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statCount: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
    },
    statTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
    },
    actionsGrid: {
        gap: 12,
        marginBottom: 32,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 2,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    actionTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    actionArrow: {
        opacity: 0.5,
    },
    activityCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        borderStyle: 'dashed',
    },
    emptyState: {
        alignItems: 'center',
        gap: 8,
    },
    emptyStateText: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '500',
    },
});

