import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CustomTextField from '../components/CustomTextField';
import Logo from '../components/Logo';
import { AppConstants } from '../constants/AppConstants';
import { showSnackBar, validatePassword } from '../utils/helpers';
import ApiService from '../services/ApiService';
import '../styles/ResetPasswordPage.css';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    // Verify token on component mount
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        setIsVerifying(false);
        showSnackBar('Invalid or missing reset token');
        return;
      }

      try {
        const response = await ApiService.verifyResetToken(token);

        if (response.success) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          showSnackBar(response.data?.message || 'Invalid or expired token');
        }
      } catch (err) {
        console.error('Token verification error:', err);
        setTokenValid(false);
        showSnackBar('Failed to verify token');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = `Password must be at least ${AppConstants.passwordMinLength} characters`;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await ApiService.resetPasswordWithToken(token, formData.password);

      if (response.success) {
        showSnackBar('Password reset successfully!');
        setResetSuccess(true);
        setTimeout(() => {
          navigate(AppConstants.routes.login);
        }, 2000);
      } else {
        showSnackBar(response.data?.message || 'Failed to reset password');
        if (response.statusCode === 400 || response.statusCode === 401) {
          setTokenValid(false);
        }
      }
    } catch (err) {
      console.error('Reset password error:', err);
      showSnackBar('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <h2>Verifying Reset Link</h2>
            <p>Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="error-message">
            <div className="error-icon">⚠</div>
            <h2>Invalid Reset Link</h2>
            <p>The password reset link is invalid or has expired.</p>
            <p className="info-text">Please request a new password reset link.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate(AppConstants.routes.forgotPassword)}
            >
              Request New Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Password Reset Successful</h2>
            <p>Your password has been successfully reset.</p>
            <p className="info-text">You can now login with your new password.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate(AppConstants.routes.login)}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-header">
          <Logo size="medium" showText={true} />
          <h1>Reset Password</h1>
          <p>Create a new password for your account</p>
        </div>

        <form onSubmit={handleResetPassword} className="reset-password-form">
          <div className="form-info">
            <p>Enter a new password for your account. Make sure it's strong and secure.</p>
          </div>

          <CustomTextField
            hint="New Password"
            value={formData.password}
            onChange={(value) => handleChange('password', value)}
            type="password"
            error={errors.password}
            required
          />

          <CustomTextField
            hint="Confirm Password"
            value={formData.confirmPassword}
            onChange={(value) => handleChange('confirmPassword', value)}
            type="password"
            error={errors.confirmPassword}
            required
          />

          <div className="password-requirements">
            <p className="requirements-title">Password Requirements:</p>
            <ul>
              <li>At least {AppConstants.passwordMinLength} characters long</li>
              <li>Mix of uppercase and lowercase letters</li>
              <li>Include numbers and special characters</li>
            </ul>
          </div>

          <button
            type="submit"
            className="btn btn-primary reset-password-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
