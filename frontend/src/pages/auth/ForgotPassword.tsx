import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, BarChart3, ArrowLeft, Mail } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await authService.forgotPassword(email);
            setSubmitted(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 selection:bg-zinc-800">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-zinc-900/20 via-zinc-950 to-zinc-950"></div>

            <div className="relative z-10 w-full max-w-sm space-y-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700">
                        <BarChart3 className="h-5 w-5 text-zinc-50" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-zinc-50">PulseBoard</span>
                </div>

                {!submitted ? (
                    <>
                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Forgot password?</h1>
                            <p className="text-sm text-zinc-500">Enter your email and we'll send you a reset link.</p>
                        </div>

                        <Card className="border-zinc-800 bg-zinc-900/30 backdrop-blur-xl shadow-2xl">
                            <form onSubmit={handleSubmit}>
                                <CardContent className="grid gap-5 py-6">
                                    {error && (
                                        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20 flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0"></div>
                                            {error}
                                        </div>
                                    )}
                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="bg-zinc-950/60 border-zinc-800 text-zinc-50 focus-visible:ring-zinc-700 h-11"
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col gap-4 pb-6">
                                    <Button
                                        className="w-full bg-zinc-50 text-zinc-950 hover:bg-zinc-200 h-11 font-medium"
                                        type="submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                                        Send Reset Link
                                    </Button>
                                    <Link to="/signin" className="flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                                        <ArrowLeft className="h-3 w-3" /> Back to Sign In
                                    </Link>
                                </CardFooter>
                            </form>
                        </Card>
                    </>
                ) : (
                    <Card className="border-zinc-800 bg-zinc-900/30 backdrop-blur-xl shadow-2xl">
                        <CardContent className="flex flex-col items-center gap-5 pt-8 pb-8 px-8 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <Mail className="h-8 w-8 text-emerald-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-zinc-50 mb-2">Check your email</h2>
                                <p className="text-sm text-zinc-400">
                                    If an account with <span className="font-medium text-zinc-300">{email}</span> exists, we've sent a password reset link.
                                </p>
                            </div>
                            <Link to="/signin">
                                <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 mt-2">
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sign In
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};
