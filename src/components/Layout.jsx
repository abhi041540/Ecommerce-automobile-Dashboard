import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Package, LogOut, User, Menu, X, Settings as SettingsIcon, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarItem = ({ to, icon: Icon, label, onClick }) => (
    <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
            `flex items-center px-4 py-3 rounded-xl mb-2 transition-all duration-200 group relative overflow-hidden ${isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`
        }
    >
        <Icon size={20} className="mr-3 relative z-10" />
        <span className="font-medium relative z-10">{label}</span>

        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </NavLink>
);

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const pageTitle = location.pathname.split('/')[1].charAt(0).toUpperCase() + location.pathname.split('/')[1].slice(1);

    return (
        <div className="flex min-h-screen bg-[var(--color-bg-body)]">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-72 bg-[var(--color-bg-sidebar)] text-white fixed h-full z-30 border-r border-slate-800">
                <div className="p-6 flex items-center border-b border-slate-800/50">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mr-3 shadow-lg shadow-blue-900/20">
                        <span className="font-bold text-white text-xl">A</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold tracking-tight">AjayAutoMobile</h2>
                        <p className="text-xs text-slate-500">Management System</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar">
                    <div className="mb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Main Menu</div>
                    <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <SidebarItem to="/inventory" icon={Package} label="Inventory" />

                    <div className="mt-8 mb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">System</div>
                    <SidebarItem to="/settings" icon={SettingsIcon} label="Settings" />
                </nav>

                <div className="p-4 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
                    <div className="flex items-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 mb-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center mr-3 ring-2 ring-slate-600">
                            <User size={20} className="text-slate-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-400 capitalize truncate">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center p-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm font-medium border border-transparent hover:border-red-500/20"
                    >
                        <LogOut size={16} className="mr-2" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-80 bg-[var(--color-bg-sidebar)] z-50 lg:hidden shadow-2xl flex flex-col"
                        >
                            <div className="p-6 flex justify-between items-center border-b border-slate-800">
                                <h2 className="text-xl font-bold text-white">AjayAutoMobile</h2>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
                                    <X size={24} />
                                </button>
                            </div>
                            <nav className="flex-1 p-4 space-y-1">
                                <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setIsMobileMenuOpen(false)} />
                                <SidebarItem to="/inventory" icon={Package} label="Inventory" onClick={() => setIsMobileMenuOpen(false)} />
                                <SidebarItem to="/settings" icon={SettingsIcon} label="Settings" onClick={() => setIsMobileMenuOpen(false)} />
                            </nav>
                            <div className="p-4 border-t border-slate-800">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center p-3 rounded-xl bg-slate-800 text-white hover:bg-slate-700 font-medium"
                                >
                                    <LogOut size={18} className="mr-2" />
                                    Sign Out
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isMobileMenuOpen ? 'scale-95 opacity-50 lg:scale-100 lg:opacity-100' : ''} lg:ml-72`}>
                <header
                    className={`sticky top-0 z-20 px-4 sm:px-8 h-20 flex items-center justify-between transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm' : 'bg-transparent'
                        }`}
                >
                    <div className="flex items-center">
                        <button
                            className="lg:hidden mr-4 p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{pageTitle}</h1>
                            <div className="flex items-center text-xs text-slate-500 mt-0.5">
                                <span>AjayAutoMobile</span>
                                <ChevronRight size={12} className="mx-1" />
                                <span className="text-blue-600 font-medium">{pageTitle}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:block text-right">
                            <p className="text-xs font-medium text-slate-500">Today</p>
                            <p className="text-sm font-bold text-slate-800">
                                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold border-2 border-white shadow-sm">
                            {user?.name?.charAt(0)}
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-4 sm:p-8 max-w-[1920px] mx-auto w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
