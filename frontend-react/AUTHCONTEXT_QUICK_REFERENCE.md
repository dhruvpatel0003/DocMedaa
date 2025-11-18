# AuthContext Quick Reference

## Using the useAuth Hook

```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { 
    user,                 // Current user object
    isAuthenticated,      // Boolean: is user logged in?
    isInitialized,        // Boolean: has auth finished initializing?
    isLoading,            // Boolean: is async operation in progress?
    error,                // Error message if any
    login,                // async (email, password) => { success, error }
    signup,               // async (userData) => { success, error }
    logout,               // () => void
    isDoctor,             // () => Boolean
    isPatient,            // () => Boolean
    isAdmin,              // () => Boolean
  } = useAuth();

  // Your component code...
}
```

## User Object Structure

```javascript
user = {
  id: string,           // User ID from database
  email: string,        // User email
  fullName: string,     // User's full name
  role: 'patient' | 'doctor' | 'admin',  // User role
  token: string,        // JWT token
  profileComplete: boolean,  // Has user completed profile?
}
```

## Common Patterns

### Login Flow
```javascript
const handleLogin = async (email, password) => {
  const result = await login(email, password);
  if (result.success) {
    navigate('/dashboard');
  } else {
    showError(result.error);
  }
};
```

### Signup Flow
```javascript
const handleSignup = async (userData) => {
  const result = await signup(userData);
  if (result.success) {
    navigate('/complete-profile');
  } else {
    showError(result.error);
  }
};
```

### Logout
```javascript
const handleLogout = () => {
  logout();
  navigate('/login');
};
```

### Role-Based Rendering
```javascript
const { user, isDoctor, isPatient } = useAuth();

return (
  <div>
    {isDoctor() && <DoctorDashboard />}
    {isPatient() && <PatientDashboard />}
  </div>
);
```

### Protected Component
```javascript
const MyProtectedComponent = () => {
  const { isAuthenticated, isInitialized, isLoading } = useAuth();

  if (!isInitialized) return <LoadingSpinner />;
  if (!isAuthenticated) return null; // ProtectedRoute handles redirect

  return <YourComponent />;
};
```

## Routes Setup

```javascript
// In App.jsx
<AuthProvider>
  <Routes>
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfilePage /></ProtectedRoute>} />
  </Routes>
</AuthProvider>
```

## Token Handling

- Tokens are automatically stored in localStorage
- Tokens are automatically sent with API requests (if ApiService updated)
- Tokens are validated on app initialization
- Expired tokens trigger logout (implement in ApiService)

## Error Handling

```javascript
const { error, isLoading } = useAuth();

return (
  <div>
    {error && <ErrorMessage msg={error} />}
    {isLoading && <LoadingSpinner />}
  </div>
);
```

## Authentication States

| State | isInitialized | isAuthenticated | isLoading | User Data | Action |
|-------|---------------|-----------------|-----------|-----------|--------|
| Loading | false | - | - | null | Show loading spinner |
| Not Logged In | true | false | false | null | Show login page |
| Logging In | true | false | true | null | Show loading indicator |
| Logged In | true | true | false | ✓ | Show dashboard |
| Logging Out | true | true | true | ✓ | Show loading indicator |

## LocalStorage Keys

- `token`: JWT authentication token
- `userId`: User ID (optional, stored by AuthContext)

Clear these keys to simulate logout or session expiration:
```javascript
localStorage.removeItem('token');
localStorage.removeItem('userId');
```

## Debugging Tips

```javascript
// Log auth state
const auth = useAuth();
console.log('Auth State:', auth);

// Check if user is doctor
console.log('Is Doctor:', auth.isDoctor());

// Check current user
console.log('Current User:', auth.user);

// Check if request will succeed
console.log('Can Access Protected:', auth.isAuthenticated);
```

## Common Issues & Solutions

### Issue: User redirected to login after refresh
**Solution**: Wait for `isInitialized` before checking `isAuthenticated`
```javascript
if (!isInitialized) return <LoadingSpinner />;
if (!isAuthenticated) return <Redirect to="/login" />;
```

### Issue: Token not sent with API requests
**Solution**: Ensure ApiService retrieves token from localStorage
```javascript
const token = localStorage.getItem('token');
headers['Authorization'] = `Bearer ${token}`;
```

### Issue: Role checking always returns false
**Solution**: Use lowercase role names ('patient', 'doctor')
```javascript
// ✓ Correct
user.role === 'patient'

// ✗ Wrong
user.role === 'Patient'
```

### Issue: User logged out after page refresh
**Solution**: Check if token is valid and not expired
```javascript
const isValidToken = (token) => {
  // Implement token validation
};
```
