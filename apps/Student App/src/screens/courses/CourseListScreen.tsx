import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import { Search, Filter, BookOpen } from 'lucide-react-native';

const MOCK_COURSES = [
    { id: '1', title: 'JEE Advanced Physics', instructor: 'Dr. H.C. Verma', price: 'Free', difficulty: 'Advanced', enrolled: true },
    { id: '2', title: 'NEET Biology Crash Course', instructor: 'Dr. R.K. Gupta', price: '₹999', difficulty: 'Intermediate', enrolled: false },
    { id: '3', title: 'Class 12 Maths: Calculus', instructor: 'Prof. Sharma', price: '₹499', difficulty: 'Beginner', enrolled: false },
    { id: '4', title: 'Organic Chemistry Masterclass', instructor: 'Dr. P.K. Singh', price: 'Free', difficulty: 'Advanced', enrolled: true },
];

export default function CourseListScreen() {
    const { theme } = useAppContext();
    const navigation = useNavigation<any>();
    const isDark = theme === 'dark';
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const categories = ['All', 'Advanced', 'Intermediate', 'Beginner'];

    const filteredCourses = MOCK_COURSES.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || course.difficulty === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const renderCourseItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.card, isDark && styles.cardDark]}
            onPress={() => navigation.navigate('CourseDetail', { course: item })}
        >
            <View style={styles.cardIconContainer}>
                <BookOpen size={24} color="#4f46e5" />
            </View>
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, isDark && styles.textLight]}>{item.title}</Text>
                    <View style={[styles.badge, item.price === 'Free' ? styles.badgeFree : styles.badgePaid]}>
                        <Text style={[styles.badgeText, item.price === 'Free' ? styles.textFree : styles.textPaid]}>
                            {item.price}
                        </Text>
                    </View>
                </View>
                <Text style={styles.instructor}>{item.instructor}</Text>

                <View style={styles.cardFooter}>
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>{item.difficulty}</Text>
                    </View>
                    {item.enrolled ? (
                        <Text style={styles.enrolledText}>Enrolled</Text>
                    ) : (
                        <Text style={styles.enrollCta}>View Details</Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, isDark && styles.textLight]}>Explore Courses</Text>
                <Text style={styles.headerSubtitle}>Find the best courses for your exam prep</Text>
            </View>

            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, isDark && styles.searchBarDark]}>
                    <Search color={isDark ? '#94a3b8' : '#64748b'} size={20} />
                    <TextInput
                        style={[styles.searchInput, isDark && styles.textLight]}
                        placeholder="Search courses..."
                        placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryContainer}
                contentContainerStyle={styles.categoryContent}
            >
                {categories.map(cat => (
                    <TouchableOpacity
                        key={cat}
                        style={[
                            styles.categoryBtn,
                            isDark && styles.categoryBtnDark,
                            selectedCategory === cat && styles.categoryBtnActive
                        ]}
                        onPress={() => setSelectedCategory(cat)}
                    >
                        <Text style={[
                            styles.categoryBtnText,
                            isDark && styles.textLight,
                            selectedCategory === cat && styles.textActive
                        ]}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <FlatList
                data={filteredCourses}
                renderItem={renderCourseItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    containerDark: {
        backgroundColor: '#0f172a',
    },
    textLight: {
        color: '#f1f5f9',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1e293b',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 20,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        gap: 12,
    },
    searchBarDark: {
        backgroundColor: '#1e293b',
        borderColor: '#334155',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#0f172a',
    },
    filterButton: {
        width: 50,
        backgroundColor: '#fff',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    listContent: {
        padding: 20,
        paddingTop: 0,
        gap: 16,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        gap: 16,
    },
    cardDark: {
        backgroundColor: '#1e293b',
        borderColor: '#334155',
    },
    cardIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#e0e7ff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardContent: {
        flex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        flex: 1,
        marginRight: 8,
    },
    instructor: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tag: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tagText: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '600',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    badgeFree: {
        backgroundColor: '#dcfce7',
    },
    badgePaid: {
        backgroundColor: '#ffedd5',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    textFree: {
        color: '#166534',
    },
    textPaid: {
        color: '#9a3412',
    },
    enrolledText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#059669',
    },
    enrollCta: {
        fontSize: 13,
        fontWeight: '700',
        color: '#4f46e5',
    },
    categoryContainer: {
        maxHeight: 45,
        marginBottom: 10,
    },
    categoryContent: {
        paddingHorizontal: 20,
        gap: 8,
    },
    categoryBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    categoryBtnDark: {
        backgroundColor: '#1e293b',
        borderColor: '#334155',
    },
    categoryBtnActive: {
        backgroundColor: '#4f46e5',
        borderColor: '#4f46e5',
    },
    categoryBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
    },
    textActive: {
        color: '#fff',
    },
});
