import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiMenu, FiX, FiUser, FiLogOut, FiGrid } from 'react-icons/fi';
import useAuthStore from '../context/authStore';
import useCartStore from '../context/cartStore';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuthStore();
  const cartCount = useCartStore((s) => s.getCount());
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out');
      navigate('/');
    } catch {
      toast.error('Sign out failed');
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
  ];

  return (
    <header className="bg-cream-50/90 backdrop-blur-md sticky top-0 z-50 border-b border-brand-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="Sri Sri Boutique"
              className="w-11 h-11 object-cover rounded-full"
            />
            <div className="hidden sm:block">
              <h1 className="font-display text-wine-800 text-lg leading-none font-semibold tracking-wide">
                Sri Sri
              </h1>
              <p className="text-[10px] uppercase tracking-[0.25em] text-wine-600 font-sans">
                Boutique
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm font-sans font-medium text-wine-800 hover:text-wine-600 tracking-wide uppercase transition-colors"
              >
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="text-sm font-sans font-medium text-gold-500 hover:text-gold-600 tracking-wide uppercase transition-colors flex items-center gap-1"
              >
                <FiGrid size={14} /> Admin
              </Link>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link to="/cart" className="relative p-2 text-wine-800 hover:text-wine-600 transition-colors">
              <FiShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-wine-800 text-cream-100 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <button
                onClick={handleSignOut}
                className="hidden md:flex items-center gap-1 text-sm font-sans text-wine-800 hover:text-wine-600 transition-colors"
              >
                <FiLogOut size={16} /> Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center gap-1 text-sm font-sans text-wine-800 hover:text-wine-600 transition-colors"
              >
                <FiUser size={16} /> Login
              </Link>
            )}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 text-wine-800"
              aria-label="Toggle menu"
            >
              {open ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-brand-200/50 bg-cream-50">
          <nav className="px-4 py-4 space-y-3">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="block text-sm font-sans font-medium text-wine-800 tracking-wide uppercase"
              >
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="block text-sm font-sans font-medium text-gold-500 tracking-wide uppercase"
              >
                Admin Dashboard
              </Link>
            )}
            {user ? (
              <button
                onClick={() => { handleSignOut(); setOpen(false); }}
                className="block text-sm font-sans text-wine-800 tracking-wide uppercase"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="block text-sm font-sans text-wine-800 tracking-wide uppercase"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
