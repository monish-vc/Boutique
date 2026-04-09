import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-display text-wine-300 text-8xl font-bold mb-4">404</h1>
        <h2 className="font-display text-wine-800 text-2xl font-semibold mb-2">
          Page Not Found
        </h2>
        <p className="font-sans text-wine-500 text-sm mb-6">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <FiArrowLeft size={14} /> Go Home
        </Link>
      </div>
    </div>
  );
}
