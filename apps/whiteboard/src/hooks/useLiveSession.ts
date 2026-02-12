
import { useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { useBoardStore } from '../components/SmartBoard/store';
import { Stroke } from '../components/SmartBoard/types';

export const useLiveSession = (sessionId: string | undefined, isHost: boolean = true) => {
    const { addStroke, updateStroke, clear } = useBoardStore();
    const channelRef = useRef<any>(null);

    useEffect(() => {
        if (!sessionId || !supabase) return;

        console.log(`Initializing Live Session: ${sessionId}`);

        const channel = supabase.channel(`session_${sessionId}`)
            .on('broadcast', { event: 'stroke_add' }, ({ payload }) => {
                if (!isHost) {
                    console.log('Received stroke_add', payload);
                    // Add stroke to local store without broadcasting back
                    // We might need to ensure addStroke doesn't trigger another broadcast if we were listening to store changes
                    // But here we are triggering broadcast manually from UI events, so calling store.addStroke is safe.
                    addStroke(payload);
                }
            })
            .on('broadcast', { event: 'stroke_update' }, ({ payload }) => {
                if (!isHost) {
                    updateStroke(payload.id, payload.updates);
                }
            })
            .on('broadcast', { event: 'clear' }, () => {
                if (!isHost) clear();
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`Subscribed to session_${sessionId}`);
                }
            });

        channelRef.current = channel;

        return () => {
            console.log('Cleaning up Live Session channel');
            supabase?.removeChannel(channel);
        };
    }, [sessionId, isHost]);

    const broadcastStroke = (stroke: Stroke) => {
        if (!channelRef.current) return;
        channelRef.current.send({
            type: 'broadcast',
            event: 'stroke_add',
            payload: stroke
        });
    };

    const broadcastUpdate = (id: string, updates: Partial<Stroke>) => {
        if (!channelRef.current) return;
        channelRef.current.send({
            type: 'broadcast',
            event: 'stroke_update',
            payload: { id, updates }
        });
    };

    const broadcastClear = () => {
        if (!channelRef.current) return;
        channelRef.current.send({
            type: 'broadcast',
            event: 'clear',
            payload: {}
        });
    };

    const broadcastSlideChange = (index: number) => {
        if (!channelRef.current) return;
        channelRef.current.send({
            type: 'broadcast',
            event: 'slide_change',
            payload: { index }
        });
    };

    const broadcastSessionConfig = (config: { setId?: string; setName?: string }) => {
        if (!channelRef.current) return;
        channelRef.current.send({
            type: 'broadcast',
            event: 'session_config',
            payload: config
        });
    };

    return { broadcastStroke, broadcastUpdate, broadcastClear, broadcastSlideChange, broadcastSessionConfig };
};
