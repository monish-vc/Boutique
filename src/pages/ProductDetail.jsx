import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { supabase, getImageUrl } from '../lib/supabase';
import { getWhatsAppLink } from '../lib/constants';
import useCartStore from '../context/cartStore';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const addItem = useCartStore((s) => s.addItem);
  const trackEvent = useCartStore((s) => s.trackEvent);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        setProduct(data);
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
        }
        // Track view
        trackEvent(data.id, 'view');

        // Fetch similar products (same category, exclude current)
        const { data: similar } = await supabase
          .from('products')
          .select('*')
          .eq('category', data.category)
          .neq('id', id)
          .limit(4);
        setSimilarProducts(similar || []);
      } catch (err) {
        console.error('Product fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
    // Scroll to top when product changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, trackEvent]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, selectedSize || 'Free Size');
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    trackEvent(product.id, 'whatsapp_click');
    const colorInfo = selectedColor ? ` | Color: ${selectedColor.name}` : '';
    const msg = `Hi, I want to order ${product.name} (${selectedSize || 'Free Size'}${colorInfo}) - &#x20b9;${product.price}`;
    window.open(getWhatsAppLink(msg), '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="aspect-[3/4] skeleton rounded-sm" />
          <div className="space-y-4 py-4">
            <div className="h-6 skeleton rounded w-1/3" />
            <div className="h-8 skeleton rounded w-2/3" />
            <div className="h-6 skeleton rounded w-1/4" />
            <div className="h-20 skeleton rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h2 className="font-display text-wine-800 text-2xl mb-2">Product Not Found</h2>
        <Link to="/shop" className="btn-outline inline-flex items-center gap-2 mt-4">
          <FiArrowLeft /> Back to Shop
        </Link>
      </div>
    );
  }

  const imageUrl = getImageUrl(product.image_url);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to="/shop"
        className="inline-flex items-center gap-1 text-sm font-sans text-wine-600 hover:text-wine-800 mb-6 transition-colors"
      >
        <FiArrowLeft size={14} /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="aspect-[3/4] bg-cream-200 rounded-sm overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-wine-300 font-display text-xl">
              No Image
            </div>
          )}
        </div>

        {/* Details */}
        <div className="py-2 lg:py-4">
          <span className="text-xs font-sans uppercase tracking-[0.2em] text-wine-500">
            {product.category}
          </span>
          <h1 className="font-display text-wine-800 text-2xl sm:text-3xl font-semibold mt-2 mb-3">
            {product.name}
          </h1>
          <p className="font-display text-wine-800 text-2xl font-medium mb-6">
            &#x20b9;{Number(product.price).toLocaleString('en-IN')}
          </p>

          {product.description && (
            <div className="mb-6">
              <h3 className="text-xs font-sans uppercase tracking-[0.2em] text-wine-500 mb-2">
                Description
              </h3>
              <p className="font-body text-wine-700 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-sans uppercase tracking-[0.2em] text-wine-500 mb-3">
                Colour
                {selectedColor && (
                  <span className="normal-case tracking-normal text-wine-700 font-medium ml-2">
                    — {selectedColor.name}
                  </span>
                )}
              </h3>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => setSelectedColor(color)}
                    title={color.name}
                    className={`relative w-8 h-8 rounded-full transition-all duration-200 ${
                      selectedColor?.hex === color.hex
                        ? 'ring-2 ring-offset-2 ring-wine-800 scale-110'
                        : 'ring-1 ring-black/10 hover:scale-110 hover:ring-wine-400'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    aria-label={`Select ${color.name}`}
                    aria-pressed={selectedColor?.hex === color.hex}
                  >
                    {selectedColor?.hex === color.hex && (
                      <span
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          color: isLightColor(color.hex) ? '#333' : '#fff',
                          fontSize: '13px',
                          fontWeight: 'bold',
                        }}
                      >
                        &#10003;
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-sans uppercase tracking-[0.2em] text-wine-500 mb-3">
                Size
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[44px] h-10 px-3 rounded-sm text-sm font-sans font-medium transition-all ${
                      selectedSize === size
                        ? 'bg-wine-800 text-cream-100 shadow-sm'
                        : 'bg-cream-200 text-wine-700 hover:bg-cream-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={handleAddToCart}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <FiShoppingBag size={16} /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-sm font-sans font-medium hover:bg-green-700 transition-all tracking-wide uppercase text-sm flex items-center justify-center gap-2"
            >
              <FaWhatsapp size={18} /> Buy Now
            </button>
          </div>

          <p className="text-xs font-sans text-wine-400 mt-3">
            &ldquo;Buy Now&rdquo; will redirect you to WhatsApp to complete your order.
          </p>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="mt-16 pt-10 border-t border-cream-300">
          <h2 className="font-display text-wine-800 text-2xl font-semibold mb-6">
            Similar Products
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper: determine if a hex color is "light" to pick contrasting text
function isLightColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // perceived luminance
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}
