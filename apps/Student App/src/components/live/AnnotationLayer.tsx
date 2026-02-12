import React, { useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    PanResponder,
    Dimensions,
    TouchableOpacity,
    Text
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Trash2, PenTool, Eraser, Type } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

interface Point {
    x: number;
    y: number;
}

export default function AnnotationLayer({ visible }: { visible: boolean }) {
    const [paths, setPaths] = useState<string[]>([]);
    const [currentPath, setCurrentPath] = useState<string>('');
    const [mode, setMode] = useState<'pen' | 'eraser'>('pen');

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => visible,
            onMoveShouldSetPanResponder: () => visible,
            onPanResponderGrant: (evt) => {
                const { locationX, locationY } = evt.nativeEvent;
                setCurrentPath(`M${locationX},${locationY}`);
            },
            onPanResponderMove: (evt) => {
                const { locationX, locationY } = evt.nativeEvent;
                setCurrentPath(prev => `${prev} L${locationX},${locationY}`);
            },
            onPanResponderRelease: () => {
                setPaths(prev => [...prev, currentPath]);
                setCurrentPath('');
            },
        })
    ).current;

    const clearCanvas = () => {
        setPaths([]);
        setCurrentPath('');
    };

    if (!visible) return null;

    return (
        <View style={styles.container} {...panResponder.panHandlers}>
            <Svg style={styles.svg}>
                {paths.map((path, index) => (
                    <Path
                        key={index}
                        d={path}
                        stroke={COLORS.primary}
                        strokeWidth={3}
                        fill="none"
                        strokeLinecap="round"
                    />
                ))}
                {currentPath ? (
                    <Path
                        d={currentPath}
                        stroke={COLORS.primary}
                        strokeWidth={3}
                        fill="none"
                        strokeLinecap="round"
                    />
                ) : null}
            </Svg>

            {/* Controls Overlay */}
            <View style={styles.toolbar}>
                <TouchableOpacity
                    style={[styles.toolBtn, mode === 'pen' && styles.activeTool]}
                    onPress={() => setMode('pen')}
                >
                    <PenTool size={20} color={mode === 'pen' ? '#FFF' : '#333'} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toolBtn, mode === 'eraser' && styles.activeTool]}
                    onPress={() => setMode('eraser')}
                >
                    <Eraser size={20} color={mode === 'eraser' ? '#FFF' : '#333'} />
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.clearBtn} onPress={clearCanvas}>
                    <Trash2 size={20} color={COLORS.error} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
    },
    svg: {
        flex: 1,
    },
    toolbar: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 8,
        borderRadius: 12,
        alignItems: 'center',
        gap: 8,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    toolBtn: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeTool: {
        backgroundColor: COLORS.primary,
    },
    clearBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: '#DDD',
        marginHorizontal: 4,
    }
});
