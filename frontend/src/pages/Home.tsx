import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
    BarChart3, Users, Lock, Eye, EyeOff, Globe,
    ChevronDown, ChevronUp, CheckCircle2, Zap, ArrowRight, Activity,
    Menu, X, PieChart, Clock, ShieldCheck, Link as LinkIcon,
    MessageSquare, Presentation, Building2, Terminal, Users2, Sparkles, Plus, Play
} from "lucide-react";

// --- Components ---

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full pointer-events-none">
            <nav className={`pointer-events-auto transition-all duration-500 ease-in-out ${scrolled ? "mt-4 bg-zinc-900/85 backdrop-blur-xl border border-white/10 shadow-2xl py-3 px-6 rounded-xl w-[95%] max-w-4xl" : "mt-0 bg-transparent py-5 px-6 w-full max-w-7xl"}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white">PulseBoard</span>
                    </div>

                    {/* Desktop Nav - Reduced links */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Features</a>
                        <a href="#analytics" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Analytics</a>
                        <a href="#how-it-works" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">How It Works</a>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/signin" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Sign In</Link>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link to="/dashboard" className="px-5 py-2 bg-white text-zinc-950 hover:bg-zinc-200 text-sm font-bold rounded-md transition-colors shadow-md">
                                Create Poll
                            </Link>
                        </motion.div>
                    </div>

                    {/* Mobile Toggle */}
                    <button className="md:hidden text-zinc-300" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-20 left-4 right-4 md:hidden border border-white/10 bg-zinc-900/95 backdrop-blur-xl rounded-xl p-4 shadow-2xl pointer-events-auto"
                    >
                        <div className="flex flex-col gap-4">
                            <a href="#features" onClick={() => setIsOpen(false)} className="text-zinc-300 font-medium">Features</a>
                            <a href="#analytics" onClick={() => setIsOpen(false)} className="text-zinc-300 font-medium">Analytics</a>
                            <a href="#how-it-works" onClick={() => setIsOpen(false)} className="text-zinc-300 font-medium">How It Works</a>
                            <div className="h-px bg-white/10 my-2"></div>
                            <Link to="/signin" className="text-zinc-300 font-medium">Sign In</Link>
                            <Link to="/dashboard" className="text-white bg-zinc-800 text-center py-2 rounded-md font-medium">Create Poll</Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Hero = () => {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Background Gradients - Poppy Theme */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-500/15 rounded-full blur-[120px] opacity-60 mix-blend-screen pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/15 rounded-full blur-[100px] opacity-50 mix-blend-screen pointer-events-none translate-x-[20%] translate-y-[20%]"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm"
                    >
                        <Sparkles className="w-4 h-4 text-rose-400" />
                        <span className="text-sm font-medium text-zinc-300">The modern way to engage your audience</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 mb-6"
                    >
                        Live polls that keep <br className="hidden md:block" /> every room engaged.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        Create interactive polls, collect responses in real time, track live analytics, and publish results when you're ready. Built for classrooms, events, teams, and communities.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                            <Link to="/dashboard" className="w-full px-8 py-4 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-lg transition-colors shadow-[0_0_30px_rgba(244,63,94,0.3)] flex items-center justify-center gap-2">
                                Create your first poll
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                            <a href="#how-it-works" className="w-full px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg border border-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                                <Play className="w-5 h-5 text-zinc-400" />
                                View live demo
                            </a>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
                        className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-zinc-500 font-medium"
                    >
                        <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-rose-400" /> Real-time analytics</div>
                        <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-orange-400" /> Anonymous or login-based voting</div>
                        <div className="flex items-center gap-2"><Eye className="w-4 h-4 text-cyan-400" /> Publish results anytime</div>
                        <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-amber-400" /> Mobile friendly</div>
                    </motion.div>
                </div>

                {/* Dashboard Mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
                    className="mt-20 relative mx-auto max-w-5xl group"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10 top-1/2"></div>
                    {/* Subtle glow behind mockup on hover */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/20 to-orange-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>

                    <div className="relative rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl shadow-2xl overflow-hidden transition-transform duration-500">
                        {/* Browser Header */}
                        <div className="flex items-center px-4 py-3 border-b border-white/5 bg-zinc-950/80">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                            </div>
                            <div className="mx-auto bg-white/5 px-4 py-1 rounded-md text-xs text-zinc-500 flex items-center gap-2 border border-white/5">
                                <Lock className="w-3 h-3" /> app.pulseboard.com/analytics/xyz123
                            </div>
                        </div>
                        {/* Mockup Content */}
                        <div className="p-6 md:p-8 bg-zinc-950/50">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">College Student Quick Opinion Poll</h3>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="flex items-center gap-1.5 text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-full"><span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span> Live</span>
                                        <span className="text-zinc-500">•</span>
                                        <span className="text-zinc-400">Created today</span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-md text-sm font-medium text-white flex items-center gap-2">
                                        <Users className="w-4 h-4" /> User Summary
                                    </button>
                                    <button className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-md text-sm font-medium text-rose-400 flex items-center gap-2 transition-colors">
                                        <Eye className="w-4 h-4" /> Publish Results
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div className="bg-zinc-900 border border-white/5 p-4 rounded-lg flex items-center gap-4 hover:border-white/10 transition-colors">
                                    <div className="p-3 bg-cyan-500/10 rounded-md text-cyan-400"><BarChart3 className="w-6 h-6" /></div>
                                    <div><p className="text-xs text-zinc-500 font-medium">Total Votes</p><p className="text-2xl font-bold text-white">1,248</p></div>
                                </div>
                                <div className="bg-zinc-900 border border-white/5 p-4 rounded-lg flex items-center gap-4 hover:border-white/10 transition-colors">
                                    <div className="p-3 bg-orange-500/10 rounded-md text-orange-400"><Users2 className="w-6 h-6" /></div>
                                    <div><p className="text-xs text-zinc-500 font-medium">Participants</p><p className="text-2xl font-bold text-white">412</p></div>
                                </div>
                                <div className="bg-zinc-900 border border-white/5 p-4 rounded-lg flex items-center gap-4 hover:border-white/10 transition-colors">
                                    <div className="p-3 bg-rose-500/10 rounded-md text-rose-400"><Lock className="w-6 h-6" /></div>
                                    <div><p className="text-xs text-zinc-500 font-medium">Access</p><p className="text-2xl font-bold text-white">Login Required</p></div>
                                </div>
                            </div>

                            <div className="bg-zinc-900 border border-white/5 p-6 rounded-lg">
                                <h4 className="text-white font-medium mb-6">1. What is your preferred study method?</h4>
                                <div className="space-y-4">
                                    {[
                                        { label: "Group Study", percent: 45, color: "bg-rose-500", votes: 561 },
                                        { label: "Self Study", percent: 30, color: "bg-orange-500", votes: 374 },
                                        { label: "Video Lectures", percent: 15, color: "bg-cyan-500", votes: 187 },
                                        { label: "Practical Labs", percent: 10, color: "bg-amber-500", votes: 126 },
                                    ].map((opt, i) => (
                                        <div key={i} className="group/bar cursor-pointer">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-zinc-300 group-hover/bar:text-white transition-colors">{opt.label}</span>
                                                <span className="text-zinc-400">{opt.percent}% ({opt.votes})</span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }} animate={{ width: `${opt.percent}%` }} transition={{ duration: 1, delay: 0.8 + i * 0.1 }}
                                                    className={`h-full ${opt.color} rounded-full`}
                                                ></motion.div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

const ProblemSection = () => {
    return (
        <section className="py-24 bg-zinc-950 relative border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Stop guessing what your audience thinks.</h2>
                    <p className="text-lg text-zinc-400">Traditional feedback methods are broken. PulseBoard turns silent rooms into measurable, interactive experiences instantly.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { icon: MessageSquare, title: "Silent rooms become measurable", desc: "Give everyone a voice, even the quietest participants, with simple mobile voting." },
                        { icon: Clock, title: "No spreadsheet counting", desc: "Watch responses aggregate automatically in real-time. No manual data entry required." },
                        { icon: EyeOff, title: "Results when you decide", desc: "Keep responses hidden while people vote, then reveal them for maximum impact." },
                        { icon: Users, title: "Participant summaries", desc: "Don't just see the totals. Understand exactly how individual users answered." }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            whileHover={{ y: -5 }}
                            className="group relative p-6 rounded-lg bg-zinc-900 border border-white/5 hover:border-white/10 hover:bg-zinc-800/80 transition-all overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-12 h-12 rounded-md bg-rose-500/10 flex items-center justify-center mb-6 border border-rose-500/20">
                                <item.icon className="w-6 h-6 text-rose-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                            <p className="text-zinc-400 leading-relaxed text-sm">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const FeaturesSection = () => {
    const features = [
        { title: "Fast poll builder", desc: "Create multi-question polls with rich text and ordered options in seconds.", icon: Zap, colSpan: "md:col-span-2", borderGlow: "group-hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]" },
        { title: "Live voting", desc: "Participants vote instantly from a simple share link. No app required.", icon: Activity, colSpan: "md:col-span-1", borderGlow: "group-hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]" },
        { title: "Anonymous or authenticated", desc: "Allow quick anonymous voting or require sign-in for controlled access.", icon: ShieldCheck, colSpan: "md:col-span-1", borderGlow: "group-hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]" },
        { title: "Real-time analytics", desc: "Watch votes update live with beautiful, colorful charts as they happen.", icon: PieChart, colSpan: "md:col-span-2", borderGlow: "group-hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]" },
        { title: "Publish results", desc: "Keep results private until you are ready to reveal them to the audience.", icon: Eye, colSpan: "md:col-span-1", borderGlow: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]" },
        { title: "User-wise summary", desc: "Review participant responses in a clean, paginated accordion view.", icon: Users2, colSpan: "md:col-span-1", borderGlow: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]" },
        { title: "Expiry-aware polls", desc: "Questions disappear after expiry unless results are published.", icon: Clock, colSpan: "md:col-span-1", borderGlow: "group-hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]" },
    ];

    return (
        <section id="features" className="py-24 bg-zinc-950 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/30 via-zinc-950 to-zinc-950 pointer-events-none"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="mb-16">
                    <span className="text-rose-400 font-semibold tracking-wider uppercase text-sm mb-2 block">Powerful Features</span>
                    <h2 className="text-3xl md:text-5xl font-bold text-white">Everything you need to engage.</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.05 }}
                            className={`group p-6 rounded-xl border border-white/5 bg-zinc-900 overflow-hidden relative transition-all duration-500 hover:border-white/10 ${feature.borderGlow} ${feature.colSpan}`}
                        >
                            {/* Magic UI style spotlight hover effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <feature.icon className="w-8 h-8 text-zinc-400 mb-6 group-hover:text-rose-400 transition-colors duration-300" />
                            <h3 className="text-xl font-bold text-white mb-2 relative z-10">{feature.title}</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed relative z-10">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const AnalyticsShowcase = () => {
    return (
        <section id="analytics" className="py-24 bg-zinc-950 relative border-y border-white/5 overflow-hidden">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] opacity-50 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">See the pulse of your audience as it happens.</h2>
                        <p className="text-lg text-zinc-400 mb-8">PulseBoard turns responses into clean, real-time insight with charts, participant summaries, and publish controls. No more waiting for surveys to close.</p>

                        <ul className="space-y-4 mb-10">
                            {['Live socket updates as people vote', 'Colorful, easy-to-read charts', 'Total votes and participant tracking', 'One-click publish results control'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-zinc-300">
                                    <CheckCircle2 className="w-5 h-5 text-rose-400" />
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <div className="flex gap-4">
                            <motion.a
                                href="/signin"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 bg-white text-zinc-950 font-semibold rounded-md hover:bg-zinc-200 transition-colors shadow-lg"
                            >
                                Explore Analytics
                            </motion.a>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-4 bg-gradient-to-r from-rose-500/30 to-orange-500/30 rounded-xl opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-700"></div>
                        <div className="relative bg-zinc-900 border border-white/10 rounded-xl p-6 shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-3 w-3 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                                    </span>
                                    <span className="text-sm font-medium text-white">Live Updates</span>
                                </div>
                                <div className="bg-white/5 text-xs text-zinc-400 px-3 py-1 rounded-md border border-white/10">34 new votes</div>
                            </div>

                            <div className="space-y-6">
                                {/* Mock Chart 1 */}
                                <div>
                                    <h5 className="text-sm text-zinc-300 mb-3 font-medium">How familiar are you with React?</h5>
                                    <div className="flex gap-2 h-24 items-end bg-zinc-950 p-4 rounded-lg border border-white/5 group-hover:border-white/10 transition-colors">
                                        <motion.div initial={{ height: "20%" }} animate={{ height: "80%" }} transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} className="w-1/4 bg-cyan-500 rounded-t-sm"></motion.div>
                                        <motion.div initial={{ height: "40%" }} animate={{ height: "60%" }} transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} className="w-1/4 bg-amber-500 rounded-t-sm"></motion.div>
                                        <motion.div initial={{ height: "10%" }} animate={{ height: "30%" }} transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} className="w-1/4 bg-orange-500 rounded-t-sm"></motion.div>
                                        <motion.div initial={{ height: "60%" }} animate={{ height: "90%" }} transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} className="w-1/4 bg-rose-500 rounded-t-sm"></motion.div>
                                    </div>
                                </div>
                                {/* Mock Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-zinc-950 p-4 rounded-lg border border-white/5 group-hover:border-white/10 transition-colors">
                                        <p className="text-xs text-zinc-500 mb-1">Completion Rate</p>
                                        <p className="text-xl font-bold text-white">84%</p>
                                    </div>
                                    <div className="bg-zinc-950 p-4 rounded-lg border border-white/5 group-hover:border-white/10 transition-colors">
                                        <p className="text-xs text-zinc-500 mb-1">Avg. Time</p>
                                        <p className="text-xl font-bold text-white">42s</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const HowItWorks = () => {
    const steps = [
        { title: "Create your poll", desc: "Add questions, options, duration, and access rules in our intuitive builder.", icon: Plus },
        { title: "Share the join link", desc: "Send the public link or QR code to students, attendees, or teammates.", icon: LinkIcon },
        { title: "Watch responses live", desc: "Track votes and participants in real-time analytics as they pour in.", icon: Activity },
        { title: "Publish the results", desc: "Let participants view final results on their devices when you're ready.", icon: Eye },
    ];

    return (
        <section id="how-it-works" className="py-24 bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Four steps to better engagement.</h2>
                    <p className="text-lg text-zinc-400">Simple for creators, seamless for participants.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                    <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent overflow-hidden">
                        <motion.div
                            className="absolute top-0 h-full w-[150px] bg-gradient-to-r from-transparent via-rose-500 to-transparent"
                            style={{ boxShadow: "0 0 10px 1px rgba(244, 63, 94, 0.5)" }}
                            initial={{ left: "-20%", opacity: 0 }}
                            animate={{ left: "100%", opacity: [0, 1, 1, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </div>

                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            className="relative flex flex-col items-center text-center group"
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="w-24 h-24 rounded-full bg-zinc-900 border-4 border-zinc-950 flex items-center justify-center relative z-10 mb-6 group-hover:border-rose-500/20 transition-colors shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                                <step.icon className="w-8 h-8 text-rose-400 group-hover:scale-110 transition-transform" />
                                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-rose-500/20">
                                    {i + 1}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const UseCases = () => {
    const cases = [
        { title: "Colleges & Classrooms", desc: "Ask quick opinion questions, check understanding, and let students respond from their phones.", icon: Presentation },
        { title: "Workshops & Webinars", desc: "Keep remote and hybrid audiences attentive with interactive checkpoints.", icon: Globe },
        { title: "Team Meetings", desc: "Gather honest, anonymous feedback on project direction and team sentiment.", icon: Users },
        { title: "Events & Conferences", desc: "Run large-scale live polls during keynotes to display instant crowd opinions.", icon: Building2 },
        { title: "Hackathons", desc: "Vote on project ideas, stack preferences, or coordinate team formations easily.", icon: Terminal },
        { title: "Community Feedback", desc: "Share public links to gather structured responses from your community members.", icon: MessageSquare },
    ];

    return (
        <section id="use-cases" className="py-24 bg-zinc-900/50 border-y border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-16 max-w-2xl">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Built for every scenario.</h2>
                    <p className="text-lg text-zinc-400">Wherever there's an audience, PulseBoard helps you connect with them.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cases.map((item, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.02 }}
                            className="p-8 rounded-lg bg-zinc-950 border border-white/5 hover:border-rose-500/30 hover:bg-zinc-900 transition-all group shadow-sm hover:shadow-lg hover:shadow-rose-500/5"
                        >
                            <item.icon className="w-8 h-8 text-zinc-500 group-hover:text-rose-400 transition-colors mb-6" />
                            <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const UserSummary = () => {
    return (
        <section className="py-24 bg-zinc-950 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1">
                        <div className="relative bg-zinc-900 border border-white/10 rounded-xl p-2 shadow-2xl group hover:border-white/20 transition-colors duration-500">
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                            <div className="bg-zinc-950 rounded-lg overflow-hidden border border-white/5 relative z-10">
                                <div className="grid grid-cols-3 bg-white/5 p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                                    <div>Participant</div>
                                    <div>Type</div>
                                    <div>Responses</div>
                                </div>
                                {[
                                    { name: "Alex Johnson", type: "Registered", count: "4/4", isOpen: true },
                                    { name: "Guest User", type: "Anonymous", count: "3/4", isOpen: false },
                                    { name: "Sarah Smith", type: "Registered", count: "4/4", isOpen: false },
                                ].map((user, i) => (
                                    <div key={i} className="border-t border-white/5 p-4 text-sm flex flex-col hover:bg-white/[0.02] transition-colors cursor-pointer">
                                        <div className="grid grid-cols-3 items-center">
                                            <div className="font-medium text-white flex items-center gap-2">
                                                <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${user.isOpen ? 'rotate-180' : ''}`} /> {user.name}
                                            </div>
                                            <div className="text-zinc-400">
                                                <span className={`px-2 py-1 rounded-md text-xs ${user.type === 'Registered' ? 'bg-rose-500/10 text-rose-400' : 'bg-zinc-800 text-zinc-400'}`}>{user.type}</span>
                                            </div>
                                            <div className="text-zinc-400">{user.count}</div>
                                        </div>
                                        <AnimatePresence>
                                            {user.isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="mt-4 pl-6 space-y-3 border-l-2 border-rose-500/30 ml-2 py-2">
                                                        <div>
                                                            <p className="text-xs text-zinc-500 mb-1">Q1: Preferred framework?</p>
                                                            <p className="text-white font-medium">React (Next.js)</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-zinc-500 mb-1">Q2: Years of experience?</p>
                                                            <p className="text-white font-medium">3-5 years</p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="order-1 lg:order-2">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Know not just what people voted, but who responded.</h2>
                        <p className="text-lg text-zinc-400 mb-8">Review participant-level responses in a clean, paginated summary built for real follow-up and deeper understanding.</p>

                        <div className="space-y-6">
                            <div className="flex gap-4 group cursor-default">
                                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-rose-500/10 transition-colors">
                                    <Users2 className="w-6 h-6 text-zinc-300 group-hover:text-rose-400 transition-colors" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg mb-1 group-hover:text-rose-100 transition-colors">Expandable Accordions</h4>
                                    <p className="text-zinc-400">Click on any user to instantly reveal their exact answers to every question.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 group cursor-default">
                                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-orange-500/10 transition-colors">
                                    <Lock className="w-6 h-6 text-zinc-300 group-hover:text-orange-400 transition-colors" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg mb-1 group-hover:text-orange-100 transition-colors">Guest vs Registered Tracking</h4>
                                    <p className="text-zinc-400">Easily identify authenticated users versus anonymous guests who provided names.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const Testimonials = () => {
    const testimonials = [
        { text: "PulseBoard made our classroom discussions instantly more interactive.", author: "Priya S.", role: "College Faculty" },
        { text: "The live analytics page is exactly what we needed during workshops.", author: "Arjun M.", role: "Workshop Host" },
        { text: "Publishing results after the poll ended gave us full control over the narrative.", author: "Neha R.", role: "Event Coordinator" },
        { text: "The user-wise summary helped us understand every participant's response.", author: "Rahul D.", role: "Team Lead" },
    ];

    return (
        <section className="py-24 bg-zinc-950 border-t border-white/5 overflow-hidden">
            <div className="text-center mb-16 max-w-3xl mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Loved by educators and teams.</h2>
            </div>

            <div className="relative flex overflow-x-hidden group">
                <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none"></div>

                <div className="flex space-x-6 animate-[marquee_30s_linear_infinite] group-hover:[animation-play-state:paused] whitespace-nowrap pl-6">
                    {[...testimonials, ...testimonials].map((t, i) => (
                        <div key={i} className="w-[400px] inline-flex flex-col justify-between whitespace-normal bg-zinc-900 border border-white/5 hover:border-rose-500/30 p-8 rounded-lg shrink-0 transition-colors">
                            <p className="text-zinc-300 text-lg mb-6 leading-relaxed">"{t.text}"</p>
                            <div>
                                <p className="text-white font-bold">{t.author}</p>
                                <p className="text-zinc-500 text-sm">{t.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const faqs = [
        { q: "Can participants vote without logging in?", a: "Yes. You can create anonymous polls that allow participants to vote immediately or just ask for a simple first and last name without requiring an account." },
        { q: "Can I require login before showing questions?", a: "Absolutely. You can set the access type to require authentication, ensuring only registered users can view and respond to your poll." },
        { q: "What happens when a poll expires?", a: "Once a poll expires, the questions are hidden from participants to prevent further voting, unless you have explicitly chosen to publish the results." },
        { q: "Can I publish results later?", a: "Yes, you have full control. You can keep results completely hidden during the live voting phase and hit 'Publish' only when you're ready to reveal them." },
        { q: "Can I see user-wise responses?", a: "Yes! The analytics dashboard includes a dedicated user-wise summary page where you can expand each participant to see exactly how they answered." },
        { q: "Does analytics update live?", a: "Yes, our dashboard uses WebSockets to show new votes and participants in real-time without needing to refresh the page." },
    ];

    return (
        <section className="py-24 bg-zinc-950 border-t border-white/5">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">Frequently asked questions</h2>
                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className="bg-zinc-900/80 border border-white/10 rounded-lg overflow-hidden transition-colors hover:border-white/20">
                            <button
                                className="w-full px-6 py-4 flex justify-between items-center text-left focus:outline-none"
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            >
                                <h4 className="text-lg font-semibold text-white">{faq.q}</h4>
                                {openIndex === i ? (
                                    <ChevronUp className="w-5 h-5 text-zinc-400 shrink-0" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-zinc-400 shrink-0" />
                                )}
                            </button>
                            <AnimatePresence>
                                {openIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <p className="px-6 pb-4 text-zinc-400 leading-relaxed border-t border-white/5 pt-4">{faq.a}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const CTA = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-zinc-950"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-rose-500/20 rounded-full blur-[150px] pointer-events-none"></div>

            <div className="max-w-4xl mx-auto px-4 relative z-10 text-center border border-white/10 bg-zinc-900/60 backdrop-blur-xl rounded-xl p-12 md:p-20 shadow-2xl">
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Ready to make your next session interactive?</h2>
                <p className="text-xl text-zinc-300 mb-10 max-w-2xl mx-auto">Create a live poll in minutes and understand your audience instantly. Free to get started.</p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                        <Link to="/dashboard" className="w-full px-8 py-4 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-lg transition-colors text-lg shadow-[0_0_20px_rgba(244,63,94,0.4)] flex justify-center">
                            Create Poll
                        </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                        <Link to="/signin" className="w-full px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-lg transition-colors text-lg flex justify-center">
                            Open Dashboard
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

const Footer = () => {
    return (
        <footer className="bg-zinc-950 border-t border-white/10 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
                                <Activity className="w-3 h-3 text-white" />
                            </div>
                            <span className="font-bold text-lg text-white">PulseBoard</span>
                        </div>
                        <p className="text-zinc-500 text-sm mb-6">Real-time live polling and audience response platform for modern teams and educators.</p>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Product</h4>
                        <ul className="space-y-3">
                            <li><a href="#features" className="text-zinc-500 hover:text-rose-400 text-sm transition-colors">Features</a></li>
                            <li><a href="#analytics" className="text-zinc-500 hover:text-rose-400 text-sm transition-colors">Analytics</a></li>
                            <li><a href="#how-it-works" className="text-zinc-500 hover:text-rose-400 text-sm transition-colors">How It Works</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Resources</h4>
                        <ul className="space-y-3">
                            <li><a href="#use-cases" className="text-zinc-500 hover:text-rose-400 text-sm transition-colors">Use Cases</a></li>
                            <li><a href="#" className="text-zinc-500 hover:text-rose-400 text-sm transition-colors">FAQ</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Account</h4>
                        <ul className="space-y-3">
                            <li><Link to="/signin" className="text-zinc-500 hover:text-rose-400 text-sm transition-colors">Sign In</Link></li>
                            <li><Link to="/signup" className="text-zinc-500 hover:text-rose-400 text-sm transition-colors">Create Account</Link></li>
                            <li><Link to="/dashboard" className="text-zinc-500 hover:text-rose-400 text-sm transition-colors">Dashboard</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-zinc-600 text-sm">© {new Date().getFullYear()} PulseBoard. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-zinc-600 hover:text-white transition-colors">Twitter</a>
                        <a href="#" className="text-zinc-600 hover:text-white transition-colors">GitHub</a>
                        <a href="#" className="text-zinc-600 hover:text-white transition-colors">Discord</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default function Home() {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-rose-500/30 overflow-x-hidden font-sans">
            <Navbar />
            <main>
                <Hero />
                <ProblemSection />
                <FeaturesSection />
                <AnalyticsShowcase />
                <HowItWorks />
                <UseCases />
                <UserSummary />
                <Testimonials />
                <FAQ />
                <CTA />
            </main>
            <Footer />
        </div>
    );
}
