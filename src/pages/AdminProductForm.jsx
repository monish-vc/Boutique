import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiUpload, FiX, FiCloud } from 'react-icons/fi';
import { supabase, getImageUrl } from '../lib/supabase';
import { uploadToCloudinary } from '../lib/cloudinary';
import { CATEGORIES, SIZES, COLOR_OPTIONS } from '../lib/constants';
import { sanitize, validateProduct } from '../lib/sanitize';
import toast from 'react-hot-toast';

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: CATEGORIES[0],
    sizes: [],
    colors: [],
    image_url: '',
    stock: '0',
    low_stock_threshold: '5',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      async function fetchProduct() {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();
          if (error) throw error;
          setForm({
            name: data.name || '',
            description: data.description || '',
            price: String(data.price || ''),
            category: data.category || CATEGORIES[0],
            sizes: data.sizes || [],
            colors: data.colors || [],
            image_url: data.image_url || '',
            stock: String(data.stock ?? 0),
            low_stock_threshold: String(data.low_stock_threshold ?? 5),
          });
          if (data.image_url) {
            setImagePreview(getImageUrl(data.image_url));
          }
        } catch (err) {
          toast.error('Failed to load product');
          console.error(err);
          navigate('/admin/products');
        } finally {
          setLoading(false);
        }
      }
      fetchProduct();
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const toggleSize = (size) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const toggleColor = (color) => {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.some((c) => c.hex === color.hex)
        ? prev.colors.filter((c) => c.hex !== color.hex)
        : [...prev.colors, color],
    }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file) => {
    // Uploads directly to Cloudinary and returns a full secure HTTPS URL
    return uploadToCloudinary(file, { folder: 'boutique/products' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanForm = {
      name: sanitize(form.name).trim(),
      description: sanitize(form.description).trim(),
      price: form.price,
      category: form.category,
      sizes: form.sizes,
      colors: form.colors,
    };

    const { valid, errors: validationErrors } = validateProduct(cleanForm);
    if (!valid) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      let imagePath = form.image_url;

      // Upload new image if selected
      if (imageFile) {
        imagePath = await uploadImage(imageFile);
      }

      const productData = {
        name: cleanForm.name,
        description: cleanForm.description,
        price: parseFloat(cleanForm.price),
        category: cleanForm.category,
        sizes: cleanForm.sizes,
        colors: cleanForm.colors,
        image_url: imagePath,
        stock: parseInt(form.stock, 10) || 0,
        low_stock_threshold: parseInt(form.low_stock_threshold, 10) || 5,
      };

      if (isEdit) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id);
        if (error) throw error;
        toast.success('Product updated!');
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);
        if (error) throw error;
        toast.success('Product created!');
      }

      navigate('/admin/products');
    } catch (err) {
      toast.error(err.message || 'Failed to save product');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 skeleton rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-1 text-sm font-sans text-wine-600 hover:text-wine-800 mb-6 transition-colors"
      >
        <FiArrowLeft size={14} /> Back to Products
      </Link>

      <h1 className="font-display text-wine-800 text-3xl font-semibold mb-8">
        {isEdit ? 'Edit Product' : 'Add Product'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Name */}
        <div>
          <label className="block text-xs font-sans font-medium text-wine-700 uppercase tracking-wide mb-1.5">
            Product Name *
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className={`input-field ${errors.name ? 'border-red-400' : ''}`}
            placeholder="e.g. Kanchipuram Silk Saree"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1 font-sans">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-sans font-medium text-wine-700 uppercase tracking-wide mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="input-field resize-none"
            placeholder="Describe the product..."
          />
        </div>

        {/* Price & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-sans font-medium text-wine-700 uppercase tracking-wide mb-1.5">
              Price (₹) *
            </label>
            <input
              name="price"
              type="number"
              min="1"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              className={`input-field ${errors.price ? 'border-red-400' : ''}`}
              placeholder="1500"
            />
            {errors.price && (
              <p className="text-red-500 text-xs mt-1 font-sans">{errors.price}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-sans font-medium text-wine-700 uppercase tracking-wide mb-1.5">
              Category *
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="input-field"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-xs mt-1 font-sans">{errors.category}</p>
            )}
          </div>
        </div>

        {/* Stock & Threshold */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-sans font-medium text-wine-700 uppercase tracking-wide mb-1.5">
              Stock Quantity *
            </label>
            <input
              name="stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={handleChange}
              className="input-field"
              placeholder="0"
            />
            <p className="text-xs font-sans text-wine-400 mt-1">Number of units available</p>
          </div>
          <div>
            <label className="block text-xs font-sans font-medium text-wine-700 uppercase tracking-wide mb-1.5">
              Low Stock Alert At
            </label>
            <input
              name="low_stock_threshold"
              type="number"
              min="1"
              step="1"
              value={form.low_stock_threshold}
              onChange={handleChange}
              className="input-field"
              placeholder="5"
            />
            <p className="text-xs font-sans text-wine-400 mt-1">Alert when stock falls below this</p>
          </div>
        </div>

        {/* Sizes */}
        <div>
          <label className="block text-xs font-sans font-medium text-wine-700 uppercase tracking-wide mb-2">
            Available Sizes
          </label>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`min-w-[44px] h-9 px-3 rounded-sm text-xs font-sans font-medium transition-all ${
                  form.sizes.includes(size)
                    ? 'bg-wine-800 text-cream-100'
                    : 'bg-cream-200 text-wine-700 hover:bg-cream-300'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div>
          <label className="block text-xs font-sans font-medium text-wine-700 uppercase tracking-wide mb-2">
            Available Colors
          </label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((color) => {
              const isSelected = form.colors.some((c) => c.hex === color.hex);
              return (
                <button
                  key={color.hex}
                  type="button"
                  title={color.name}
                  onClick={() => toggleColor(color)}
                  className={`relative w-8 h-8 rounded-full border-2 transition-all ${
                    isSelected
                      ? 'border-wine-800 scale-110 shadow-md'
                      : 'border-transparent hover:border-wine-400 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hex }}
                >
                  {isSelected && (
                    <span
                      className="absolute inset-0 flex items-center justify-center text-white"
                      style={{ textShadow: '0 0 2px rgba(0,0,0,0.8)', fontSize: '12px' }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {form.colors.length > 0 && (
            <p className="text-xs font-sans text-wine-500 mt-2">
              Selected: {form.colors.map((c) => c.name).join(', ')}
            </p>
          )}
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-xs font-sans font-medium text-wine-700 uppercase tracking-wide mb-2">
            Product Image
          </label>
          {imagePreview ? (
            <div className="relative w-40 h-48 rounded-sm overflow-hidden mb-3">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview('');
                  setForm((prev) => ({ ...prev, image_url: '' }));
                }}
                className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center"
              >
                <FiX size={12} />
              </button>
            </div>
          ) : null}
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-cream-200 text-wine-700 rounded-sm cursor-pointer hover:bg-cream-300 transition-colors text-sm font-sans">
            <FiUpload size={14} /> Choose Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="hidden"
            />
          </label>
          <p className="text-xs font-sans text-wine-400 mt-1">Max 10MB · JPG/PNG/WEBP · Hosted on Cloudinary</p>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-cream-100 border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : isEdit ? (
              'Update Product'
            ) : (
              'Create Product'
            )}
          </button>
          <Link to="/admin/products" className="btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
