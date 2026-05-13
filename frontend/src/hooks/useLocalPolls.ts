import { useState, useEffect, useCallback } from 'react';
import type { IPoll } from '../types/poll.types';
import { pollService } from '../services/poll.service';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export function usePolls() {
    const { isAuthenticated } = useAuth();
    const [polls, setPolls] = useState<IPoll[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPolls = useCallback(async () => {
        if (!isAuthenticated) return;
        
        setIsLoading(true);
        try {
            const res = await pollService.getAllPolls();
            if (res.success && res.data) {
                setPolls(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch polls:", error);
            toast.error("Failed to load your polls");
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchPolls();
    }, [fetchPolls]);

    const addPoll = (poll: IPoll) => {
        setPolls(prev => [poll, ...prev]);
    };

    const updatePollLocal = (pollId: string, updates: Partial<IPoll>) => {
        setPolls(prev => prev.map(p => {
            const currentId = (p as any)._id || p.id;
            if (currentId === pollId) {
                return { ...p, ...updates };
            }
            return p;
        }));
    };

    const deletePollLocal = (pollId: string) => {
        setPolls(prev => prev.filter(p => ((p as any)._id || p.id) !== pollId));
    };

    return {
        polls,
        isLoading,
        fetchPolls,
        addPoll,
        updatePollLocal,
        deletePollLocal,
    };
}
