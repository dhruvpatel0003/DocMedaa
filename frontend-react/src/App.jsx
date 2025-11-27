import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";
import "./styles/global.css";

// Pages
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CompleteProfilePage from "./pages/CompleteProfilePage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DoctorAppointmentsPage from "./pages/appointments/doctorAppointments/DoctorAppointmentsPage";
import PatientBookAppointmentPage from "./pages/appointments/patientAppointments/PatientBookAppointmentPage";
import ResourcesPage from "./pages/Resources.jsx";
import ArticleDetail from "./pages/ResourceDetailPage.jsx";
import AboutUs from "./pages/AboutUs";
import Help from "./pages/Help";
import NotificationsPage from "./pages/NotificationPage.jsx";
import ChannelListPage from "./pages/chat/ChannelListPage.jsx";
import ChannelChatPage from "./pages/chat/ChannelChatPage.jsx";
import HistoryTab from "./pages/HistoryTab.jsx";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignupPage />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password/:token"
              element={
                <PublicRoute>
                  <ResetPasswordPage />
                </PublicRoute>
              }
            />
            <Route
              path="/complete-profile"
              element={
                <ProtectedRoute>
                  <CompleteProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/appointments"
              element={
                <ProtectedRoute>
                  <DoctorAppointmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resources"
              element={
                <ProtectedRoute>
                  <ResourcesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resources/:id"
              element={
                <ProtectedRoute>
                  <ArticleDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book-appointment"
              element={
                <ProtectedRoute>
                  <PatientBookAppointmentPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route
              path="*"
              element={
                <div style={{ padding: "40px", textAlign: "center" }}>
                  <h1>404 - Page Not Found</h1>
                </div>
              }
            />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/help" element={<Help />} />
            <Route
              path="/notification"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/channels" element={
              <ProtectedRoute>
                <ChannelListPage />
              </ProtectedRoute>
            } />
            <Route path="/chat/:channelId" element={
              <ProtectedRoute>
                <ChannelChatPage />
              </ProtectedRoute>
            } />
             <Route path="/history" element={
              <ProtectedRoute>
                <HistoryTab />
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </Router>
    </Provider>
  );
}

export default App;
