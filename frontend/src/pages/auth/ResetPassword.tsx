import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, BarChart3, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!token) {
            setError('Reset token is missing.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);

        try {
            const res = await authService.resetPassword(token, password);
            if (res.success) {
                setIsSuccess(true);
                toast.success('Password reset successfully!');
            } else {
                setError(res.message || 'Failed to reset password.');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid or expired reset token.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 selection:bg-zinc-800">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 via-zinc-950 to-zinc-950"></div>
                <div className="relative z-10 w-full max-w-sm space-y-6">
                    <Card className="border-zinc-800 bg-zinc-900/30 backdrop-blur-xl shadow-2xl">
                        <CardContent className="flex flex-col items-center gap-5 pt-8 pb-8 px-8 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-zinc-50 mb-2">Password Reset</h2>
                                <p className="text-sm text-zinc-400">
                                    Your password has been successfully reset. You can now sign in with your new password.
                                </p>
                            </div>
                            <Link to="/signin">
                                <Button className="bg-zinc-50 text-zinc-950 hover:bg-zinc-200 mt-2">
                                    Sign In <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 selection:bg-zinc-800">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 via-zinc-950 to-zinc-950"></div>

            <div className="relative z-10 w-full max-w-sm space-y-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700">
                        <BarChart3 className="h-5 w-5 text-zinc-50" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-zinc-50">PulseBoard</span>
                </div>

                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Reset password</h1>
                    <p className="text-sm text-zinc-500">Enter your new password below.</p>
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
                                <Label htmlFor="password" className="text-zinc-400 text-xs font-medium uppercase tracking-wider">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-zinc-950/60 border-zinc-800 text-zinc-50 focus-visible:ring-zinc-700 h-11"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirmPassword" className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Confirm New Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="bg-zinc-950/60 border-zinc-800 text-zinc-50 focus-visible:ring-zinc-700 h-11"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="pb-6">
                            <Button
                                className="w-full bg-zinc-50 text-zinc-950 hover:bg-zinc-200 h-11 font-medium"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                                Reset Password
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
};
