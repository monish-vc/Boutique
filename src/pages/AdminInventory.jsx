import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowLeft, FiPackage, FiAlertTriangle, FiXCircle,
  FiPlus, FiMinus, FiEdit2, FiRefreshCw, FiFilter
} from 'react-icons/fi';
import { supabase, getImageUrl } from '../lib/supabase';
import toast from 'react-hot-toast';

const STATUS = {
  all: 'All',
  out: 'Out of Stock',
  low: 'Low Stock',
  ok: 'In Stock',
};

function StockBadge({ stock, threshold }) {
  if (stock === 0)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-sans font-medium bg-red-100 text-red-700 rounded-full">
        <FiXCircle size={10} /> Out of Stock
      </span>
    );
  if (stock <= threshold)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-sans font-medium bg-amber-100 text-amber-700 rounded-full">
        <FiAlertTriangle size={10} /> Low Stock
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-sans font-medium bg-green-100 text-green-700 rounded-full">
      <FiPackage size={10} /> In Stock
    </span>
  );
}

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [adjusting, setAdjusting] = useState({}); // productId -> saving
  const [deltas, setDeltas] = useState({}); // productId -> delta string

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, category, price, stock, low_stock_threshold, image_url')
        .order('stock', { ascending: true });
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      toast.error('Failed to load inventory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = products.filter((p) => {
    if (filter === 'out') return p.stock === 0;
    if (filter === 'low') return p.stock > 0 && p.stock <= p.low_stock_threshold;
    if (filter === 'ok') return p.stock > p.low_stock_threshold;
    return true;
  });

  // Summary stats
  const outCount = products.filter((p) => p.stock === 0).length;
  const lowCount = products.filter((p) => p.stock > 0 && p.stock <= p.low_stock_threshold).length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);

  const handleDeltaChange = (id, val) => {
    setDeltas((prev) => ({ ...prev, [id]: val }));
  };

  const applyAdjustment = async (product) => {
    const delta = parseInt(deltas[product.id] || '0', 10);
    if (isNaN(delta) || delta === 0) {
      toast.error('Enter a non-zero adjustment value');
      return;
    }
    const newStock = Math.max(0, product.stock + delta);
    setAdjusting((prev) => ({ ...prev, [product.id]: true }));
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', product.id);
      if (error) throw error;
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p))
      );
      setDeltas((prev) => ({ ...prev, [product.id]: '' }));
      toast.success(`Stock updated to ${newStock}`);
    } catch (err) {
      toast.error('Failed to update stock');
      console.error(err);
    } finally {
      setAdjusting((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  const setStockDirect = async (product, value) => {
    const newStock = Math.max(0, value);
    setAdjusting((prev) => ({ ...prev, [product.id]: true }));
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', product.id);
      if (error) throw error;
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p))
      );
      toast.success(`Stock set to ${newStock}`);
    } catch (err) {
      toast.error('Failed to update stock');
    } finally {
      setAdjusting((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  // Category summary
  const catSummary = products.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = { units: 0, value: 0, count: 0 };
    acc[p.category].units += p.stock;
    acc[p.category].value += p.stock * p.price;
    acc[p.category].count += 1;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1 text-sm font-sans text-wine-600 hover:text-wine-800 mb-2 transition-colors"
          >
            <FiArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="font-display text-wine-800 text-3xl font-semibold">Inventory</h1>
          <p className="font-sans text-wine-500 text-sm mt-1">{products.length} products tracked</p>
        </div>
        <button
          onClick={fetchProducts}
          className="btn-outline text-xs py-2 flex items-center gap-1"
        >
          <FiRefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-sm border border-brand-100 p-5 shadow-sm">
          <p className="text-xs font-sans uppercase tracking-wide text-wine-500 mb-1">Total Products</p>
          <p className="font-display text-wine-800 text-2xl font-semibold">{products.length}</p>
        </div>
        <div className="bg-white rounded-sm border border-brand-100 p-5 shadow-sm">
          <p className="text-xs font-sans uppercase tracking-wide text-wine-500 mb-1">Total Units</p>
          <p className="font-display text-wine-800 text-2xl font-semibold">{totalUnits.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-sm border border-red-100 p-5 shadow-sm">
          <p className="text-xs font-sans uppercase tracking-wide text-red-500 mb-1">Out of Stock</p>
          <p className="font-display text-red-600 text-2xl font-semibold">{outCount}</p>
        </div>
        <div className="bg-white rounded-sm border border-amber-100 p-5 shadow-sm">
          <p className="text-xs font-sans uppercase tracking-wide text-amber-600 mb-1">Low Stock</p>
          <p className="font-display text-amber-600 text-2xl font-semibold">{lowCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Inventory Table */}
        <div className="lg:col-span-2">
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {Object.entries(STATUS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 text-xs font-sans font-medium rounded-sm transition-all ${
                  filter === key
                    ? 'bg-wine-800 text-cream-100'
                    : 'bg-white border border-brand-200 text-wine-700 hover:border-wine-500'
                }`}
              >
                {label}
                {key !== 'all' && (
                  <span className="ml-1.5 opacity-70">
                    ({key === 'out' ? outCount : key === 'low' ? lowCount : products.length - outCount - lowCount})
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 skeleton rounded-sm" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-sm border border-brand-100 py-16 text-center">
              <FiPackage size={32} className="mx-auto text-wine-300 mb-3" />
              <p className="font-sans text-wine-500 text-sm">No products in this category</p>
            </div>
          ) : (
            <div className="bg-white rounded-sm border border-brand-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-cream-100 border-b border-brand-100">
                      <th className="text-left px-4 py-3 text-xs font-sans font-medium text-wine-600 uppercase tracking-wide">Product</th>
                      <th className="text-left px-4 py-3 text-xs font-sans font-medium text-wine-600 uppercase tracking-wide hidden sm:table-cell">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-sans font-medium text-wine-600 uppercase tracking-wide">Stock</th>
                      <th className="text-left px-4 py-3 text-xs font-sans font-medium text-wine-600 uppercase tracking-wide">Adjust</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => {
                      const imageUrl = getImageUrl(p.image_url);
                      const delta = deltas[p.id] || '';
                      const isSaving = adjusting[p.id];
                      return (
                        <tr key={p.id} className="border-b border-brand-50 hover:bg-cream-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-cream-200 rounded-sm overflow-hidden shrink-0">
                                {imageUrl ? (
                                  <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-cream-200" />
                                )}
                              </div>
                              <div>
                                <p className="font-sans text-sm text-wine-800 font-medium truncate max-w-[140px]">{p.name}</p>
                                <p className="font-sans text-xs text-wine-400">{p.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <StockBadge stock={p.stock} threshold={p.low_stock_threshold} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setStockDirect(p, p.stock - 1)}
                                disabled={p.stock === 0 || isSaving}
                                className="w-6 h-6 flex items-center justify-center rounded-sm bg-cream-200 text-wine-700 hover:bg-cream-300 disabled:opacity-40 transition-all"
                              >
                                <FiMinus size={10} />
                              </button>
                              <span className={`font-display text-lg font-semibold min-w-[2rem] text-center ${
                                p.stock === 0 ? 'text-red-600' : p.stock <= p.low_stock_threshold ? 'text-amber-600' : 'text-wine-800'
                              }`}>
                                {p.stock}
                              </span>
                              <button
                                onClick={() => setStockDirect(p, p.stock + 1)}
                                disabled={isSaving}
                                className="w-6 h-6 flex items-center justify-center rounded-sm bg-cream-200 text-wine-700 hover:bg-cream-300 disabled:opacity-40 transition-all"
                              >
                                <FiPlus size={10} />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={delta}
                                onChange={(e) => handleDeltaChange(p.id, e.target.value)}
                                placeholder="±qty"
                                className="w-16 px-2 py-1 text-xs font-sans border border-brand-200 rounded-sm focus:outline-none focus:border-wine-800"
                              />
                              <button
                                onClick={() => applyAdjustment(p)}
                                disabled={isSaving || !delta}
                                className="px-2 py-1 text-xs font-sans bg-wine-800 text-cream-100 rounded-sm hover:bg-wine-900 disabled:opacity-40 transition-all"
                              >
                                {isSaving ? '...' : 'Apply'}
                              </button>
                              <Link
                                to={`/admin/products/edit/${p.id}`}
                                className="p-1.5 text-wine-500 hover:text-wine-800 hover:bg-cream-200 rounded-sm transition-all"
                                title="Edit product"
                              >
                                <FiEdit2 size={13} />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Category Summary Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-sm border border-brand-100 p-5 shadow-sm">
            <h3 className="font-display text-wine-800 text-base font-medium mb-4">Inventory Value</h3>
            <p className="font-display text-wine-800 text-3xl font-semibold">
              ₹{totalValue.toLocaleString('en-IN')}
            </p>
            <p className="text-xs font-sans text-wine-400 mt-1">{totalUnits} units across {products.length} products</p>
          </div>

          <div className="bg-white rounded-sm border border-brand-100 p-5 shadow-sm">
            <h3 className="font-display text-wine-800 text-base font-medium mb-4">By Category</h3>
            {Object.keys(catSummary).length === 0 ? (
              <p className="text-sm font-sans text-wine-400">No data yet</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(catSummary).map(([cat, data]) => (
                  <div key={cat}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-sans font-medium text-wine-700">{cat}</span>
                      <span className="text-xs font-sans text-wine-500">{data.units} units</span>
                    </div>
                    <div className="w-full bg-cream-200 rounded-full h-1.5">
                      <div
                        className="bg-wine-700 h-1.5 rounded-full transition-all"
                        style={{ width: totalUnits > 0 ? `${Math.min(100, (data.units / totalUnits) * 100)}%` : '0%' }}
                      />
                    </div>
                    <p className="text-[10px] font-sans text-wine-400 mt-0.5">
                      ₹{data.value.toLocaleString('en-IN')} • {data.count} product{data.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Alerts Panel */}
          {(outCount > 0 || lowCount > 0) && (
            <div className="bg-white rounded-sm border border-red-100 p-5 shadow-sm">
              <h3 className="font-display text-red-700 text-base font-medium mb-3 flex items-center gap-2">
                <FiAlertTriangle size={14} /> Stock Alerts
              </h3>
              <div className="space-y-2">
                {products
                  .filter((p) => p.stock <= p.low_stock_threshold)
                  .sort((a, b) => a.stock - b.stock)
                  .slice(0, 8)
                  .map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-xs font-sans">
                      <span className="text-wine-800 truncate max-w-[140px]">{p.name}</span>
                      <span className={`font-semibold ${p.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                        {p.stock === 0 ? 'OUT' : `${p.stock} left`}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
