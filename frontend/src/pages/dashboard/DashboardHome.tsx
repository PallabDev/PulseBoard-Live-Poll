import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePolls } from '../../hooks/useLocalPolls';
import { pollService } from '../../services/poll.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BarChart3, Edit2, Link2, Plus, Clock, Users, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const DashboardHome: React.FC = () => {
    const { polls, isLoading, deletePollLocal } = usePolls();
    const navigate = useNavigate();
    const [pollToDelete, setPollToDelete] = useState<{ id: string; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${type} copied to clipboard`);
    };

    const handleDeletePoll = async () => {
        if (!pollToDelete) return;

        setIsDeleting(true);
        try {
            await pollService.deletePoll(pollToDelete.id);
            deletePollLocal(pollToDelete.id);
            toast.success("Poll deleted successfully");
            setPollToDelete(null);
        } catch (error: any) {
            console.error("Failed to delete poll:", error);
            toast.error(error.response?.data?.message || "Failed to delete poll");
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return <div className="flex h-[calc(100vh-12rem)] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-zinc-500" /></div>;
    }

    if (polls.length === 0) {
        return (
            <div className="flex h-[calc(100vh-12rem)] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900 mb-6">
                    <BarChart3 className="h-10 w-10 text-zinc-600" />
                </div>
                <h2 className="text-xl font-semibold text-zinc-50 mb-2">No polls created yet</h2>
                <p className="text-zinc-400 text-center max-w-sm mb-6">
                    Create your first poll to start collecting responses and analyzing real-time data.
                </p>
                <Button onClick={() => navigate('/dashboard/create')} className="bg-zinc-50 text-zinc-950 hover:bg-zinc-200">
                    <Plus className="mr-2 h-4 w-4" />
                    Create your first poll
                </Button>
            </div>
        );
    }

    return (
        <>
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-50">My Polls</h1>
                    <p className="text-zinc-400 mt-1">Manage and view analytics for your polls</p>
                </div>
                <Button onClick={() => navigate('/dashboard/create')} className="bg-zinc-50 text-zinc-950 hover:bg-zinc-200">
                    <Plus className="mr-2 h-4 w-4" /> Create Poll
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {polls.map((poll) => {
                    const pollId = (poll as any)._id || poll.id;
                    const shareUrl = `${window.location.origin}/join/${poll.shareCode}`;
                    const analyticsUrl = `${window.location.origin}/analytics/${poll.analyticsCode}`;

                    return (
                        <Card key={pollId} className="border-zinc-800 bg-zinc-900/40 backdrop-blur-sm flex flex-col">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg leading-tight line-clamp-1">{poll.pollName}</CardTitle>
                                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                                            <span className={`px-2 py-0.5 rounded-full capitalize ${
                                                poll.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                                                poll.status === 'ended' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                                                'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                            }`}>
                                                {poll.status}
                                            </span>
                                            {poll.isAnonymousAllowed && (
                                                <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded-full">Anonymous</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="flex-1 pb-4">
                                <p className="text-sm text-zinc-400 line-clamp-2 mb-4 h-10">
                                    {poll.pollDescription.replace(/<[^>]*>?/gm, '')}
                                </p>
                                
                                <div className="flex items-center gap-4 text-xs text-zinc-500">
                                    <div className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        <span>{poll.totalParticipants || 0} participants</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{poll.pollDurationInMinutes}m limit</span>
                                    </div>
                                </div>
                            </CardContent>

                            <div className="px-6 py-3 border-t border-zinc-800/50 bg-zinc-950/30 flex gap-2 justify-between">
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="h-8 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50" onClick={() => navigate(`/dashboard/edit/${pollId}`)}>
                                        <Edit2 className="h-3 w-3 mr-1" /> Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 border-red-950/60 text-red-400 hover:bg-red-950/40 hover:text-red-300"
                                        onClick={() => setPollToDelete({ id: pollId, name: poll.pollName })}
                                    >
                                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                                    </Button>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" className="h-8 px-2 text-zinc-400 hover:text-zinc-50" onClick={() => copyToClipboard(shareUrl, 'Share Link')} title="Copy Share Link">
                                        <Link2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 px-2 text-zinc-400 hover:text-zinc-50" onClick={() => copyToClipboard(analyticsUrl, 'Analytics Link')} title="Copy Analytics Link">
                                        <BarChart3 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
        <Dialog open={!!pollToDelete} onOpenChange={(open) => !open && !isDeleting && setPollToDelete(null)}>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-50">
                <DialogHeader>
                    <DialogTitle>Delete poll?</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        This will permanently delete "{pollToDelete?.name}" with all questions, options, votes, share links, and analytics data.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="border-zinc-800 bg-zinc-900/20">
                    <Button
                        variant="outline"
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50"
                        onClick={() => setPollToDelete(null)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-red-600 text-white hover:bg-red-500"
                        onClick={handleDeletePoll}
                        disabled={isDeleting}
                    >
                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Delete Poll
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
};
