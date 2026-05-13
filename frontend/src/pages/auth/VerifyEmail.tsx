import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const VerifyEmail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('error');
                setMessage('No verification token found in the URL.');
                return;
            }

            try {
                const res = await authService.verifyEmail(token);
                if (res.success) {
                    setStatus('success');
                    setMessage('Your email has been verified successfully!');
                } else {
                    setStatus('error');
                    setMessage(res.message || 'Verification failed.');
                }
            } catch (error: any) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Invalid or expired verification token.');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 selection:bg-zinc-800">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 via-zinc-950 to-zinc-950"></div>

            <div className="relative z-10 w-full max-w-md space-y-6">
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700">
                        <BarChart3 className="h-5 w-5 text-zinc-50" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-zinc-50">PulseBoard</span>
                </div>

                <Card className="border-zinc-800 bg-zinc-900/30 backdrop-blur-xl shadow-2xl">
                    <CardContent className="flex flex-col items-center gap-5 pt-8 pb-8 px-8 text-center">
                        {status === 'loading' && (
                            <>
                                <Loader2 className="h-12 w-12 animate-spin text-zinc-400" />
                                <div>
                                    <h2 className="text-xl font-semibold text-zinc-50 mb-1">Verifying your email...</h2>
                                    <p className="text-sm text-zinc-500">This will only take a moment.</p>
                                </div>
                            </>
                        )}

                        {status === 'success' && (
                            <>
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-zinc-50 mb-1">Email Verified</h2>
                                    <p className="text-sm text-zinc-400">{message}</p>
                                </div>
                                <Link to="/signin">
                                    <Button className="bg-zinc-50 text-zinc-950 hover:bg-zinc-200 mt-2">
                                        Sign In <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </>
                        )}

                        {status === 'error' && (
                            <>
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
                                    <XCircle className="h-8 w-8 text-red-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-zinc-50 mb-1">Verification Failed</h2>
                                    <p className="text-sm text-red-400">{message}</p>
                                </div>
                                <Link to="/signin">
                                    <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 mt-2">
                                        Back to Sign In
                                    </Button>
                                </Link>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
