import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { pollService } from '../../services/poll.service';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { Loader2, ArrowLeft, Users, MousePointerClick, ShieldCheck, Clock, Send, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';

const BACKEND_URL = 'http://localhost:3000';

const CHART_COLORS = [
    'hsl(162, 84%, 45%)',
    'hsl(217, 91%, 60%)',
    'hsl(280, 78%, 62%)',
    'hsl(32, 95%, 55%)',
    'hsl(346, 87%, 59%)',
    'hsl(190, 95%, 45%)',
];

interface AnalyticsSnapshot {
    poll: any;
    questions: any[];
}

// Strip HTML for chart labels
const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || "";
    return text.length > 30 ? text.substring(0, 30) + '…' : text;
};

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

export const LiveAnalytics: React.FC = () => {
    const { analyticsCode } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    
    const [isLoading, setIsLoading] = useState(true);
    const [snapshot, setSnapshot] = useState<AnalyticsSnapshot | null>(null);
    const [, setSocket] = useState<Socket | null>(null);
    const [socketReady, setSocketReady] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    useEffect(() => {
        const loadAnalytics = async () => {
            if (!analyticsCode) return;
            try {
                const res = await pollService.getPublicAnalytics(analyticsCode);
                if (res.success && res.data) {
                    setSnapshot(res.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        loadAnalytics();
    }, [analyticsCode]);

    useEffect(() => {
        if (!analyticsCode || isLoading) return;

        const newSocket = io(BACKEND_URL, {
            transports: ["websocket", "polling"],
            withCredentials: true,
        });

        newSocket.on('connect', () => {
            setSocketReady(true);
            newSocket.emit('public:analytics:join', { analyticsCode });
        });

        newSocket.on('disconnect', () => {
            setSocketReady(false);
        });

        newSocket.on('analytics:update', (payload: any) => {
            if (payload && payload.poll && payload.questions) {
                setSnapshot(payload);
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [analyticsCode, isLoading]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
            </div>
        );
    }

    if (!snapshot) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4">
                <h1 className="text-2xl font-bold text-zinc-50 mb-2">Analytics not found</h1>
                <p className="text-zinc-400 mb-6">Invalid analytics code or poll deleted.</p>
                <Button onClick={() => navigate('/dashboard')} variant="outline">Back to Dashboard</Button>
            </div>
        );
    }

    const { poll, questions } = snapshot;
    const pollId = poll._id || poll.id;

    const handlePublishResults = async () => {
        if (!pollId || poll.isResultPublished) return;

        setIsPublishing(true);
        try {
            const res = await pollService.updatePoll(pollId, { isResultPublished: true });
            if (res.success) {
                setSnapshot((current) => current
                    ? { ...current, poll: { ...current.poll, isResultPublished: true } }
                    : current
                );
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-zinc-800 pb-20">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 via-zinc-950 to-zinc-950 pointer-events-none"></div>
            
            <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-6xl items-center px-4 md:px-8">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="mr-4 hover:bg-zinc-800 text-zinc-400">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-semibold leading-tight text-zinc-50 tracking-tight">Live Analytics</h1>
                        <p className="text-xs text-zinc-500 max-w-md truncate">{poll.pollName}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        <CountdownTimer endTime={poll.pollEndTime} />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/analytics/${analyticsCode}/summary`)}
                            className="hidden border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50 sm:inline-flex"
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            User Summary
                        </Button>
                        {isAuthenticated && (
                            <Button
                                size="sm"
                                onClick={handlePublishResults}
                                disabled={isPublishing || poll.isResultPublished}
                                className={poll.isResultPublished ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400' : 'bg-zinc-50 text-zinc-950 hover:bg-zinc-200'}
                            >
                                {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                {poll.isResultPublished ? 'Published' : 'Publish Results'}
                            </Button>
                        )}
                        <div className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${socketReady ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-amber-500/30 bg-amber-500/10 text-amber-400'}`}>
                            {socketReady ? <><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span> Live</> : 'Connecting...'}
                        </div>
                    </div>
                </div>
            </header>

            <main className="relative z-10 mx-auto max-w-6xl p-4 md:p-8 space-y-8">
                
                {/* Top Metrics Grid */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 via-zinc-900/70 to-zinc-950 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between space-y-0 pb-2">
                                <p className="text-sm font-medium text-zinc-400">Total Votes</p>
                                <MousePointerClick className="h-4 w-4 text-zinc-500" />
                            </div>
                            <div className="flex items-baseline space-x-2">
                                <motion.h2 
                                    key={poll.totalVotes}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-4xl font-bold text-zinc-50 tracking-tighter"
                                >
                                    {poll.totalVotes || 0}
                                </motion.h2>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="overflow-hidden border-sky-500/20 bg-gradient-to-br from-sky-500/15 via-zinc-900/70 to-zinc-950 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between space-y-0 pb-2">
                                <p className="text-sm font-medium text-zinc-400">Participants</p>
                                <Users className="h-4 w-4 text-zinc-500" />
                            </div>
                            <div className="flex items-baseline space-x-2">
                                <motion.h2 
                                    key={poll.totalParticipants}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-4xl font-bold text-zinc-50 tracking-tighter"
                                >
                                    {poll.totalParticipants || 0}
                                </motion.h2>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="overflow-hidden border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-500/15 via-zinc-900/70 to-zinc-950 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between space-y-0 pb-2">
                                <p className="text-sm font-medium text-zinc-400">Access Control</p>
                                <ShieldCheck className="h-4 w-4 text-zinc-500" />
                            </div>
                            <div className="mt-2 flex items-baseline">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${poll.isAnonymousAllowed ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-purple-500/10 text-purple-500 border border-purple-500/20'}`}>
                                    {poll.isAnonymousAllowed ? 'Public / Anonymous' : 'Authenticated Only'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Questions Analytics with Charts */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-zinc-50 tracking-tight">Question Results</h2>
                    
                    <div className="grid gap-6 md:grid-cols-2">
                        {questions.map((q: any) => {
                            const totalQuestionVotes = q.options.reduce((sum: number, o: any) => sum + (o.votes || 0), 0);
                            
                            // Build chart data
                            const chartData = q.options.map((opt: any, idx: number) => ({
                                name: stripHtml(opt.text),
                                votes: opt.votes || 0,
                                fill: CHART_COLORS[idx % CHART_COLORS.length],
                            }));

                            // Build chart config
                            const chartConfig: ChartConfig = {};
                            q.options.forEach((opt: any, idx: number) => {
                                chartConfig[`option${idx}`] = {
                                    label: stripHtml(opt.text),
                                    color: CHART_COLORS[idx % CHART_COLORS.length],
                                };
                            });
                            chartConfig.votes = { label: "Votes" };

                            return (
                                <Card key={q._id || q.id} className="border-zinc-800 bg-zinc-900/40 backdrop-blur-sm overflow-hidden flex flex-col">
                                    <CardHeader className="border-b border-zinc-800/50 bg-zinc-950/30 pb-4">
                                        <div className="flex items-center justify-between">
                                            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                                Question {q.questionNumber}
                                            </div>
                                            <span className="text-xs text-zinc-500 font-medium">
                                                {totalQuestionVotes} vote{totalQuestionVotes !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <CardTitle className="text-lg font-medium leading-relaxed mt-2">
                                            <div 
                                                className="prose prose-invert prose-sm max-w-none prose-headings:text-zinc-100 prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-zinc-300 prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800"
                                                dangerouslySetInnerHTML={{ __html: q.question }} 
                                            />
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 flex-1 flex flex-col">
                                        {/* Shadcn Bar Chart */}
                                        <ChartContainer config={chartConfig} className="w-full min-h-[180px]">
                                            <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                                                <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(240, 3.7%, 15.9%)" />
                                                <YAxis 
                                                    dataKey="name" 
                                                    type="category" 
                                                    tickLine={false} 
                                                    axisLine={false} 
                                                    width={100}
                                                    tick={{ fill: 'hsl(240, 5%, 64.9%)', fontSize: 11 }}
                                                />
                                                <XAxis 
                                                    type="number" 
                                                    tickLine={false} 
                                                    axisLine={false}
                                                    allowDecimals={false}
                                                    tick={{ fill: 'hsl(240, 5%, 64.9%)', fontSize: 11 }}
                                                />
                                                <ChartTooltip
                                                    cursor={{ fill: 'hsl(240, 3.7%, 15.9%)', opacity: 0.5 }}
                                                    content={<ChartTooltipContent hideLabel />}
                                                />
                                                <Bar dataKey="votes" radius={[0, 4, 4, 0]} maxBarSize={32}>
                                                    {chartData.map((entry: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ChartContainer>

                                        {/* Percentage breakdown */}
                                        <div className="mt-4 space-y-2">
                                            {q.options.map((opt: any, idx: number) => {
                                                const votes = opt.votes || 0;
                                                const pct = totalQuestionVotes > 0 ? Math.round((votes / totalQuestionVotes) * 100) : 0;
                                                return (
                                                    <div key={opt._id || opt.id} className="flex items-center gap-3 text-xs">
                                                        <div className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}></div>
                                                        <div 
                                                            className="flex-1 text-zinc-400 truncate prose prose-invert prose-sm max-w-none prose-p:m-0 [&>*]:inline"
                                                            dangerouslySetInnerHTML={{ __html: opt.text }}
                                                        />
                                                        <span className="font-semibold text-zinc-300 tabular-nums">{votes}</span>
                                                        <span className="text-zinc-500 w-10 text-right tabular-nums">({pct}%)</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

            </main>
        </div>
    );
};
