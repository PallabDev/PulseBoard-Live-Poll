import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pollService } from '../../services/poll.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, Loader2, Mail, User, Users } from 'lucide-react';

const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
};

export const ParticipantSummary: React.FC = () => {
    const { analyticsCode } = useParams();
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [summary, setSummary] = useState<any>(null);
    const [expandedParticipantIds, setExpandedParticipantIds] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const loadSummary = async () => {
            if (!analyticsCode) return;

            setIsLoading(true);
            try {
                const res = await pollService.getParticipantSummary(analyticsCode, page, 8);
                if (res.success) {
                    setSummary(res.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        loadSummary();
    }, [analyticsCode, page]);

    const toggleParticipant = (participantId: string) => {
        setExpandedParticipantIds((current) => ({
            ...current,
            [participantId]: !current[participantId],
        }));
    };

    if (isLoading && !summary) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4 text-zinc-50">
                <h1 className="mb-2 text-2xl font-bold">Summary not found</h1>
                <Button onClick={() => navigate('/dashboard')} variant="outline">Back to Dashboard</Button>
            </div>
        );
    }

    const { poll, participants, pagination } = summary;

    return (
        <div className="min-h-screen bg-zinc-950 pb-16 text-zinc-50">
            <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-6xl items-center px-4 md:px-8">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/analytics/${analyticsCode}`)} className="mr-4 text-zinc-400 hover:bg-zinc-800">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-semibold leading-tight">User Summary</h1>
                        <p className="max-w-md truncate text-xs text-zinc-500">{poll.pollName}</p>
                    </div>
                    <div className="ml-auto hidden items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 sm:flex">
                        <Users className="h-3.5 w-3.5" />
                        {pagination.totalParticipants} participant{pagination.totalParticipants !== 1 ? 's' : ''}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl space-y-5 p-4 md:p-8">
                {participants.length === 0 ? (
                    <Card className="border-zinc-800 bg-zinc-900/40">
                        <CardContent className="py-14 text-center text-zinc-500">
                            No votes have been submitted yet.
                        </CardContent>
                    </Card>
                ) : (
                    participants.map((participant: any) => {
                        const isExpanded = Boolean(expandedParticipantIds[participant.id]);

                        return (
                            <Card key={participant.id} className="overflow-hidden border-zinc-800 bg-zinc-900/40 backdrop-blur-sm">
                                <CardHeader className={`bg-zinc-950/30 p-0 ${isExpanded ? 'border-b border-zinc-800/60' : ''}`}>
                                    <button
                                        type="button"
                                        aria-expanded={isExpanded}
                                        onClick={() => toggleParticipant(participant.id)}
                                        className="flex w-full flex-col gap-3 p-4 text-left transition-colors hover:bg-zinc-900/70 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-zinc-800 text-zinc-300">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <CardTitle className="truncate text-base">{participant.name}</CardTitle>
                                                <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2 text-xs text-zinc-500">
                                                    {participant.email && (
                                                        <>
                                                            <Mail className="h-3.5 w-3.5 shrink-0" />
                                                            <span className="truncate">{participant.email}</span>
                                                        </>
                                                    )}
                                                    <span className="rounded-full border border-zinc-700 px-2 py-0.5 capitalize">{participant.type}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                                            <div className="text-sm font-semibold text-zinc-300">
                                                {participant.totalAnswers}/{poll.totalQuestions} answered
                                            </div>
                                            <ChevronDown className={`h-5 w-5 shrink-0 text-zinc-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                        </div>
                                    </button>
                                </CardHeader>
                                {isExpanded && (
                                    <CardContent className="grid gap-3 p-4 md:grid-cols-2">
                                        {participant.answers
                                            .sort((a: any, b: any) => (a.questionNumber ?? 0) - (b.questionNumber ?? 0))
                                            .map((answer: any) => (
                                                <div key={`${participant.id}-${answer.questionId}`} className="rounded-md border border-zinc-800 bg-zinc-950/50 p-3">
                                                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                                        Question {answer.questionNumber ?? '-'}
                                                    </div>
                                                    <p className="mb-3 line-clamp-2 text-sm text-zinc-300">{stripHtml(answer.question)}</p>
                                                    <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                                                        {stripHtml(answer.optionText)}
                                                    </div>
                                                </div>
                                            ))}
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })
                )}

                <div className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
                    <Button
                        variant="outline"
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                        disabled={pagination.page <= 1 || isLoading}
                    >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Previous
                    </Button>
                    <span className="text-sm text-zinc-400">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        onClick={() => setPage((current) => current + 1)}
                        disabled={pagination.page >= pagination.totalPages || isLoading}
                    >
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </main>
        </div>
    );
};
