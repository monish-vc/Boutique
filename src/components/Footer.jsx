import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { CONTACT } from '../lib/constants';

export default function Footer() {
  return (
    <footer className="bg-wine-900 text-cream-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src="/logo.png"
                alt="Sri Sri Boutique"
                className="w-11 h-11 object-cover rounded-full"
              />
              <div>
                <h3 className="font-display text-cream-100 text-lg leading-none font-semibold">
                  Sri Sri
                </h3>
                <p className="text-[10px] uppercase tracking-[0.25em] text-wine-300 font-sans">
                  Boutique
                </p>
              </div>
            </div>
            <p className="text-sm text-wine-300 font-sans leading-relaxed">
              Your destination for premium traditional wear. Handpicked sarees, chudidars,
              and more with elegance in every thread.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-cream-100 text-base mb-4">Quick Links</h4>
            <nav className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/shop', label: 'Shop' },
                { to: '/cart', label: 'Cart' },
                { to: '/login', label: 'My Account' },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="block text-sm font-sans text-wine-300 hover:text-cream-100 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-cream-100 text-base mb-4">Contact</h4>
            <div className="space-y-3 text-sm font-sans text-wine-300">
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-start gap-2 hover:text-cream-100 transition-colors"
              >
                <FiMail className="mt-0.5 shrink-0" size={14} />
                {CONTACT.email}
              </a>
              <a
                href={`tel:+91${CONTACT.phone}`}
                className="flex items-start gap-2 hover:text-cream-100 transition-colors"
              >
                <FiPhone className="mt-0.5 shrink-0" size={14} />
                +91 {CONTACT.phone}
              </a>
              <div className="flex items-start gap-2">
                <FiMapPin className="mt-0.5 shrink-0" size={14} />
                <address className="not-italic leading-relaxed">
                  {CONTACT.address.map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < CONTACT.address.length - 1 && <br />}
                    </span>
                  ))}
                </address>
              </div>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-display text-cream-100 text-base mb-4">Follow Us</h4>
            <div className="flex gap-3">
              <a
                href={CONTACT.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-wine-800 rounded-sm flex items-center justify-center text-wine-300 hover:text-cream-100 hover:bg-wine-700 transition-all"
                aria-label="Instagram"
              >
                <FiInstagram size={18} />
              </a>
              <a
                href={CONTACT.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-wine-800 rounded-sm flex items-center justify-center text-wine-300 hover:text-cream-100 hover:bg-wine-700 transition-all"
                aria-label="Facebook"
              >
                <FiFacebook size={18} />
              </a>
              <a
                href={CONTACT.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-wine-800 rounded-sm flex items-center justify-center text-wine-300 hover:text-cream-100 hover:bg-wine-700 transition-all"
                aria-label="YouTube"
              >
                <FiYoutube size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-wine-800 text-center">
          <p className="text-xs font-sans text-wine-400">
            &copy; {new Date().getFullYear()} Sri Sri Boutique. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
