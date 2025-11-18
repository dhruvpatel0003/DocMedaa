import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CustomTextField from '../components/CustomTextField';
import Logo from '../components/Logo';
import { AppConstants } from '../constants/AppConstants';
import { showSnackBar, validateEmail } from '../utils/helpers';
import ApiService from '../services/ApiService';
import '../styles/ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleChange = (value) => {
    setEmail(value);
    if (error) {
      setError('');
    }
  };

  const validateInput = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return false;
    }
    return true;
  };

  const handleSendResetLink = async (e) => {
    e.preventDefault();

    if (!validateInput()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await ApiService.forgotPassword(email);

      if (response.success) {
        showSnackBar('Password reset link sent to your email!');
        setEmailSent(true);
        setTimeout(() => {
          navigate(AppConstants.routes.login);
        }, 2000);
      } else {
        showSnackBar(response.data?.message || 'Failed to send reset link');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      showSnackBar('Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="forgot-password-page">
        <div className="forgot-password-container">
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Check Your Email</h2>
            <p>We've sent a password reset link to <strong>{email}</strong></p>
            <p className="info-text">Click the link in the email to reset your password. If you don't see the email, check your spam folder.</p>
            <Link to={AppConstants.routes.login} className="btn btn-primary">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-header">
          <Logo size="medium" showText={true} />
          <h1>Reset Password</h1>
          <p>Enter your registered email to receive a reset link</p>
        </div>

        <form onSubmit={handleSendResetLink} className="forgot-password-form">
          <div className="form-info">
            <p>Enter your registered email address and we'll send you a link to reset your password.</p>
          </div>

          <CustomTextField
            hint="Email Address"
            value={email}
            onChange={handleChange}
            type="email"
            error={error}
            required
          />

          <button
            type="submit"
            className="btn btn-primary forgot-password-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Sending Link...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="forgot-password-footer">
          <p>
            Remember your password?{' '}
            <Link to={AppConstants.routes.login} className="link">
              Login
            </Link>
          </p>
          <p>
            Don't have an account?{' '}
            <Link to={AppConstants.routes.signup} className="link">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
