import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../lib/api';
import Button from '../components/Button';

export default function Login() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        if (!formData.username || !formData.password) {
          setError('Username and password are required');
          setLoading(false);
          return;
        }

        await api.login({
          username: formData.username,
          password: formData.password,
        });

        // Redirect to dashboard on successful login
        router.push('/dashboard');
      } else {
        // Register
        if (!formData.username || !formData.email || !formData.password || !formData.name) {
          setError('All fields are required');
          setLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        if (formData.username.length < 3) {
          setError('Username must be at least 3 characters');
          setLoading(false);
          return;
        }

        await api.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });

        // Redirect to dashboard on successful registration
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      username: '',
      email: '',
      password: '',
      name: '',
      confirmPassword: '',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-blue-600">P</span>
              <span className="text-gray-800">enny</span>
              <span className="text-blue-600">P</span>
              <span className="text-indigo-600">als</span>
            </h1>
            <p className="text-gray-600">
              {isLogin ? 'Welcome back!' : 'Join our community'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={toggleMode}
                disabled={loading}
                className="text-blue-600 hover:text-blue-700 font-semibold transition disabled:opacity-50"
              >
                {isLogin ? 'Sign up' : 'Login'}
              </button>
            </p>
          </div>

          {/* Demo Info */}
          {isLogin && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs font-semibold text-blue-900 mb-2">Demo Credentials:</p>
              <div className="text-xs text-blue-800 space-y-1">
                <p><strong>Username:</strong> john | <strong>Password:</strong> password123</p>
                <p><strong>Username:</strong> alex | <strong>Password:</strong> password123</p>
                <p><strong>Username:</strong> sam | <strong>Password:</strong> password123</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
