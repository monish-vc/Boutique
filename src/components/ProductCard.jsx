import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiEye } from 'react-icons/fi';
import { getImageUrl } from '../lib/supabase';
import useCartStore from '../context/cartStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hoveredColor, setHoveredColor] = useState(null);
  const addItem = useCartStore((s) => s.addItem);
  const trackEvent = useCartStore((s) => s.trackEvent);
  const imageUrl = getImageUrl(product.image_url);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleView = () => {
    trackEvent(product.id, 'view');
  };

  return (
    <Link
      to={`/product/${product.id}`}
      onClick={handleView}
      className="card-product group block"
    >
      <div className="relative aspect-[3/4] bg-cream-200 overflow-hidden">
        {!imgLoaded && (
          <div className="absolute inset-0 skeleton" />
        )}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImgLoaded(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-wine-300">
            <FiEye size={32} />
          </div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-wine-900/0 group-hover:bg-wine-900/20 transition-colors duration-300" />
        <button
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 w-10 h-10 bg-wine-800 text-cream-100 rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-wine-700"
          aria-label="Add to cart"
        >
          <FiShoppingBag size={16} />
        </button>
        {/* Category badge */}
        <span className="absolute top-3 left-3 bg-cream-50/90 backdrop-blur-sm text-wine-800 text-[10px] font-sans font-medium uppercase tracking-wider px-2 py-1 rounded-sm">
          {product.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-display text-wine-800 text-base font-medium leading-snug line-clamp-1">
          {product.name}
        </h3>
        <p className="font-sans text-wine-600 text-sm mt-1">
          &#x20b9;{Number(product.price).toLocaleString('en-IN')}
        </p>

        {/* Color swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="mt-2.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {product.colors.slice(0, 7).map((color) => (
                <span
                  key={color.hex}
                  title={color.name}
                  onMouseEnter={(e) => { e.preventDefault(); setHoveredColor(color.name); }}
                  onMouseLeave={() => setHoveredColor(null)}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  className="w-4 h-4 rounded-full border border-black/10 inline-block flex-shrink-0 cursor-default hover:scale-125 transition-transform duration-150"
                  style={{ backgroundColor: color.hex }}
                />
              ))}
              {product.colors.length > 7 && (
                <span className="text-[10px] font-sans text-wine-400 leading-none">
                  +{product.colors.length - 7}
                </span>
              )}
            </div>
            <p className={`text-[10px] font-sans text-wine-400 mt-1 h-3 transition-opacity duration-150 ${hoveredColor ? 'opacity-100' : 'opacity-0'}`}>
              {hoveredColor || '\u00a0'}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
