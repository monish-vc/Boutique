import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiEye, FiShoppingBag, FiMessageCircle, FiPlus, FiAlertTriangle, FiXCircle, FiArchive } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '../lib/supabase';

const CHART_COLORS = ['#7c2d41', '#b01d48', '#e44d7a', '#f6a9c0', '#c9a84c', '#d4622e'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, views: 0, cartAdds: 0, whatsapp: 0 });
  const [productViews, setProductViews] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [stockAlerts, setStockAlerts] = useState({ outOfStock: 0, lowStock: 0, alertList: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        // Product count
        const { count: productCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        // Analytics counts
        const { data: analytics } = await supabase
          .from('analytics')
          .select('event_type, product_id');

        const views = analytics?.filter((a) => a.event_type === 'view').length || 0;
        const cartAdds = analytics?.filter((a) => a.event_type === 'add_to_cart').length || 0;
        const whatsapp = analytics?.filter((a) => a.event_type === 'whatsapp_click').length || 0;

        setStats({
          products: productCount || 0,
          views,
          cartAdds,
          whatsapp,
        });

        // Top products by views
        const viewCounts = {};
        analytics?.filter((a) => a.event_type === 'view').forEach((a) => {
          viewCounts[a.product_id] = (viewCounts[a.product_id] || 0) + 1;
        });

        const topProductIds = Object.entries(viewCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([id]) => id);

        if (topProductIds.length > 0) {
          const { data: topProducts } = await supabase
            .from('products')
            .select('id, name')
            .in('id', topProductIds);

          const chartData = topProductIds.map((id) => {
            const product = topProducts?.find((p) => p.id === id);
            return {
              name: product?.name?.substring(0, 15) || 'Unknown',
              views: viewCounts[id],
            };
          });
          setProductViews(chartData);
        }

        // Category distribution
        const { data: products } = await supabase
          .from('products')
          .select('category');

        const catCounts = {};
        products?.forEach((p) => {
          catCounts[p.category] = (catCounts[p.category] || 0) + 1;
        });
        setCategoryData(
          Object.entries(catCounts).map(([name, value]) => ({ name, value }))
        );

        // Stock alerts
        const { data: stockData } = await supabase
          .from('products')
          .select('id, name, stock, low_stock_threshold');
        const out = stockData?.filter((p) => p.stock === 0) || [];
        const low = stockData?.filter((p) => p.stock > 0 && p.stock <= (p.low_stock_threshold ?? 5)) || [];
        setStockAlerts({
          outOfStock: out.length,
          lowStock: low.length,
          alertList: [...out, ...low].slice(0, 6),
        });
      } catch (err) {
        console.error('Analytics error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  const statCards = [
    { label: 'Products', value: stats.products, icon: FiPackage, color: 'bg-wine-800' },
    { label: 'Total Views', value: stats.views, icon: FiEye, color: 'bg-wine-600' },
    { label: 'Cart Adds', value: stats.cartAdds, icon: FiShoppingBag, color: 'bg-gold-500' },
    { label: 'WhatsApp Clicks', value: stats.whatsapp, icon: FiMessageCircle, color: 'bg-green-600' },
    { label: 'Out of Stock', value: stockAlerts.outOfStock, icon: FiXCircle, color: 'bg-red-600' },
    { label: 'Low Stock', value: stockAlerts.lowStock, icon: FiAlertTriangle, color: 'bg-amber-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-wine-800 text-3xl font-semibold">Dashboard</h1>
          <p className="font-sans text-wine-500 text-sm mt-1">
            Welcome back, Admin
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/inventory" className="btn-outline text-xs py-2">
            <FiArchive className="inline mr-1" size={14} /> Inventory
          </Link>
          <Link to="/admin/products" className="btn-outline text-xs py-2">
            <FiPackage className="inline mr-1" size={14} /> Manage Products
          </Link>
          <Link to="/admin/products/new" className="btn-primary text-xs py-2">
            <FiPlus className="inline mr-1" size={14} /> Add Product
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 skeleton rounded-sm" />
          ))}
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {statCards.map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-sm border border-brand-100 p-5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`${s.color} w-10 h-10 rounded-sm flex items-center justify-center text-white`}
                  >
                    <s.icon size={18} />
                  </div>
                  <div>
                    <p className="font-display text-wine-800 text-xl font-semibold">
                      {s.value.toLocaleString()}
                    </p>
                    <p className="font-sans text-wine-500 text-xs uppercase tracking-wide">
                      {s.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts + Stock Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Products by Views */}
            <div className="bg-white rounded-sm border border-brand-100 p-6 shadow-sm lg:col-span-1">
              <h3 className="font-display text-wine-800 text-base font-medium mb-4">
                Top Products by Views
              </h3>
              {productViews.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={productViews}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#faebd7" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#6f1a36' }}
                      angle={-20}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#6f1a36' }} />
                    <Tooltip
                      contentStyle={{
                        background: '#7c2d41',
                        border: 'none',
                        borderRadius: 2,
                        color: '#fdf6f0',
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="views" fill="#7c2d41" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-wine-400 font-sans text-sm">
                  No view data yet
                </div>
              )}
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-sm border border-brand-100 p-6 shadow-sm lg:col-span-1">
              <h3 className="font-display text-wine-800 text-base font-medium mb-4">
                Products by Category
              </h3>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name} (${value})`}
                      labelLine={false}
                    >
                      {categoryData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-wine-400 font-sans text-sm">
                  No products yet
                </div>
              )}
            </div>

            {/* Stock Alerts Panel */}
            <div className="bg-white rounded-sm border border-brand-100 p-6 shadow-sm lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-wine-800 text-base font-medium">Stock Alerts</h3>
                <Link to="/admin/inventory" className="text-xs font-sans text-wine-600 hover:text-wine-800 transition-colors">
                  View All →
                </Link>
              </div>
              {stockAlerts.alertList.length === 0 ? (
                <div className="h-[280px] flex flex-col items-center justify-center text-wine-400 font-sans text-sm gap-2">
                  <FiPackage size={28} className="text-green-400" />
                  All products well-stocked
                </div>
              ) : (
                <div className="space-y-3">
                  {stockAlerts.alertList.map((p) => (
                    <div key={p.id} className="flex items-center justify-between">
                      <span className="text-sm font-sans text-wine-800 truncate max-w-[160px]">{p.name}</span>
                      {p.stock === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-sans font-medium bg-red-100 text-red-700 rounded-full">
                          <FiXCircle size={9} /> Out of Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-sans font-medium bg-amber-100 text-amber-700 rounded-full">
                          <FiAlertTriangle size={9} /> {p.stock} left
                        </span>
                      )}
                    </div>
                  ))}
                  <Link
                    to="/admin/inventory"
                    className="block mt-4 text-center text-xs font-sans text-wine-600 hover:text-wine-800 border border-brand-200 rounded-sm py-2 transition-colors"
                  >
                    Manage Inventory →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
