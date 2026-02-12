import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, CheckCircle2, XCircle, Brain, Trophy, ChevronLeft, ChevronRight, Save } from 'lucide-react-native';

const { width } = Dimensions.get('window');

type Question = { id: string; type: 'mcq'; prompt: string; options: string[]; answerIndex: number; explanation?: string };

export default function TestRunnerScreen() {
  const route = useRoute<RouteProp<Record<string, { mode: string; questions: Question[]; testId?: string }>, string>>();
  const navigation = useNavigation<any>();
  const { theme, addXP, user } = useAppContext();
  const isDark = theme === 'dark';

  const mode = (route.params as any)?.mode ?? 'practice';
  const questions: Question[] = (route.params as any)?.questions ?? [];
  const testId = (route.params as any)?.testId;

  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seconds, setSeconds] = useState(0);

  // Timer
  useEffect(() => {
    let interval: any;
    if (started && !submitted) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [started, submitted]);

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const score = useMemo(() => {
    let s = 0;
    questions.forEach(q => {
      const a = answers[q.id];
      if (typeof a === 'number' && a === q.answerIndex) s += 1;
    });
    return s;
  }, [answers, questions]);

  const handleSubmit = async () => {
    Alert.alert(
      "End Test",
      "Are you sure you want to submit your answers?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          onPress: async () => {
            setIsSubmitting(true);
            if (user && testId) {
              try {
                await supabase.from('test_attempts').insert({
                  user_id: user.id,
                  test_id: testId,
                  score: score,
                  total_questions: questions.length,
                  answers: answers,
                  duration: seconds,
                  completed_at: new Date().toISOString()
                });
              } catch (error) {
                console.error('Error saving attempt:', error);
              }
            }
            addXP(50 + score * 5);
            setSubmitted(true);
            setIsSubmitting(false);
          }
        }
      ]
    );
  };

  if (!started) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <LinearGradient colors={['#FF5A1F', '#F97316']} style={styles.introHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft color="#fff" size={28} />
          </TouchableOpacity>
          <Brain color="rgba(255,255,255,0.3)" size={120} style={styles.bgIcon} />
          <Text style={styles.introTitle}>{mode.toUpperCase()} Assessment</Text>
          <Text style={styles.introSubtitle}>Challenge yourself and track your progress</Text>
        </LinearGradient>

        <View style={styles.introContent}>
          <View style={[styles.infoCard, isDark && styles.infoCardDark]}>
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: '#FFF7ED' }]}>
                <Trophy color="#FF5A1F" size={20} />
              </View>
              <View>
                <Text style={[styles.infoLabel, isDark && styles.textLight]}>{questions.length} Questions</Text>
                <Text style={styles.infoDesc}>Multiple Choice Format</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: '#f0fdf4' }]}>
                <Clock color="#059669" size={20} />
              </View>
              <View>
                <Text style={[styles.infoLabel, isDark && styles.textLight]}>Estimated Time</Text>
                <Text style={styles.infoDesc}>{Math.ceil(questions.length * 1.5)} Minutes</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.startBtn} onPress={() => setStarted(true)}>
            <LinearGradient colors={['#FF5A1F', '#E84E18']} style={styles.startGradient}>
              <Text style={styles.startBtnText}>Begin Assessment</Text>
              <ChevronRight color="#fff" size={20} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (submitted) {
    const accuracy = Math.round((score / questions.length) * 100);
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <ScrollView contentContainerStyle={styles.resultContent}>
          <View style={styles.resultCard}>
            <LinearGradient colors={accuracy > 70 ? ['#059669', '#10b981'] : ['#f59e0b', '#fbbf24']} style={styles.resultHeader}>
              <Text style={styles.emoji}>{accuracy > 70 ? '🎉' : '👏'}</Text>
              <Text style={styles.resultTitle}>{accuracy > 70 ? 'Excellent!' : 'Good Effort!'}</Text>
              <Text style={styles.resultScore}>{score} / {questions.length}</Text>
            </LinearGradient>

            <View style={[styles.resultStats, isDark && styles.infoCardDark]}>
              <View style={styles.resStatItem}>
                <Text style={[styles.resStatVal, isDark && styles.textLight]}>{accuracy}%</Text>
                <Text style={styles.resStatLabel}>Accuracy</Text>
              </View>
              <View style={styles.resStatDivider} />
              <View style={styles.resStatItem}>
                <Text style={[styles.resStatVal, { color: '#FF5A1F' }]}>+{50 + score * 5}</Text>
                <Text style={styles.resStatLabel}>XP Earned</Text>
              </View>
              <View style={styles.resStatDivider} />
              <View style={styles.resStatItem}>
                <Text style={[styles.resStatVal, isDark && styles.textLight]}>{formatTime(seconds)}</Text>
                <Text style={styles.resStatLabel}>Time Taken</Text>
              </View>
            </View>
          </View>

          <Text style={[styles.breakdownTitle, isDark && styles.textLight]}>Detailed Analysis</Text>

          {questions.map((q, idx) => {
            const sel = answers[q.id];
            const isCorrect = sel === q.answerIndex;
            return (
              <View key={q.id} style={[styles.anaCard, isDark && styles.infoCardDark, { borderLeftColor: isCorrect ? '#059669' : '#ef4444' }]}>
                <Text style={[styles.anaQ, isDark && styles.textLight]}>Q{idx + 1}. {q.prompt}</Text>
                <View style={styles.anaRow}>
                  <View style={[styles.anaIndicator, { backgroundColor: isCorrect ? '#059669' : '#ef4444' }]} />
                  <Text style={[styles.anaText, { color: isCorrect ? '#059669' : '#ef4444' }]}>
                    {typeof sel === 'number' ? q.options[sel] : 'Not Answered'}
                  </Text>
                </View>
                {!isCorrect && (
                  <View style={styles.anaRow}>
                    <View style={[styles.anaIndicator, { backgroundColor: '#059669' }]} />
                    <Text style={[styles.anaText, { color: '#059669' }]}>
                      Correct: {q.options[q.answerIndex]}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}

          <TouchableOpacity style={styles.footerBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.footerBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const q = questions[current];
  const answer = answers[q?.id];
  const isMarked = marked[q?.id] || false;

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={[styles.topBar, isDark && styles.topBarDark]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <XCircle color={isDark ? '#94a3b8' : '#64748b'} size={24} />
        </TouchableOpacity>

        <View style={styles.timerContainer}>
          <Clock size={16} color={isDark ? '#94a3b8' : '#64748b'} />
          <Text style={[styles.timerText, isDark && styles.textLight]}>{formatTime(seconds)}</Text>
        </View>

        <TouchableOpacity
          style={styles.submitTopBtn}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitTopText}>Submit</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>Question {current + 1} of {questions.length}</Text>
          <Text style={styles.progressLabel}>{Math.round(((current + 1) / questions.length) * 100)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((current + 1) / questions.length) * 100}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.runnerContent}>
        <View style={[styles.qCard, isDark && styles.infoCardDark]}>
          <Text style={[styles.qText, isDark && styles.textLight]}>{q.prompt}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {q.options.map((opt, idx) => {
            const active = answer === idx;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => setAnswers(prev => ({ ...prev, [q.id]: idx }))}
                style={[
                  styles.optBtn,
                  isDark && styles.optBtnDark,
                  active && styles.optBtnActive
                ]}
                activeOpacity={0.7}
              >
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.optText, isDark && styles.textLight, active && styles.optTextActive]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, isDark && styles.infoCardDark]}
            onPress={() => setMarked(prev => ({ ...prev, [q.id]: !isMarked }))}
          >
            <Ionicons name={isMarked ? "bookmark" : "bookmark-outline"} size={20} color={isMarked ? '#f59e0b' : '#64748b'} />
            <Text style={[styles.navBtnText, { color: isMarked ? '#f59e0b' : '#64748b' }]}>{isMarked ? 'Marked' : 'Mark'}</Text>
          </TouchableOpacity>

          <View style={styles.stepNav}>
            <TouchableOpacity
              style={[styles.stepBtn, current === 0 && styles.stepBtnDisabled]}
              onPress={() => setCurrent(c => Math.max(0, c - 1))}
              disabled={current === 0}
            >
              <ChevronLeft color={current === 0 ? '#cbd5e1' : '#FF5A1F'} size={24} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.stepBtn, current === questions.length - 1 && styles.stepBtnDisabled]}
              onPress={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
              disabled={current === questions.length - 1}
            >
              <ChevronRight color={current === questions.length - 1 ? '#cbd5e1' : '#FF5A1F'} size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Palette */}
        <Text style={styles.paletteTitle}>Question Palette</Text>
        <View style={styles.palette}>
          {questions.map((_, idx) => {
            const isAns = typeof answers[questions[idx].id] === 'number';
            const isM = marked[questions[idx].id];
            const isCur = current === idx;
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.palItem,
                  isDark && styles.palItemDark,
                  isAns && styles.palItemAns,
                  isM && styles.palItemMarked,
                  isCur && styles.palItemCur
                ]}
                onPress={() => setCurrent(idx)}
              >
                <Text style={[
                  styles.palText,
                  (isAns || isCur) && styles.textWhite,
                  isM && !isCur && !isAns && { color: '#f59e0b' }
                ]}>
                  {idx + 1}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  containerDark: { backgroundColor: '#0f172a' },
  textLight: { color: '#f1f5f9' },
  textWhite: { color: '#fff' },
  introHeader: { height: 300, padding: 32, justifyContent: 'flex-end', position: 'relative', overflow: 'hidden' },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  bgIcon: { position: 'absolute', right: -20, bottom: -20 },
  introTitle: { fontSize: 32, fontWeight: '900', color: '#fff', marginBottom: 8 },
  introSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  introContent: { flex: 1, padding: 24, marginTop: -30, backgroundColor: 'transparent' },
  infoCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, gap: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  infoCardDark: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  infoIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  infoDesc: { fontSize: 13, color: '#64748b', marginTop: 2 },
  startBtn: { marginTop: 32, borderRadius: 16, overflow: 'hidden', elevation: 4 },
  startGradient: { paddingVertical: 18, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  startBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  topBar: { height: 70, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', backgroundColor: '#fff' },
  topBarDark: { backgroundColor: '#1e293b', borderBottomColor: '#334155' },
  closeBtn: { padding: 8 },
  timerContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  timerText: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  submitTopBtn: { backgroundColor: '#FF5A1F', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  submitTopText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  progressContainer: { paddingHorizontal: 24, paddingTop: 16 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  progressBar: { height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FF5A1F', borderRadius: 3 },
  runnerContent: { padding: 24 },
  qCard: { backgroundColor: '#fff', padding: 24, borderRadius: 24, marginBottom: 24, elevation: 2 },
  qText: { fontSize: 18, fontWeight: '700', color: '#1e293b', lineHeight: 28 },
  optionsContainer: { gap: 12 },
  optBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  optBtnDark: { backgroundColor: '#1e293b', borderColor: '#334155' },
  optBtnActive: { borderColor: '#FF5A1F', backgroundColor: '#FFF7ED' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  radioActive: { borderColor: '#FF5A1F' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#FF5A1F' },
  optText: { fontSize: 16, color: '#475569', fontWeight: '500', flex: 1 },
  optTextActive: { color: '#FF5A1F', fontWeight: '700' },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  navBtnText: { fontSize: 14, fontWeight: '600' },
  stepNav: { flexDirection: 'row', gap: 12 },
  stepBtn: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  stepBtnDisabled: { opacity: 0.5 },
  paletteTitle: { fontSize: 16, fontWeight: '700', color: '#64748b', marginTop: 32, marginBottom: 16 },
  palette: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  palItem: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
  palItemDark: { backgroundColor: '#1e293b', borderColor: '#334155' },
  palItemAns: { backgroundColor: '#059669', borderColor: '#059669' },
  palItemMarked: { borderColor: '#f59e0b', borderWidth: 2 },
  palItemCur: { backgroundColor: '#FF5A1F', borderColor: '#FF5A1F' },
  palText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
  resultContent: { paddingBottom: 40 },
  resultCard: { marginBottom: 32, overflow: 'hidden', borderRadius: 32, backgroundColor: '#fff', elevation: 4 },
  resultHeader: { padding: 40, alignItems: 'center' },
  emoji: { fontSize: 64 },
  resultTitle: { fontSize: 28, fontWeight: '900', color: '#fff', marginTop: 16 },
  resultScore: { fontSize: 20, fontWeight: '600', color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  resultStats: { flexDirection: 'row', padding: 24, justifyContent: 'space-around', alignItems: 'center' },
  resStatItem: { alignItems: 'center' },
  resStatVal: { fontSize: 22, fontWeight: '800', color: '#1e293b' },
  resStatLabel: { fontSize: 12, color: '#64748b', marginTop: 2, fontWeight: '600' },
  resStatDivider: { width: 1, height: 30, backgroundColor: '#e2e8f0' },
  breakdownTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', paddingHorizontal: 24, marginBottom: 16 },
  anaCard: { backgroundColor: '#fff', padding: 20, borderRadius: 20, marginHorizontal: 24, marginBottom: 12, borderLeftWidth: 6 },
  anaQ: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  anaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  anaIndicator: { width: 8, height: 8, borderRadius: 4 },
  anaText: { fontSize: 14, fontWeight: '600' },
  footerBtn: { margin: 24, backgroundColor: '#FF5A1F', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  footerBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});

