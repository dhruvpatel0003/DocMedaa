import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CustomTextField from '../components/CustomTextField';
import Logo from '../components/Logo';
import { AppConstants } from '../constants/AppConstants';
import { showSnackBar, validateEmail, validatePassword } from '../utils/helpers';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = `Password must be at least ${AppConstants.passwordMinLength} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      showSnackBar(AppConstants.loginSuccess);
      
      navigate(AppConstants.routes.dashboard);
    } else {
      showSnackBar(result.error || AppConstants.loginFailure);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <Logo size="medium" showText={true} />
          <h1>Welcome Back</h1>
          <p>Login to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <CustomTextField
            hint="Email Address"
            value={formData.email}
            onChange={(value) => handleChange('email', value)}
            type="email"
            error={errors.email}
            required
          />

          <CustomTextField
            hint="Password"
            value={formData.password}
            onChange={(value) => handleChange('password', value)}
            type="password"
            error={errors.password}
            required
          />

          <button 
            type="submit" 
            className="btn btn-primary login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          <div className="login-links">
            <Link to={AppConstants.routes.forgotPassword} className="link">
              Forgot Password?
            </Link>
          </div>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <Link to={AppConstants.routes.signup}>Sign up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;