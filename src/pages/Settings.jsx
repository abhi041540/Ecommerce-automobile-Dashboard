import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Save, Shield, User, Bell, Globe, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('security');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user, changePassword } = useAuth();

    // Local preferences state
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        updates: false
    });
    const [language, setLanguage] = useState('en');
    const [appearance, setAppearance] = useState('light');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsLoading(true);
        try {
            await changePassword(oldPassword, newPassword);
            setMessage('Password updated successfully');
            setOldPassword('');
            setNewPassword('');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const Section = ({ title, description, children }) => (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500 mt-1">{description}</p>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    );

    const tabs = [
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'language', label: 'Language', icon: Globe },
        { id: 'appearance', label: 'Appearance', icon: Moon },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-10">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h2>
                <p className="text-slate-500 mt-2 text-lg">Manage your account preferences and security.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center p-3 rounded-xl font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <tab.icon size={20} className={`mr-3 ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'security' && (
                            <Section title="Security Settings" description="Update your password and secure your account.">
                                {message && (
                                    <div className="p-4 mb-6 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center">
                                        <Shield size={20} className="mr-2" /> {message}
                                    </div>
                                )}
                                {error && (
                                    <div className="p-4 mb-6 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center">
                                        <Shield size={20} className="mr-2" /> {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
                                        <div className="relative">
                                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="password"
                                                required
                                                value={oldPassword}
                                                onChange={(e) => setOldPassword(e.target.value)}
                                                className="input-field pl-11"
                                                placeholder="Enter current password"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                                        <div className="relative">
                                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="password"
                                                required
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="input-field pl-11"
                                                placeholder="Enter new password"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 mt-2 ml-1">Must be at least 8 characters long.</p>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="btn btn-primary shadow-lg shadow-blue-500/20 px-8 py-3"
                                        >
                                            {isLoading ? 'Updating...' : (
                                                <>
                                                    <Save size={18} className="mr-2" /> Update Password
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </Section>
                        )}

                        {activeTab === 'profile' && (
                            <Section title="Profile Information" description="View and update your personal details.">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold border-4 border-white shadow-md">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900">{user?.name}</h4>
                                            <p className="text-slate-500">@{user?.username}</p>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize mt-2">
                                                {user?.role}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                                            <input type="text" value={user?.name} disabled className="input-field bg-slate-50 text-slate-500 cursor-not-allowed" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                                            <input type="text" value={user?.username} disabled className="input-field bg-slate-50 text-slate-500 cursor-not-allowed" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 italic">Profile details are managed by the administrator.</p>
                                </div>
                            </Section>
                        )}

                        {activeTab === 'notifications' && (
                            <Section title="Notification Preferences" description="Manage how you receive alerts.">
                                <div className="space-y-4">
                                    {Object.entries(notifications).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                            <div>
                                                <h4 className="font-semibold text-slate-900 capitalize">{key} Notifications</h4>
                                                <p className="text-sm text-slate-500">Receive alerts via {key}.</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={value}
                                                    onChange={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        )}

                        {activeTab === 'language' && (
                            <Section title="Language & Region" description="Customize your localization settings.">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Display Language</label>
                                        <select
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                            className="input-field"
                                        >
                                            <option value="en">English (US)</option>
                                            <option value="es">Español</option>
                                            <option value="fr">Français</option>
                                            <option value="hi">Hindi</option>
                                        </select>
                                    </div>
                                </div>
                            </Section>
                        )}

                        {activeTab === 'appearance' && (
                            <Section title="Appearance" description="Customize the look and feel.">
                                <div className="grid grid-cols-3 gap-4">
                                    {['light', 'dark', 'system'].map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => setAppearance(mode)}
                                            className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${appearance === mode
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-slate-100 hover:border-slate-300 text-slate-600'
                                                }`}
                                        >
                                            <div className={`w-full h-20 rounded-lg ${mode === 'dark' ? 'bg-slate-900' : 'bg-white border border-slate-200'} shadow-sm mb-2`}></div>
                                            <span className="font-medium capitalize">{mode}</span>
                                        </button>
                                    ))}
                                </div>
                            </Section>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
