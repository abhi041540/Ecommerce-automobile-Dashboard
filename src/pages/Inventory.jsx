import React, { useState } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { useAuth } from '../contexts/AuthContext';
import { Search, Plus, Edit2, Trash2, X, Filter, Download, AlertTriangle, Package, ChevronDown, Check } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data for Barcode Lookup
const MOCK_DB = {
    '8901234567890': {
        name: 'Tata Nexon Front Bumper',
        category: 'Body Parts',
        price: 4500,
        image: 'https://boodmo.com/media/cache/catalog_part/images/parts/8901234567890.jpg' // Placeholder
    },
    '8909876543210': {
        name: 'Hyundai Creta Headlight Assembly',
        category: 'Electrical',
        price: 8500,
        image: ''
    },
    '8905555555555': {
        name: 'Mahindra XUV700 Brake Pads',
        category: 'Brakes',
        price: 2200,
        image: ''
    }
};

const Inventory = () => {
    const { products, loading, addProduct, updateProduct, deleteProduct } = useInventory();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterStock, setFilterStock] = useState('All');
    const [imagePreview, setImagePreview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        quantity: 0,
        price: 0,
        threshold: 5,
        imageBase64: ''
    });

    const categories = ['All', ...new Set(products.map(p => p.category))];

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
        const matchesStock = filterStock === 'All' ||
            (filterStock === 'Low Stock' && product.quantity <= product.threshold) ||
            (filterStock === 'In Stock' && product.quantity > product.threshold);
        return matchesSearch && matchesCategory && matchesStock;
    });

    const handleOpenModal = (product = null) => {
        if (product) {
            setCurrentProduct(product);
            setFormData({
                name: product.name,
                category: product.category,
                quantity: product.quantity,
                price: product.price,
                threshold: product.threshold,
                imageBase64: ''
            });
            setImagePreview(product.image || '');
        } else {
            setCurrentProduct(null);
            setFormData({
                name: '',
                category: '',
                quantity: 0,
                price: 0,
                threshold: 5,
                imageBase64: ''
            });
            setImagePreview('');
        }
        setIsModalOpen(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                alert('Please select a JPG or PNG image');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setFormData({ ...formData, imageBase64: base64String });
                setImagePreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('=== [Inventory.jsx] handleSubmit START ===');
        console.log('[Inventory.jsx] formData:', { ...formData, imageBase64: formData.imageBase64 ? 'BASE64_PRESENT' : 'NO_IMAGE' });

        if (!formData.name || !formData.category) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            setIsSubmitting(true);

            const productData = {
                name: formData.name,
                category: formData.category,
                quantity: Number(formData.quantity),
                price: Number(formData.price),
                threshold: Number(formData.threshold)
            };

            if (formData.imageBase64) {
                productData.imageBase64 = formData.imageBase64;
            }

            console.log('[Inventory.jsx] Product data:', { ...productData, imageBase64: productData.imageBase64 ? 'BASE64_PRESENT' : 'NO_IMAGE' });

            if (currentProduct) {
                console.log('[Inventory.jsx] Calling updateProduct with ID:', currentProduct._id);
                await updateProduct(currentProduct._id, productData);
                alert('Product updated successfully!');
            } else {
                console.log('[Inventory.jsx] Calling addProduct');
                await addProduct(productData);
                alert('Product added successfully!');
            }

            setIsModalOpen(false);
            setFormData({
                name: '',
                category: '',
                quantity: 0,
                price: 0,
                threshold: 5,
                imageBase64: ''
            });
            setImagePreview('');
            console.log('=== [Inventory.jsx] handleSubmit SUCCESS ===');
        } catch (error) {
            console.error('=== [Inventory.jsx] handleSubmit ERROR ===');
            console.error('[Inventory.jsx] Error:', error);
            alert(`Failed to ${currentProduct ? 'update' : 'add'} product: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleScanSuccess = (decodedText) => {
        console.log("Scanned Code:", decodedText);
        setIsScanning(false);

        // Lookup product
        const product = MOCK_DB[decodedText] || {
            name: `Unknown Product (${decodedText})`,
            category: 'Spares',
            price: 0,
            image: ''
        };

        // Open Add Modal with pre-filled data
        setFormData({
            name: product.name,
            category: product.category,
            quantity: 1, // Default to 1, user will be asked to confirm/edit
            price: product.price,
            threshold: 5,
            imageBase64: '' // We can't easily convert URL to base64 here without fetching, so we skip or handle differently. 
            // For now, we'll leave it empty or user adds it. 
            // If we really want, we could fetch the URL and convert to blob -> base64.
        });
        setCurrentProduct(null); // Ensure it's "Add New" mode
        setIsModalOpen(true);

        // Optional: Show a specific "Enter Quantity" focus or hint?
        // The modal opens, user sees data, enters quantity, clicks save.
        // This matches the user's request "pop up will ask the quantity".
    };

    const handleScanFailure = (error) => {
        // console.warn(`Code scan error = ${error}`);
    };

    // Effect for Scanner
    React.useEffect(() => {
        if (isScanning) {
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            );
            scanner.render(handleScanSuccess, handleScanFailure);

            return () => {
                scanner.clear().catch(error => console.error("Failed to clear html5-qrcode scanner. ", error));
            };
        }
    }, [isScanning]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(id);
                alert('Product deleted successfully!');
            } catch (error) {
                alert(`Failed to delete product: ${error.message}`);
            }
        }
    };

    const handleExport = () => {
        const headers = ['Name', 'Category', 'Price', 'Quantity', 'Threshold', 'Status'];
        const csvContent = [
            headers.join(','),
            ...filteredProducts.map(p => [
                `"${p.name}"`,
                `"${p.category}"`,
                p.price,
                p.quantity,
                p.threshold,
                p.quantity <= p.threshold ? 'Low Stock' : 'In Stock'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Inventory</h2>
                    <p className="text-slate-500 mt-1">Manage your products and stock levels.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {user?.role === 'owner' && (
                        <button onClick={() => handleOpenModal()} className="btn btn-primary shadow-lg shadow-blue-500/30 w-full md:w-auto">
                            <Plus size={18} className="mr-2" /> Add Product
                        </button>
                    )}
                    {user?.role === 'owner' && (
                        <button onClick={() => setIsScanning(true)} className="btn bg-slate-800 text-white hover:bg-slate-700 shadow-lg shadow-slate-500/30 w-full md:w-auto flex items-center justify-center px-4 py-2 rounded-xl transition-all">
                            <div className="mr-2"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><rect x="7" y="7" width="10" height="10" rx="1" /></svg></div>
                            Scan Barcode
                        </button>
                    )}
                </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                    </div>
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none cursor-pointer">
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <select value={filterStock} onChange={(e) => setFilterStock(e.target.value)} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none cursor-pointer">
                        <option value="All">All Status</option>
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                    </select>
                </div>
                <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 justify-end">
                    <button onClick={handleExport} className="btn btn-ghost border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 whitespace-nowrap">
                        <Download size={18} className="mr-2" /> Export CSV
                    </button>
                    <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>
                    <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                            <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                                <div className="bg-current rounded-[1px]"></div>
                                <div className="bg-current rounded-[1px]"></div>
                                <div className="bg-current rounded-[1px]"></div>
                                <div className="bg-current rounded-[1px]"></div>
                            </div>
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                            <div className="flex flex-col gap-0.5 w-4 h-4 justify-center">
                                <div className="bg-current h-[2px] rounded-full w-full"></div>
                                <div className="bg-current h-[2px] rounded-full w-full"></div>
                                <div className="bg-current h-[2px] rounded-full w-full"></div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {viewMode === 'grid' ? (
                    <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <motion.div key={product._id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -5 }} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 overflow-hidden group flex flex-col">
                                    <div className="relative h-48 overflow-hidden bg-slate-100">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <Package size={48} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                            <button onClick={() => handleOpenModal(product)} className="p-3 bg-white rounded-full shadow-lg text-slate-700 hover:text-blue-600 hover:scale-110 transition-all" title="Edit">
                                                <Edit2 size={18} />
                                            </button>
                                            {user?.role === 'owner' && (
                                                <button onClick={() => handleDelete(product._id)} className="p-3 bg-white rounded-full shadow-lg text-slate-700 hover:text-red-600 hover:scale-110 transition-all" title="Delete">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                        {product.quantity <= product.threshold && (
                                            <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center shadow-lg animate-pulse">
                                                <AlertTriangle size={12} className="mr-1.5" /> Low Stock
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1 min-w-0 mr-2">
                                                <h3 className="font-bold text-slate-900 truncate text-lg" title={product.name}>{product.name}</h3>
                                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">{product.category}</p>
                                            </div>
                                            <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-sm whitespace-nowrap">₹{product.price.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-slate-400 font-medium uppercase">In Stock</span>
                                                <span className={`text-lg font-bold ${product.quantity <= product.threshold ? 'text-red-500' : 'text-slate-700'}`}>
                                                    {product.quantity} <span className="text-sm text-slate-400 font-normal">units</span>
                                                </span>
                                            </div>
                                            {user?.role === 'worker' && (
                                                <button onClick={() => handleOpenModal(product)} className="px-3 py-1.5 bg-blue-50 text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-100 transition-colors">
                                                    Update
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <Package size={48} className="mx-auto text-slate-300 mb-3" />
                                <p className="text-slate-500">No products found</p>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">Image</th>
                                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product Name</th>
                                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map((product) => (
                                            <tr key={product._id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="p-4">
                                                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                                                        {product.image ? (
                                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-300"><Package size={20} /></div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-semibold text-slate-900">{product.name}</div>
                                                    {product.quantity <= product.threshold && (
                                                        <span className="text-xs text-red-500 font-medium flex items-center mt-1">
                                                            <AlertTriangle size={10} className="mr-1" /> Low Stock
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-sm text-slate-500">{product.category}</td>
                                                <td className="p-4 text-sm font-medium text-slate-900">₹{product.price.toLocaleString('en-IN')}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.quantity <= product.threshold ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                                        {product.quantity} units
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleOpenModal(product)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                            <Edit2 size={16} />
                                                        </button>
                                                        {user?.role === 'owner' && (
                                                            <button onClick={() => handleDelete(product._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="p-12 text-center text-slate-500">
                                                No products found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                        <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} transition={{ type: "spring", duration: 0.5 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-xl font-bold text-slate-900">
                                    {currentProduct ? (user?.role === 'worker' ? 'Update Stock' : 'Edit Product') : 'Add New Product'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                                {user?.role === 'owner' || !currentProduct ? (
                                    <>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Name *</label>
                                                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" placeholder="e.g. Tesla Model S" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category *</label>
                                                    <input type="text" required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" placeholder="e.g. Electric" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price (₹) *</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                                                        <input type="number" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full pl-7 pr-4 py-2.5 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" placeholder="0.00" min="0" step="0.01" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stock Threshold</label>
                                                    <input type="number" required value={formData.threshold} onChange={(e) => setFormData({ ...formData, threshold: Number(e.target.value) })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" placeholder="5" min="0" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Image</label>
                                                    <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleImageChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                                                </div>
                                            </div>

                                            {imagePreview && (
                                                <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200">
                                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : null}

                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <label className="block text-sm font-semibold text-slate-700 mb-3 text-center">Current Stock Quantity</label>
                                    <div className="flex items-center justify-center gap-6">
                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, quantity: Math.max(0, prev.quantity - 1) }))} className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95">
                                            <span className="text-2xl font-light mb-1">−</span>
                                        </button>
                                        <div className="w-24 text-center">
                                            <input type="number" required value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: Math.max(0, Number(e.target.value)) })} className="w-full text-center font-bold text-3xl bg-transparent border-none focus:ring-0 p-0 text-slate-900" min="0" />
                                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Units</span>
                                        </div>
                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, quantity: prev.quantity + 1 }))} className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95">
                                            <span className="text-2xl font-light mb-1">+</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                                        <Check size={20} className="mr-2" />
                                        {isSubmitting ? 'Saving...' : (currentProduct ? 'Save Changes' : 'Create Product')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isScanning && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md relative">
                            <button
                                onClick={() => setIsScanning(false)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
                            >
                                <X size={24} />
                            </button>
                            <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">Scan Product Barcode</h3>
                            <div id="reader" className="w-full overflow-hidden rounded-xl border-2 border-slate-200"></div>
                            <p className="text-center text-sm text-slate-500 mt-4">
                                Point your camera at a product barcode to scan.
                            </p>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Inventory;
