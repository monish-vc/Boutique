import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import { supabase } from '../lib/supabase';
import { CATEGORIES, SIZES, SORT_OPTIONS } from '../lib/constants';
import ProductCard from '../components/ProductCard';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const selectedCategory = searchParams.get('category') || '';
  const selectedSize = searchParams.get('size') || '';
  const sortBy = searchParams.get('sort') || 'newest';
  const search = searchParams.get('q') || '';

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        let query = supabase.from('products').select('*');
        if (selectedCategory) {
          query = query.eq('category', selectedCategory);
        }
        const { data, error } = await query;
        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [selectedCategory]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Size filter
    if (selectedSize) {
      result = result.filter(
        (p) => p.sizes && p.sizes.includes(selectedSize)
      );
    }

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
    }

    return result;
  }, [products, selectedSize, sortBy, search]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters = selectedCategory || selectedSize || search;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-wine-800 text-3xl sm:text-4xl font-semibold">
          {selectedCategory || 'All Products'}
        </h1>
        <p className="font-sans text-wine-500 text-sm mt-1">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => updateFilter('q', e.target.value)}
          className="input-field max-w-xs text-sm"
        />

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-outline flex items-center gap-2 py-2 text-xs"
        >
          <FiFilter size={14} /> Filters
          {hasFilters && (
            <span className="w-2 h-2 bg-wine-800 rounded-full" />
          )}
        </button>

        {/* Sort */}
        <div className="relative ml-auto">
          <select
            value={sortBy}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="input-field pr-8 text-xs appearance-none cursor-pointer min-w-[160px]"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <FiChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 text-wine-500 pointer-events-none"
            size={14}
          />
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white rounded-sm border border-brand-200 p-4 sm:p-6 mb-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-wine-800 text-base font-medium">
              Filters
            </h3>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-sans text-wine-600 hover:text-wine-800 flex items-center gap-1"
              >
                <FiX size={12} /> Clear All
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-xs font-sans font-medium text-wine-700 uppercase tracking-wide mb-2">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateFilter('category', '')}
                  className={`px-3 py-1.5 rounded-sm text-xs font-sans transition-colors ${
                    !selectedCategory
                      ? 'bg-wine-800 text-cream-100'
                      : 'bg-cream-200 text-wine-700 hover:bg-cream-300'
                  }`}
                >
                  All
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() =>
                      updateFilter(
                        'category',
                        selectedCategory === cat ? '' : cat
                      )
                    }
                    className={`px-3 py-1.5 rounded-sm text-xs font-sans transition-colors ${
                      selectedCategory === cat
                        ? 'bg-wine-800 text-cream-100'
                        : 'bg-cream-200 text-wine-700 hover:bg-cream-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <label className="block text-xs font-sans font-medium text-wine-700 uppercase tracking-wide mb-2">
                Size
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateFilter('size', '')}
                  className={`px-3 py-1.5 rounded-sm text-xs font-sans transition-colors ${
                    !selectedSize
                      ? 'bg-wine-800 text-cream-100'
                      : 'bg-cream-200 text-wine-700 hover:bg-cream-300'
                  }`}
                >
                  All
                </button>
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() =>
                      updateFilter('size', selectedSize === size ? '' : size)
                    }
                    className={`px-3 py-1.5 rounded-sm text-xs font-sans transition-colors ${
                      selectedSize === size
                        ? 'bg-wine-800 text-cream-100'
                        : 'bg-cream-200 text-wine-700 hover:bg-cream-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card-product">
              <div className="aspect-[3/4] skeleton" />
              <div className="p-4 space-y-2">
                <div className="h-4 skeleton rounded w-3/4" />
                <div className="h-3 skeleton rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="font-display text-wine-500 text-xl mb-2">
            No products found
          </p>
          <p className="font-sans text-wine-400 text-sm mb-4">
            Try adjusting your filters or search query
          </p>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-outline text-xs">
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
