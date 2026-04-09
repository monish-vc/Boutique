import React from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { getImageUrl } from '../lib/supabase';
import { getWhatsAppLink } from '../lib/constants';
import useCartStore from '../context/cartStore';

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();

  const handleCheckout = () => {
    const lines = items.map(
      (item) =>
        `• ${item.product.name} (${item.size}) x${item.quantity} - ₹${(
          item.product.price * item.quantity
        ).toLocaleString('en-IN')}`
    );
    const msg = `Hi, I would like to order:\n\n${lines.join('\n')}\n\nTotal: ₹${getTotal().toLocaleString('en-IN')}`;
    // Track whatsapp clicks
    items.forEach((item) => {
      useCartStore.getState().trackEvent(item.product.id, 'whatsapp_click');
    });
    window.open(getWhatsAppLink(msg), '_blank');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <FiShoppingBag className="mx-auto text-wine-300 mb-4" size={48} />
        <h2 className="font-display text-wine-800 text-2xl font-semibold mb-2">
          Your cart is empty
        </h2>
        <p className="font-sans text-wine-500 text-sm mb-6">
          Start shopping to add items to your cart
        </p>
        <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
          <FiArrowLeft size={14} /> Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="font-display text-wine-800 text-3xl font-semibold mb-8">
        Shopping Cart
      </h1>

      <div className="space-y-4">
        {items.map((item) => {
          const imageUrl = getImageUrl(item.product.image_url);
          return (
            <div
              key={`${item.product.id}-${item.size}`}
              className="bg-white rounded-sm border border-brand-100 p-4 flex gap-4"
            >
              {/* Image */}
              <div className="w-20 h-24 sm:w-24 sm:h-28 bg-cream-200 rounded-sm overflow-hidden shrink-0">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-wine-300 text-xs">
                    No Image
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-wine-800 text-base font-medium truncate">
                  {item.product.name}
                </h3>
                <p className="text-xs font-sans text-wine-500 mt-0.5">
                  Size: {item.size}
                </p>
                <p className="font-sans text-wine-800 font-medium mt-1">
                  ₹{Number(item.product.price).toLocaleString('en-IN')}
                </p>

                {/* Quantity */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.product.id,
                        item.size,
                        item.quantity - 1
                      )
                    }
                    className="w-8 h-8 border border-brand-200 rounded-sm flex items-center justify-center text-wine-600 hover:bg-cream-200 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <FiMinus size={14} />
                  </button>
                  <span className="font-sans text-sm font-medium text-wine-800 w-8 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.product.id,
                        item.size,
                        item.quantity + 1
                      )
                    }
                    className="w-8 h-8 border border-brand-200 rounded-sm flex items-center justify-center text-wine-600 hover:bg-cream-200 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <FiPlus size={14} />
                  </button>
                </div>
              </div>

              {/* Right: subtotal & remove */}
              <div className="text-right flex flex-col justify-between">
                <p className="font-display text-wine-800 font-medium">
                  ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                </p>
                <button
                  onClick={() => removeItem(item.product.id, item.size)}
                  className="text-wine-400 hover:text-red-600 transition-colors self-end"
                  aria-label="Remove item"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-8 bg-white rounded-sm border border-brand-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-sans text-wine-600 text-sm uppercase tracking-wide">
            Total
          </span>
          <span className="font-display text-wine-800 text-2xl font-semibold">
            ₹{getTotal().toLocaleString('en-IN')}
          </span>
        </div>
        <button
          onClick={handleCheckout}
          className="w-full bg-green-600 text-white px-6 py-4 rounded-sm font-sans font-medium hover:bg-green-700 transition-all tracking-wide uppercase text-sm flex items-center justify-center gap-2"
        >
          <FaWhatsapp size={20} /> Order via WhatsApp
        </button>
        <div className="flex items-center justify-between mt-4">
          <Link
            to="/shop"
            className="text-xs font-sans text-wine-600 hover:text-wine-800 flex items-center gap-1 transition-colors"
          >
            <FiArrowLeft size={12} /> Continue Shopping
          </Link>
          <button
            onClick={clearCart}
            className="text-xs font-sans text-wine-400 hover:text-red-600 transition-colors"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}
