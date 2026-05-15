import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusSquare, LogOut, BarChart3 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext'
import { cn } from '@/lib/utils';

export const Sidebar: React.FC = () => {
    const { signout } = useAuth();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', end: true },
        { icon: PlusSquare, label: 'Create Poll', path: '/dashboard/create' },
        // { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
    ];

    return (
        <div className="flex h-full w-64 flex-col bg-zinc-950 border-r border-zinc-800 transition-all duration-300">
            <div className="flex h-16 items-center px-6">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-950">
                        <BarChart3 className="h-5 w-5" />
                    </div>
                    <Link to="/" className="text-lg font-bold text-zinc-50 tracking-tight">PulseBoard</Link>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4">
                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-zinc-800 text-zinc-50"
                                        : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-50"
                                )
                            }
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="p-4 mt-auto">
                <button
                    onClick={signout}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-500"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
};
