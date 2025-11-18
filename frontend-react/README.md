# DocMedaa React Frontend

This is the React frontend for the DocMedaa medical appointment booking system.

## Project Structure

```
src/
├── components/        # Reusable components (Logo, Layout, CustomTextField)
├── pages/            # Page components (Login, Signup, Dashboard, etc.)
├── redux/            # Redux store and slices
├── constants/        # App constants and theme configuration
├── styles/           # Global CSS styles
├── utils/            # Helper functions and utilities
├── services/         # API service layer
├── App.jsx           # Main App component
└── index.js          # React DOM render entry point
```

## Theme Configuration

All theme colors, fonts, and sizes are managed in `src/constants/AppConstants.js`. To change the theme:

1. Update the color values in `AppConstants`
2. Update CSS variables in `src/styles/global.css`
3. All components will automatically use the new theme

## Colors

- **Primary Color**: `#0052CC` (Blue)
- **Error Color**: `#E53935` (Red)
- **Success Color**: `#43A047` (Green)
- **Warning Color**: `#FB8C00` (Orange)

## Getting Started

1. Navigate to the project directory:
```bash
cd frontend-react
```

2. Install dependencies:
```bash
npm install
```

3. Set environment variables:
```bash
cp .env.example .env
# Update .env with your backend API URL
```

4. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

## Components

### Logo
Displays the DocMedaa logo with medical cross design.
```jsx
<Logo size="medium" showText={true} />
```

### CustomTextField
Reusable text input component.
```jsx
<CustomTextField
  hint="Enter your email"
  value={email}
  onChange={setEmail}
  type="email"
  error={emailError}
/>
```

### Layout
Wraps pages with header and footer.
```jsx
<Layout showHeader={true} showFooter={true}>
  {/* Page content */}
</Layout>
```

## State Management (Redux)

User state is managed in Redux with slices:
- `userSlice`: Manages authentication and user profile data

Access user data:
```jsx
const user = useSelector(state => state.user);
const dispatch = useDispatch();
```

## API Integration

All API calls are handled through `src/services/ApiService.js`:

```jsx
const response = await ApiService.signup(userData);
```

## Contributing

Follow the established folder structure and naming conventions when adding new features.