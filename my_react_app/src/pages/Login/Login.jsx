import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserShield } from 'react-icons/fa';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Check if user was redirected after logout
  useEffect(() => {
    const fromLogout = location.state?.fromLogout || new URLSearchParams(location.search).get('logout');
    
    if (fromLogout) {
      setLogoutMessage('You have been successfully logged out.');
    }
  }, [location]);

  // ✅ FUNCTION 1: Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ✅ FUNCTION 2: Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ FUNCTION 3: Handle form submission with REAL API call (FIXED!)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    console.log('🚀 Form submitted');
    console.log('📝 Login Data:', formData);
    
    try {
      console.log('🔐 Attempting login for:', formData.email);
      console.log('📤 Request: POST /auth/login');
      
      // REAL API call to backend
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      console.log('✅ Login response:', data);
      
      // 🔍 DEBUGGING - Check response structure
      console.log('🔍 Type of data:', typeof data);
      console.log('🔍 data.token exists?', !!data.token);
      console.log('🔍 data.token:', data.token);
      console.log('🔍 data.token.access_token:', data.token?.access_token);
      console.log('🔍 data.data:', data.data);
      console.log('🔍 Full response structure:', JSON.stringify(data, null, 2));
      
      // ✅ FIXED: Save token to localStorage (correct path!)
      if (data.token && data.token.access_token) {
        console.log('✅ Condition passed! Saving token...');
        
        // Save to localStorage
        localStorage.setItem('token', data.token.access_token);
        localStorage.setItem('user', JSON.stringify(data.data));
        
        console.log('💾 Token saved to localStorage');
        console.log('👤 User data:', data.data);
        
        // Verify localStorage
        console.log('🔍 Verify - Token in localStorage:', localStorage.getItem('token'));
        console.log('🔍 Verify - User in localStorage:', localStorage.getItem('user'));
        
        // Redirect to dashboard
        console.log('🎉 Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        console.error('❌ Condition failed!');
        console.error('   data.token:', data.token);
        console.error('   data.token.access_token:', data.token?.access_token);
        throw new Error('Invalid response format - no token received');
      }
      
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Error details:', error.message);
      setErrors({ 
        email: error.message || 'Invalid email or password' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <div className="branding-content">
            <div className="brand-logo">
              <FaUserShield />
            </div>
            <h1>Welcome Back</h1>
            <p>Sign in to access your NIC Asia Bank dashboard and manage your banking operations efficiently.</p>
            
            <div className="features-list">
              <div className="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Secure & Encrypted</span>
              </div>
              <div className="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>24/7 Access</span>
              </div>
              <div className="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Real-time Updates</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="auth-form-container">
          <div className="auth-form-wrapper">
            <div className="auth-header">
              <h2>Sign In</h2>
              <p>Enter your credentials to access your account</p>
              
              {/* Logout success message */}
              {logoutMessage && (
                <div className="success-message">
                  {logoutMessage}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Email Input */}
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className={`input-wrapper ${errors.email ? 'error' : ''}`}>
                  <span className="input-icon">
                    <FaEnvelope />
                  </span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                  />
                </div>
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              {/* Password Input */}
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className={`input-wrapper ${errors.password ? 'error' : ''}`}>
                  <span className="input-icon">
                    <FaLock />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'error' : ''}
                  />
                  <span 
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                  />
                  <span className="checkbox-custom"></span>
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className={`auth-btn ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Signing In...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="auth-footer">
              <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}