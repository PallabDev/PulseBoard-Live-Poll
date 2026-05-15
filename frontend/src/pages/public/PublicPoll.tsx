import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { pollService } from '../../services/poll.service';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, BarChart3, ShieldAlert, Clock } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const FINGERPRINT_KEY = 'pulseboard-fingerprint';
const RESULT_COLORS = ['#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899', '#06b6d4'];

interface PublicPollSnapshot {
    poll: any;
    questions: any[];
}

const CountdownTimer: React.FC<{ endTime: string | null }> = ({ endTime }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (!endTime) {
            setTimeLeft('Not started');
            return;
        }

        const update = () => {
            const now = Date.now();
            const end = new Date(endTime).getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft('Expired');
                setIsExpired(true);
                return;
            }

            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${minutes}m ${seconds.toString().padStart(2, '0')}s`);
            setIsExpired(false);
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [endTime]);

    return (
        <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
            isExpired 
                ? 'border-red-500/30 bg-red-500/10 text-red-400' 
                : 'border-zinc-700 bg-zinc-900 text-zinc-300'
        }`}>
            <Clock className="h-3 w-3" />
            {timeLeft}
        </div>
    );
};

const PollResults: React.FC<{ questions: any[] }> = ({ questions }) => (
    <div className="space-y-6">
        {questions.map((q: any) => {
            const totalVotes = q.options.reduce((sum: number, option: any) => sum + (option.votes || 0), 0);

            return (
                <Card key={q._id || q.id} className="overflow-hidden border-zinc-800 bg-zinc-900/40 backdrop-blur-md">
                    <CardHeader className="border-b border-zinc-800/50 bg-zinc-950/30 pb-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            Question {q.questionNumber}
                        </span>
                        <CardTitle className="text-xl font-medium leading-relaxed">
                            <div
                                className="prose prose-invert prose-sm max-w-none prose-headings:text-zinc-100"
                                dangerouslySetInnerHTML={{ __html: q.question }}
                            />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                        {q.options.map((opt: any, index: number) => {
                            const votes = opt.votes || 0;
                            const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                            const color = RESULT_COLORS[index % RESULT_COLORS.length];

                            return (
                                <div key={opt._id || opt.id} className="space-y-2">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
                                        <div
                                            className="min-w-0 flex-1 truncate text-zinc-300 prose prose-invert prose-sm max-w-none prose-p:m-0 [&>*]:inline"
                                            dangerouslySetInnerHTML={{ __html: opt.text }}
                                        />
                                        <span className="font-semibold tabular-nums text-zinc-50">{votes}</span>
                                        <span className="w-11 text-right tabular-nums text-zinc-500">{pct}%</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{
                                                width: `${pct}%`,
                                                backgroundColor: color,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            );
        })}
    </div>
);

export const PublicPoll: React.FC = () => {
    const { shareCode } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: authLoading, accessToken } = useAuth();
    
    const [isLoading, setIsLoading] = useState(true);
    const [snapshot, setSnapshot] = useState<PublicPollSnapshot | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [socketReady, setSocketReady] = useState(false);
    
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [identitySaved, setIdentitySaved] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
    const [submittedQuestionIds, setSubmittedQuestionIds] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        if (authLoading) return;

        const loadPoll = async () => {
            if (!shareCode) return;
            try {
                const res = await pollService.getPublicPoll(shareCode);
                if (res.success && res.data) {
                    setSnapshot(res.data);
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load poll or poll does not exist");
            } finally {
                setIsLoading(false);
            }
        };

        loadPoll();
    }, [shareCode, authLoading]);

    useEffect(() => {
        if (!shareCode || isLoading || authLoading) return;

        const newSocket = io(BACKEND_URL, {
            transports: ["websocket", "polling"],
            withCredentials: true,
            auth: accessToken ? { accessToken } : undefined,
        });

        newSocket.on('connect', () => {
            setSocketReady(true);
            newSocket.emit('public:poll:join', { shareCode });
        });

        newSocket.on('disconnect', () => {
            setSocketReady(false);
        });

        newSocket.on('poll:update', (payload: any) => {
            if (payload && payload.poll && payload.questions) {
                setSnapshot(payload);
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [shareCode, isLoading, authLoading, accessToken]);

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const getFingerprint = useCallback(() => {
        let fp = localStorage.getItem(FINGERPRINT_KEY);
        if (!fp) {
            fp = `fp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            localStorage.setItem(FINGERPRINT_KEY, fp);
        }
        return fp;
    }, []);

    const handleSubmitFeedback = () => {
        if (!socket || !socketReady || (!snapshot?.poll?._id && !snapshot?.poll?.id)) {
            toast.error("Live connection not ready");
            return;
        }

        const missingRequiredQuestion = snapshot.questions.find((question: any) => (
            question.isRequired !== false && !selectedAnswers[question._id || question.id]
        ));

        if (missingRequiredQuestion) {
            toast.error(`Question ${missingRequiredQuestion.questionNumber} is mandatory`);
            return;
        }

        const pollId = snapshot!.poll._id || snapshot!.poll.id;
        const answers = Object.entries(selectedAnswers).map(([questionId, optionId]) => ({
            questionId,
            optionId,
        }));

        if (answers.length === 0) {
            toast.error("Please answer at least one question before submitting");
            return;
        }

        const payload: any = { pollId, answers };

        if (isAuthenticated) {
            if (accessToken) {
                payload.accessToken = accessToken;
            }
        } else if (!isAuthenticated && snapshot?.poll?.isAnonymousAllowed) {
            if (!firstName || !lastName) {
                toast.error("Please provide your name to vote");
                return;
            }
            payload.userFingerPrint = getFingerprint();
            payload.firstName = firstName;
            payload.lastName = lastName;
        } else if (!isAuthenticated && !snapshot?.poll?.isAnonymousAllowed) {
            toast.error("You must be signed in to vote on this poll");
            navigate('/signin', { state: { from: { pathname: `/join/${shareCode}` } } });
            return;
        }

        setIsSubmitting(true);
        socket.emit('public:votes:submit', payload, (ack: any) => {
            setIsSubmitting(false);
            if (ack?.success) {
                setSubmittedQuestionIds(
                    answers.reduce<Record<string, boolean>>((acc, answer) => {
                        acc[answer.questionId] = true;
                        return acc;
                    }, {})
                );
                toast.success("Feedback submitted!");
            } else {
                toast.error(ack?.message || "Failed to submit feedback");
            }
        });
    };

    if (isLoading || authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
            </div>
        );
    }

    if (!snapshot) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4">
                <h1 className="text-2xl font-bold text-zinc-50 mb-2">Poll not found</h1>
                <p className="text-zinc-400 mb-6">This poll might have been deleted or the link is invalid.</p>
            </div>
        );
    }

    const { poll, questions } = snapshot;
    const requiresSignin = !poll.isAnonymousAllowed && !isAuthenticated;
    const needsIdentity = poll.isAnonymousAllowed && !isAuthenticated && !identitySaved;
    const isExpired = poll.status === 'ended' || (poll.pollEndTime && new Date(poll.pollEndTime).getTime() <= now);
    const canShowQuestions = !requiresSignin && !isExpired && poll.status === 'active';

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-zinc-800">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-zinc-950 to-zinc-950 pointer-events-none"></div>
            
            <main className="relative z-10 mx-auto max-w-3xl p-4 py-12 md:py-20">
                <div className="mb-12 space-y-6">
                    <div className="flex items-center gap-3 text-sm font-medium text-zinc-400">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-zinc-500" />
                            <span className="text-zinc-500 font-semibold">PulseBoard</span>
                        </div>
                        <div className="ml-auto flex items-center gap-3">
                            <CountdownTimer endTime={poll.pollEndTime} />
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${
                                poll.status === 'active' 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                                    : poll.status === 'ended'
                                        ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                            }`}>
                                {poll.status}
                            </span>
                        </div>
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl text-zinc-50">
                        {poll.pollName}
                    </h1>
                    
                    {poll.pollDescription && (
                        <div 
                            className="prose prose-invert prose-sm max-w-none text-zinc-400 prose-p:leading-relaxed prose-headings:text-zinc-300 prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-zinc-300 prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800"
                            dangerouslySetInnerHTML={{ __html: poll.pollDescription }}
                        />
                    )}
                </div>

                {requiresSignin && (
                    <Card className="mb-8 border-red-900/50 bg-red-950/20 backdrop-blur-md">
                        <CardContent className="flex items-center gap-4 p-6 text-red-200">
                            <ShieldAlert className="h-8 w-8 text-red-500 shrink-0" />
                            <div>
                                <h3 className="font-semibold text-red-400 mb-1">Authentication Required</h3>
                                <p className="text-sm">This poll requires you to be signed in to participate.</p>
                            </div>
                            <Button 
                                onClick={() => navigate('/signin', { state: { from: { pathname: `/join/${shareCode}` } } })}
                                className="ml-auto bg-red-500 hover:bg-red-600 text-white shrink-0"
                            >
                                Sign In
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {isExpired && !poll.isResultPublished && !requiresSignin && (
                    <Card className="mb-8 border-amber-500/30 bg-amber-500/10 backdrop-blur-md">
                        <CardContent className="flex items-center gap-4 p-6 text-amber-100">
                            <Clock className="h-8 w-8 shrink-0 text-amber-400" />
                            <div>
                                <h3 className="mb-1 font-semibold text-amber-300">Poll expired</h3>
                                <p className="text-sm text-amber-100/80">Questions are no longer visible. Results will appear here when the creator publishes them.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {poll.status !== 'active' && !poll.isResultPublished && !requiresSignin && !isExpired && (
                    <Card className="mb-8 border-blue-500/30 bg-blue-500/10 backdrop-blur-md">
                        <CardContent className="flex items-center gap-4 p-6 text-blue-100">
                            <Clock className="h-8 w-8 shrink-0 text-blue-400" />
                            <div>
                                <h3 className="mb-1 font-semibold text-blue-300">Poll is not active</h3>
                                <p className="text-sm text-blue-100/80">This poll is currently in draft mode and is not accepting responses yet.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {poll.isResultPublished && (
                    <div className="mb-8 rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                        Published results are available below.
                    </div>
                )}

                {needsIdentity && !requiresSignin && !isExpired && (
                    <Card className="mb-8 border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="text-lg">Enter your details to vote</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form 
                                onSubmit={(e) => { e.preventDefault(); setIdentitySaved(true); }}
                                className="grid gap-4 sm:grid-cols-3"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First name</Label>
                                    <Input 
                                        id="firstName" 
                                        required 
                                        value={firstName} 
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="bg-zinc-950/50 border-zinc-800"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last name</Label>
                                    <Input 
                                        id="lastName" 
                                        required 
                                        value={lastName} 
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="bg-zinc-950/50 border-zinc-800"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button type="submit" className="w-full bg-zinc-50 text-zinc-950 hover:bg-zinc-200">
                                        Continue
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {poll.isResultPublished ? (
                    <PollResults questions={questions} />
                ) : (
                <div className="space-y-6">
                    {!canShowQuestions ? null : questions.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500">
                            No questions have been added to this poll yet.
                        </div>
                    ) : (
                        questions.map((q: any) => {
                            const questionId = q._id || q.id;
                            const selectedOptionId = selectedAnswers[questionId];
                            const isSubmitted = submittedQuestionIds[questionId];
                            const isDisabled = requiresSignin || (needsIdentity && !identitySaved) || isSubmitted || poll.status !== 'active' || isExpired || isSubmitting;

                            return (
                                <Card key={q._id || q.id} className="border-zinc-800 bg-zinc-900/40 backdrop-blur-md overflow-hidden transition-all hover:bg-zinc-900/60">
                                    <CardHeader className="border-b border-zinc-800/50 bg-zinc-950/30 pb-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                                Question {q.questionNumber}
                                            </span>
                                            <div className="flex items-center gap-2">
                                            <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${q.isRequired === false ? 'border-zinc-700 text-zinc-500' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>
                                                {q.isRequired === false ? 'Optional' : 'Mandatory'}
                                            </span>
                                            {isSubmitted && (
                                                <span className="flex items-center gap-1 text-xs font-medium text-emerald-500">
                                                    <CheckCircle2 className="h-3 w-3" /> Submitted
                                                </span>
                                            )}
                                            </div>
                                        </div>
                                        <CardTitle className="text-xl mt-2 font-medium leading-relaxed">
                                            <div 
                                                className="prose prose-invert prose-sm max-w-none prose-headings:text-zinc-100 prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-zinc-300 prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800"
                                                dangerouslySetInnerHTML={{ __html: q.question }} 
                                            />
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid gap-3">
                                            {q.options.map((opt: any) => {
                                                const isSelected = selectedOptionId === (opt._id || opt.id);
                                                return (
                                                    <button
                                                        key={opt._id || opt.id}
                                                        disabled={isDisabled}
                                                        onClick={() => setSelectedAnswers((current) => ({
                                                            ...current,
                                                            [questionId]: opt._id || opt.id,
                                                        }))}
                                                        className={`
                                                            group relative flex w-full items-center rounded-xl border p-4 text-left transition-all duration-200
                                                            ${isSelected 
                                                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-50' 
                                                                : isDisabled 
                                                                    ? 'border-zinc-800 bg-zinc-950/50 text-zinc-500 cursor-not-allowed' 
                                                                    : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800 hover:text-zinc-50'
                                                            }
                                                        `}
                                                    >
                                                        <div 
                                                            className="flex-1 prose prose-invert prose-sm max-w-none prose-p:m-0 prose-code:bg-zinc-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs"
                                                            dangerouslySetInnerHTML={{ __html: opt.text }}
                                                        />
                                                        {isSelected && <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 ml-3" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                    {canShowQuestions && questions.length > 0 && (
                        <div className="sticky bottom-4 z-20 rounded-xl border border-zinc-800 bg-zinc-950/90 p-4 backdrop-blur-md">
                            <Button
                                onClick={handleSubmitFeedback}
                                disabled={requiresSignin || (needsIdentity && !identitySaved) || poll.status !== 'active' || isExpired || isSubmitting || Object.keys(submittedQuestionIds).length > 0}
                                className="w-full bg-zinc-50 text-zinc-950 hover:bg-zinc-200"
                            >
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                {Object.keys(submittedQuestionIds).length > 0 ? 'Feedback Submitted' : 'Submit Feedback'}
                            </Button>
                        </div>
                    )}
                </div>
                )}
            </main>
        </div>
    );
};
