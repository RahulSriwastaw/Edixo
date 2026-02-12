import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Svg, { Path, Rect, Circle, Line, Text as SvgText } from 'react-native-svg';
import { supabase } from '../../lib/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Point {
    x: number;
    y: number;
}

interface Stroke {
    id: string;
    points: Point[];
    tool: string;
    size: number;
    color: string;
    text?: string;
}

interface Question {
    id: string;
    question_eng: string;
    question_hin: string;
    option1_eng: string;
    option1_hin: string;
    option2_eng: string;
    option2_hin: string;
    option3_eng: string;
    option3_hin: string;
    option4_eng: string;
    option4_hin: string;
    answer: string;
}

interface WhiteboardPlayerProps {
    streamId: string;
    visible: boolean;
}

export default function WhiteboardPlayer({ streamId, visible }: WhiteboardPlayerProps) {
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [setId, setSetId] = useState<string | null>(null);
    const channelRef = useRef<any>(null);

    // Scaling factor
    const boardWidth = 1920;
    const scale = SCREEN_WIDTH / boardWidth;

    useEffect(() => {
        if (!streamId || !visible) return;

        const channel = supabase.channel(`session_${streamId}`)
            .on('broadcast', { event: 'stroke_add' }, ({ payload }) => {
                setStrokes(prev => [...prev, payload]);
            })
            .on('broadcast', { event: 'stroke_update' }, ({ payload }) => {
                setStrokes(prev => prev.map(s => s.id === payload.id ? { ...s, ...payload.updates } : s));
            })
            .on('broadcast', { event: 'clear' }, () => {
                setStrokes([]);
            })
            .on('broadcast', { event: 'slide_change' }, ({ payload }) => {
                setCurrentSlideIndex(payload.index);
                setStrokes([]);
            })
            .on('broadcast', { event: 'session_config' }, ({ payload }) => {
                if (payload.setId && payload.setId !== setId) {
                    setSetId(payload.setId);
                    fetchQuestions(payload.setId);
                }
            })
            .subscribe();

        channelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
        };
    }, [streamId, visible, setId]);

    const fetchQuestions = async (targetSetId: string) => {
        try {
            const { data: qData, error: qError } = await supabase
                .from('questions')
                .select('*')
                .eq('setId', targetSetId); // Whiteboard uses setId in questions table too

            if (!qError && qData) {
                setQuestions(qData);
            }
        } catch (error) {
            console.error('Error fetching whiteboard questions:', error);
        }
    };

    if (!visible) return null;

    const currentQuestion = questions[currentSlideIndex];

    const renderStroke = (stroke: Stroke) => {
        if (stroke.tool === 'text' && stroke.text) {
            const pos = stroke.points[0];
            return (
                <SvgText
                    key={stroke.id}
                    x={pos.x * scale}
                    y={pos.y * scale}
                    fill={stroke.color}
                    fontSize={stroke.size * scale}
                    fontFamily="sans-serif"
                >
                    {stroke.text}
                </SvgText>
            );
        }

        if (stroke.points.length < 2) return null;

        const d = stroke.points.map((p, i) =>
            `${i === 0 ? 'M' : 'L'}${p.x * scale},${p.y * scale}`
        ).join(' ');

        if (stroke.tool === 'pen' || stroke.tool === 'highlighter' || stroke.tool === 'eraser') {
            return (
                <Path
                    key={stroke.id}
                    d={d}
                    stroke={stroke.tool === 'eraser' ? '#FFF' : stroke.color}
                    strokeWidth={stroke.size * scale}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={stroke.tool === 'highlighter' ? 0.5 : 1}
                />
            );
        }

        // Shapes
        const start = stroke.points[0];
        const end = stroke.points[stroke.points.length - 1];

        if (stroke.tool === 'line') {
            return (
                <Line
                    key={stroke.id}
                    x1={start.x * scale}
                    y1={start.y * scale}
                    x2={end.x * scale}
                    y2={end.y * scale}
                    stroke={stroke.color}
                    strokeWidth={stroke.size * scale}
                    strokeLinecap="round"
                />
            );
        }

        if (stroke.tool === 'rectangle') {
            return (
                <Rect
                    key={stroke.id}
                    x={Math.min(start.x, end.x) * scale}
                    y={Math.min(start.y, end.y) * scale}
                    width={Math.abs(end.x - start.x) * scale}
                    height={Math.abs(end.y - start.y) * scale}
                    stroke={stroke.color}
                    strokeWidth={stroke.size * scale}
                    fill="none"
                />
            );
        }

        if (stroke.tool === 'circle') {
            const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)) * scale;
            return (
                <Circle
                    key={stroke.id}
                    cx={start.x * scale}
                    cy={start.y * scale}
                    r={radius}
                    stroke={stroke.color}
                    strokeWidth={stroke.size * scale}
                    fill="none"
                />
            );
        }

        return null;
    };

    return (
        <View style={styles.container} pointerEvents="none">
            {currentQuestion && (
                <View style={styles.questionBackground}>
                    <Text style={styles.questionText} numberOfLines={5}>
                        {currentQuestion.question_eng}
                    </Text>
                    <View style={styles.optionsGrid}>
                        <Text style={styles.optionText}>A) {currentQuestion.option1_eng}</Text>
                        <Text style={styles.optionText}>B) {currentQuestion.option2_eng}</Text>
                        <Text style={styles.optionText}>C) {currentQuestion.option3_eng}</Text>
                        <Text style={styles.optionText}>D) {currentQuestion.option4_eng}</Text>
                    </View>
                </View>
            )}
            <Svg style={styles.svg}>
                {strokes.map(renderStroke)}
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.95)',
    },
    questionBackground: {
        padding: 40,
        backgroundColor: '#FFF',
        minHeight: 200,
    },
    questionText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 20,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    optionText: {
        fontSize: 16,
        color: '#374151',
        width: '45%',
    },
    svg: {
        ...StyleSheet.absoluteFillObject,
    },
});
