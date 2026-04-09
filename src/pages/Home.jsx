import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiStar } from 'react-icons/fi';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { CATEGORIES } from '../lib/constants';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const { data } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(8);
        setFeatured(data || []);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-wine-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.05) 35px, rgba(255,255,255,0.05) 70px)`,
            }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-32 relative">
          <div className="max-w-2xl">
            <p className="text-wine-300 font-sans text-xs uppercase tracking-[0.3em] mb-4 animate-fade-in-up">
              Premium Traditional Wear
            </p>
            <h1
              className="font-display text-cream-100 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6 animate-fade-in-up"
              style={{ animationDelay: '0.1s' }}
            >
              Elegance in{' '}
              <span className="italic text-wine-300">Every Thread</span>
            </h1>
            <p
              className="font-body text-wine-200 text-lg sm:text-xl leading-relaxed mb-8 animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              Discover our curated collection of handpicked sarees, chudidars, and
              traditional attire crafted for the modern woman.
            </p>
            <div
              className="flex flex-wrap gap-4 animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <Link to="/shop" className="btn-primary flex items-center gap-2">
                Shop Now <FiArrowRight />
              </Link>
              <a
                href="https://wa.me/919442270086?text=Hi%2C%20I%20am%20interested%20in%20your%20products!"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline border-cream-300 text-cream-300 hover:bg-cream-300 hover:text-wine-900"
              >
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-12">
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-wine-500 mb-2">
            Browse by
          </p>
          <h2 className="font-display text-wine-800 text-3xl sm:text-4xl font-semibold">
            Categories
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/shop?category=${encodeURIComponent(cat)}`}
              className="group relative bg-white rounded-sm p-6 text-center shadow-sm hover:shadow-md transition-all border border-brand-100 hover:border-wine-300"
            >
              <div className="w-12 h-12 mx-auto mb-3 bg-wine-50 rounded-full flex items-center justify-center group-hover:bg-wine-100 transition-colors">
                <FiStar className="text-wine-600" size={20} />
              </div>
              <h3 className="font-display text-wine-800 text-sm font-medium">
                {cat}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="font-sans text-xs uppercase tracking-[0.3em] text-wine-500 mb-2">
                Our Collection
              </p>
              <h2 className="font-display text-wine-800 text-3xl sm:text-4xl font-semibold">
                Latest Arrivals
              </h2>
            </div>
            <Link
              to="/shop"
              className="hidden sm:flex items-center gap-2 text-sm font-sans font-medium text-wine-800 hover:text-wine-600 uppercase tracking-wide transition-colors"
            >
              View All <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card-product">
                  <div className="aspect-[3/4] skeleton" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 skeleton rounded w-3/4" />
                    <div className="h-3 skeleton rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="font-body text-wine-500 text-lg">
                No products yet. Check back soon!
              </p>
            </div>
          )}

          <div className="sm:hidden text-center mt-8">
            <Link to="/shop" className="btn-outline inline-flex items-center gap-2">
              View All Products <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* About strip */}
      <section className="bg-cream-200/50 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-wine-800 text-2xl sm:text-3xl font-semibold mb-4">
            Rooted in Tradition, Styled for Today
          </h2>
          <p className="font-body text-wine-600 text-base sm:text-lg leading-relaxed mb-6">
            At Sri Sri Boutique, we believe in celebrating the timeless beauty of
            traditional Indian wear. Based in Pollachi, we bring you the finest
            handpicked sarees and ethnic wear with a touch of modern elegance.
          </p>
          <a
            href="https://wa.me/919442270086?text=Hi%2C%20I%20would%20like%20to%20know%20more%20about%20Sri%20Sri%20Boutique"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-block"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </div>
  );
}
