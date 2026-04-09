import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft, FiAlertTriangle, FiXCircle, FiPackage } from 'react-icons/fi';
import { supabase, getImageUrl } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      toast.error('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deleted');
    } catch (err) {
      toast.error('Failed to delete product');
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1 text-sm font-sans text-wine-600 hover:text-wine-800 mb-2 transition-colors"
          >
            <FiArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="font-display text-wine-800 text-3xl font-semibold">Products</h1>
          <p className="font-sans text-wine-500 text-sm mt-1">
            {products.length} product{products.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/admin/products/new" className="btn-primary text-xs py-2 flex items-center gap-1">
          <FiPlus size={14} /> Add Product
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 skeleton rounded-sm" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="bg-white rounded-sm border border-brand-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-cream-100 border-b border-brand-100">
                  <th className="text-left px-4 py-3 text-xs font-sans font-medium text-wine-600 uppercase tracking-wide">
                    Product
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-sans font-medium text-wine-600 uppercase tracking-wide hidden sm:table-cell">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-sans font-medium text-wine-600 uppercase tracking-wide hidden md:table-cell">
                    Stock
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-sans font-medium text-wine-600 uppercase tracking-wide">
                    Price
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-sans font-medium text-wine-600 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const imageUrl = getImageUrl(p.image_url);
                  return (
                    <tr key={p.id} className="border-b border-brand-50 hover:bg-cream-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-cream-200 rounded-sm overflow-hidden shrink-0">
                            {imageUrl ? (
                              <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-cream-200" />
                            )}
                          </div>
                          <span className="font-sans text-sm text-wine-800 font-medium truncate max-w-[200px]">
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs font-sans text-wine-600 bg-cream-200 px-2 py-1 rounded-sm">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {p.stock === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-sans font-medium bg-red-100 text-red-700 rounded-full">
                            <FiXCircle size={10} /> Out of Stock
                          </span>
                        ) : p.stock <= (p.low_stock_threshold ?? 5) ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-sans font-medium bg-amber-100 text-amber-700 rounded-full">
                            <FiAlertTriangle size={10} /> Low ({p.stock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-sans font-medium bg-green-100 text-green-700 rounded-full">
                            <FiPackage size={10} /> {p.stock} in stock
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-sans text-sm text-wine-800">
                        ₹{Number(p.price).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/products/edit/${p.id}`}
                            className="p-2 text-wine-600 hover:text-wine-800 hover:bg-cream-200 rounded-sm transition-all"
                            aria-label="Edit"
                          >
                            <FiEdit2 size={15} />
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-2 text-wine-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all"
                            aria-label="Delete"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-sm border border-brand-100">
          <p className="font-display text-wine-500 text-lg mb-4">No products yet</p>
          <Link to="/admin/products/new" className="btn-primary inline-flex items-center gap-1">
            <FiPlus size={14} /> Add Your First Product
          </Link>
        </div>
      )}
    </div>
  );
}
