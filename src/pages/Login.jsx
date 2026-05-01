import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';
import { validateEmail, sanitize } from '../lib/sanitize';
import toast from 'react-hot-toast';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [emailExists, setEmailExists] = useState(false);
  const { signIn, signUp, user } = useAuthStore();
  const navigate = useNavigate();

  // If already logged in, redirect
  if (user) {
    navigate('/');
    return null;
  }

  const validate = () => {
    const errs = {};
    const cleanEmail = sanitize(email).trim();
    if (!cleanEmail) {
      errs.email = 'Email is required';
    } else if (!validateEmail(cleanEmail)) {
      errs.email = 'Invalid email format';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailExists(false);
    if (!validate()) return;

    setLoading(true);
    try {
      const cleanEmail = sanitize(email).trim();
      if (isSignUp) {
        await signUp(cleanEmail, password);
        toast.success('Account created! Check your email to verify.');
      } else {
        await signIn(cleanEmail, password);
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (err) {
      const msg = err.message || '';
      // Supabase returns this message when the email is already registered
      if (
        isSignUp &&
        (msg.toLowerCase().includes('user already registered') ||
          msg.toLowerCase().includes('already been registered') ||
          msg.toLowerCase().includes('email already exists') ||
          err.status === 422)
      ) {
        setEmailExists(true);
      } else {
        toast.error(msg || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchToSignIn = () => {
    setIsSignUp(false);
    setEmailExists(false);
    setErrors({});
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-wine-800 text-3xl font-semibold">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="font-sans text-wine-500 text-sm mt-2">
            {isSignUp
              ? 'Join Sri Sri Boutique'
              : 'Sign in to your account'}
          </p>
        </div>

        {emailExists && (
          <div className="mb-4 flex items-start gap-3 rounded-sm border border-amber-200 bg-amber-50 px-4 py-3">
            <span className="mt-0.5 text-amber-500 text-lg leading-none">⚠️</span>
            <div className="flex-1 font-sans text-sm text-amber-800">
              <p className="font-semibold">An account with this email already exists.</p>
              <p className="mt-0.5">
                Would you like to{' '}
                <button
                  type="button"
                  onClick={switchToSignIn}
                  className="font-semibold underline underline-offset-2 hover:text-amber-900"
                >
                  Sign In instead?
                </button>
              </p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-sm border border-brand-100 p-6 sm:p-8 shadow-sm"
          noValidate
        >
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-xs font-sans font-medium text-wine-700 uppercase tracking-wide mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`input-field ${errors.email ? 'border-red-400' : ''}`}
              placeholder="your@email.com"
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 font-sans">{errors.email}</p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-xs font-sans font-medium text-wine-700 uppercase tracking-wide mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`input-field ${errors.password ? 'border-red-400' : ''}`}
              placeholder="••••••••"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 font-sans">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-cream-100 border-t-transparent rounded-full animate-spin" />
            ) : isSignUp ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center mt-6 font-sans text-sm text-wine-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrors({});
            }}
            className="text-wine-800 font-medium hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}
