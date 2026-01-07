import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, ArrowRight, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [showServerConfig, setShowServerConfig] = useState(false);
    const [serverUrl, setServerUrl] = useState('https://e-commerce-automobile-server.onrender.com');

    const handleServerUrlChange = (e) => {
        const url = e.target.value;
        setServerUrl(url);
        localStorage.setItem('server_url', url);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(username, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Side - Form Section */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative z-10">
                <div className="w-full max-w-md space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
                            <span className="text-white font-bold text-2xl">A</span>
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
                        <p className="mt-3 text-slate-500 text-lg">Enter your credentials to access your workspace.</p>
                    </motion.div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center"
                        >
                            <span className="mr-2 text-lg">⚠️</span> {error}
                        </motion.div>
                    )}

                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Username</label>
                            <div className="relative group">
                                <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200"
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-slate-700">Password</label>
                                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">Forgot password?</a>
                            </div>
                            <div className="relative group">
                                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader className="animate-spin" size={24} /> : (
                                <>
                                    Sign In <ArrowRight size={20} className="ml-2" />
                                </>
                            )}
                        </button>

                        <div className="pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setShowServerConfig(!showServerConfig)}
                                className="text-xs text-slate-400 hover:text-slate-600 font-medium flex items-center gap-1 transition-colors"
                            >
                                <span>⚙️</span> Server Configuration
                            </button>

                            {showServerConfig && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-3"
                                >
                                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">API Server URL</label>
                                    <input
                                        type="text"
                                        value={serverUrl}
                                        onChange={handleServerUrlChange}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                        placeholder="http://192.168.1.12:3001"
                                    />
                                </motion.div>
                            )}
                        </div>
                    </motion.form>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center text-slate-500"
                    >
                        Don't have an account? <Link to="/signup" className="text-blue-600 font-bold hover:underline">Create account</Link>
                    </motion.p>
                </div>
            </div>

            {/* Right Side - Visual Section */}
            <div className="hidden lg:block w-1/2 bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center opacity-50 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>

                <div className="relative z-10 h-full flex flex-col justify-end p-24">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        <h2 className="text-5xl font-bold text-white mb-6 leading-tight">Manage your fleet with <span className="text-blue-400">precision</span>.</h2>
                        <p className="text-slate-300 text-xl max-w-lg leading-relaxed">
                            Experience the next generation of inventory management. Real-time tracking, powerful analytics, and seamless collaboration.
                        </p>

                        <div className="mt-12 flex gap-4">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-xs text-white font-bold">
                                        U{i}
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="text-white font-bold">2k+ Users</span>
                                <span className="text-slate-400 text-sm">Trust AjayAutoMobile</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Login;
