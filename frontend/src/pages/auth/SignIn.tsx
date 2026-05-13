import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, BarChart3, ArrowRight } from 'lucide-react';

export const SignIn: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { signin } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const from = location.state?.from?.pathname || '/dashboard';
    const successMessage = location.state?.message;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await signin({ email, password });
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to sign in');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-zinc-950 selection:bg-zinc-800">
            {/* Left Branding Panel */}
            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-zinc-900 via-zinc-950 to-zinc-900"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.08),transparent_60%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.06),transparent_50%)]"></div>

                <div className="relative z-10 max-w-md px-2 space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700">
                            <BarChart3 className="h-5 w-5 text-zinc-50" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-zinc-50">PulseBoard</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-50 leading-tight">
                        Create live polls.<br />
                        <span className="text-zinc-400">Get instant feedback.</span>
                    </h2>
                    <p className="text-zinc-500 leading-relaxed">
                        Engage your audience with real-time anonymous polling.
                        Create, share, and analyze results - all in one beautiful dashboard.
                    </p>
                    <div className="flex items-center gap-6 pt-4">
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-zinc-50 tracking-tight">Real-time</span>
                            <span className="text-xs text-zinc-500">Live results</span>
                        </div>
                        <div className="h-8 w-px bg-zinc-800"></div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-zinc-50 tracking-tight">Anonymous</span>
                            <span className="text-xs text-zinc-500">Optional privacy</span>
                        </div>
                        <div className="h-8 w-px bg-zinc-800"></div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-zinc-50 tracking-tight">Instant</span>
                            <span className="text-xs text-zinc-500">Share via link</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex flex-1 items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-sm space-y-6">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-3 lg:hidden mb-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700">
                            <BarChart3 className="h-4 w-4 text-zinc-50" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-zinc-50">PulseBoard</span>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Welcome back</h1>
                        <p className="text-sm text-zinc-500">Enter your credentials to access your dashboard</p>
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
                                {successMessage && !error && (
                                    <div className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-400 border border-emerald-500/20 flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                                        {successMessage}
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
                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Password</Label>
                                        <Link to="/forgot-password" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Sign In
                                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                                </Button>
                                <div className="text-center text-sm text-zinc-500">
                                    Don't have an account?{" "}
                                    <Link to="/signup" className="text-zinc-300 hover:text-zinc-50 transition-colors font-medium">
                                        Create one
                                    </Link>
                                </div>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};
