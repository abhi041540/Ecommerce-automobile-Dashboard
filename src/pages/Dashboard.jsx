import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useInventory } from '../contexts/InventoryContext';
import { TrendingUp, AlertTriangle, Package, DollarSign, Activity, Clock, ArrowRight, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, delay, trend, trendValue }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group"
    >
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
            <button className="text-slate-300 hover:text-slate-500 transition-colors">
                <MoreHorizontal size={20} />
            </button>
        </div>

        <div className="relative z-10">
            <h3 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">{value}</h3>
            <p className="text-slate-500 text-sm font-medium">{title}</p>
        </div>

        {trend && (
            <div className="mt-4 flex items-center text-xs font-medium">
                <span className={`flex items-center ${trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'} px-2 py-1 rounded-full`}>
                    <TrendingUp size={12} className={`mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
                    {trendValue}
                </span>
                <span className="text-slate-400 ml-2">vs last month</span>
            </div>
        )}

        {/* Background Decoration */}
        <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${color} opacity-5 group-hover:scale-150 transition-transform duration-500 ease-out`} />
    </motion.div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const { products, getLowStockProducts } = useInventory();

    const lowStockItems = getLowStockProducts();
    const totalValue = products.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const totalItems = products.reduce((acc, curr) => acc + curr.quantity, 0);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const OwnerDashboard = () => (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard
                    title="Total Inventory Value"
                    value={`₹${totalValue.toLocaleString('en-IN')}`}
                    icon={DollarSign}
                    color="bg-emerald-500"
                    trend="up"
                    trendValue="+12.5%"
                />
                <StatCard
                    title="Total Products"
                    value={products.length}
                    icon={Package}
                    color="bg-blue-500"
                    trend="up"
                    trendValue="+4 new"
                />
                <StatCard
                    title="Items in Stock"
                    value={totalItems}
                    icon={Activity}
                    color="bg-indigo-500"
                    trend="down"
                    trendValue="-2.3%"
                />
                <StatCard
                    title="Low Stock Alerts"
                    value={lowStockItems.length}
                    icon={AlertTriangle}
                    color="bg-amber-500"
                    trend={lowStockItems.length > 0 ? 'down' : 'up'}
                    trendValue={lowStockItems.length > 0 ? 'Action needed' : 'Healthy'}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Low Stock Alert Section */}
                <motion.div
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col"
                >
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center">
                            <div className="w-2 h-6 bg-amber-500 rounded-full mr-3"></div>
                            Low Stock Alerts
                        </h3>
                        <Link to="/inventory" className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">View All</Link>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Stock</th>
                                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {lowStockItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-12 text-center text-slate-400">
                                            <Package size={48} className="mx-auto mb-4 opacity-20" />
                                            <p>All stock levels are healthy.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    lowStockItems.slice(0, 5).map(item => (
                                        <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 mr-4 overflow-hidden border border-slate-200">
                                                        {item.image ? (
                                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-300"><Package size={16} /></div>
                                                        )}
                                                    </div>
                                                    <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-500">{item.category}</td>
                                            <td className="p-4 text-sm text-right font-bold text-slate-900">{item.quantity}</td>
                                            <td className="p-4 text-right">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                                                    Critical
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
                <motion.div
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
                >
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                        <div className="w-2 h-6 bg-blue-500 rounded-full mr-3"></div>
                        Recent Activity
                    </h3>

                    <div className="space-y-8 relative">
                        <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-slate-100"></div>
                        {[
                            { action: 'Stock Updated', item: 'Brembo Brake Pads', time: '2 mins ago', user: 'Worker', icon: Activity, color: 'bg-blue-500' },
                            { action: 'New Product', item: 'Motul 7100 4T', time: '1 hour ago', user: 'Owner', icon: Package, color: 'bg-emerald-500' },
                            { action: 'Low Stock', item: 'Castrol Edge', time: '3 hours ago', user: 'System', icon: AlertTriangle, color: 'bg-amber-500' },
                            { action: 'Stock Updated', item: 'NGK Spark Plugs', time: '5 hours ago', user: 'Worker', icon: Activity, color: 'bg-blue-500' },
                        ].map((activity, index) => (
                            <div key={index} className="flex items-start relative z-10">
                                <div className={`w-6 h-6 rounded-full ${activity.color} border-4 border-white shadow-sm flex items-center justify-center shrink-0 mr-4`}>
                                </div>
                                <div>
                                    <p className="text-slate-900 text-sm font-semibold">{activity.action}</p>
                                    <p className="text-slate-500 text-xs mt-0.5">{activity.item}</p>
                                    <p className="text-slate-400 text-[10px] mt-1 uppercase tracking-wide font-medium">{activity.time} • {activity.user}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );

    const WorkerDashboard = () => (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Pending Tasks"
                    value="3"
                    icon={Clock}
                    color="bg-amber-500"
                />
                <StatCard
                    title="Items to Restock"
                    value={lowStockItems.length}
                    icon={Package}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Updates Today"
                    value="12"
                    icon={Activity}
                    color="bg-emerald-500"
                />
            </div>

            <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8"
            >
                <h3 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link to="/inventory" className="group p-6 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all bg-slate-50 hover:bg-white flex items-center">
                        <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-5 group-hover:scale-110 transition-transform">
                            <Package size={28} />
                        </div>
                        <div className="flex-1">
                            <p className="text-slate-900 font-bold text-lg group-hover:text-blue-600 transition-colors">Update Stock</p>
                            <p className="text-slate-500 text-sm mt-1">Adjust quantity for incoming/outgoing items</p>
                        </div>
                        <ArrowRight className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </Link>
                    <div className="group p-6 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all bg-slate-50 hover:bg-white flex items-center cursor-pointer">
                        <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-5 group-hover:scale-110 transition-transform">
                            <Clock size={28} />
                        </div>
                        <div className="flex-1">
                            <p className="text-slate-900 font-bold text-lg group-hover:text-indigo-600 transition-colors">View Schedule</p>
                            <p className="text-slate-500 text-sm mt-1">Check assigned inventory checks</p>
                        </div>
                        <ArrowRight className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );

    return (
        <div className="max-w-[1600px] mx-auto">
            <div className="mb-10">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
                <p className="text-slate-500 mt-2 text-lg">Overview of your enterprise performance.</p>
            </div>

            {user?.role === 'owner' ? <OwnerDashboard /> : <WorkerDashboard />}
        </div>
    );
};

export default Dashboard;
