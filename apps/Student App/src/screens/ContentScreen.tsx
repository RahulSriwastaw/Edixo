import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, PlayCircle, FileText, Download } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';

export default function ContentScreen() {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { theme } = useAppContext();
    const isDark = theme === 'dark';

    const content = route.params?.content || {
        title: 'Introduction to Kinematics',
        type: 'video',
        duration: '15:42'
    };

    return (
        <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeft color={isDark ? '#fff' : '#1e293b'} size={28} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, isDark && styles.textLight]}>{content.title}</Text>
            </View>

            <View style={styles.contentView}>
                {content.type === 'video' ? (
                    <View style={styles.premiumPlayer}>
                        <View style={styles.videoOverlay}>
                            <PlayCircle size={64} color="#fff" fill="rgba(255,255,255,0.2)" />
                        </View>
                        <View style={styles.progressBarStub} />
                    </View>
                ) : (
                    <View style={styles.premiumDoc}>
                        <FileText size={64} color="#4f46e5" />
                        <Text style={[styles.placeholderText, { color: '#475569' }]}>Preview of {content.title}</Text>
                        <TouchableOpacity style={styles.expandBtn}>
                            <Text style={styles.expandBtnText}>Open Full Screen</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <ScrollView style={styles.details} showsVerticalScrollIndicator={false}>
                <Text style={[styles.sectionTitle, isDark && styles.textLight]}>Description</Text>
                <Text style={styles.description}>
                    This lesson covers the fundamental concepts of {content.title.toLowerCase()},
                    providing a clear and concise overview for exam preparation.
                </Text>

                <View style={[styles.downloadCard, isDark && styles.cardDark]}>
                    <View style={styles.fileIconBox}>
                        <FileText size={20} color="#4f46e5" />
                    </View>
                    <View style={styles.downloadInfo}>
                        <Text style={[styles.downloadTitle, isDark && styles.textLight]}>Lesson Notes.pdf</Text>
                        <Text style={styles.downloadSize}>2.4 MB</Text>
                    </View>
                    <TouchableOpacity style={styles.downloadBtn}>
                        <Download size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    containerDark: { backgroundColor: '#0f172a' },
    textLight: { color: '#f1f5f9' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 10, gap: 16 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', flex: 1 },
    contentView: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000' },
    premiumPlayer: { flex: 1, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },
    videoOverlay: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(79, 70, 229, 0.4)', justifyContent: 'center', alignItems: 'center' },
    progressBarStub: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, backgroundColor: '#4f46e5', width: '30%' },
    premiumDoc: { flex: 1, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', gap: 12 },
    expandBtn: { backgroundColor: '#4f46e5', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, marginTop: 10 },
    expandBtnText: { color: '#fff', fontWeight: '700' },
    placeholderText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    details: { padding: 24 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginBottom: 12 },
    description: { fontSize: 15, color: '#64748b', lineHeight: 24, marginBottom: 24 },
    downloadCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
    cardDark: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
    fileIconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
    downloadInfo: { flex: 1, marginLeft: 16 },
    downloadTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
    downloadSize: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
    downloadBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#4f46e5', alignItems: 'center', justifyContent: 'center' }
});
