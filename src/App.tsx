import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { LanguageProvider } from './context/LanguageContext';
import { LocationProvider } from './context/LocationContext';
import { AuthProvider } from './context/AuthContext';

// Route Protection Components
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleProtectedRoute } from './components/auth/RoleProtectedRoute';

// Layouts
import { ConsumerLayout } from './components/layout/ConsumerLayout';
import { RetailerLayout } from './components/layout/RetailerLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { ForBusinessPage } from './pages/public/ForBusinessPage';

// Authentication Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';

// Consumer Pages
import { DiscoverPage } from './pages/consumer/DiscoverPage';
import { MapDiscoveryPage } from './pages/consumer/MapDiscoveryPage';
import { ProductDetailPage } from './pages/consumer/ProductDetailPage';
import { StoreDetailPage } from './pages/consumer/StoreDetailPage';
import { SavedPage } from './pages/consumer/SavedPage';
import { ReservationsListPage } from './pages/consumer/ReservationsListPage';
import { ReservationDetailPage } from './pages/consumer/ReservationDetailPage';
import { ConsumerImpactPage } from './pages/consumer/ConsumerImpactPage';
import { NotificationsPage } from './pages/consumer/NotificationsPage';
import { ConsumerProfilePage } from './pages/consumer/ConsumerProfilePage';

// Retailer Pages
import { RetailerDashboardPage } from './pages/retailer/RetailerDashboardPage';
import { RetailerProductsPage } from './pages/retailer/RetailerProductsPage';
import { AddProductPage } from './pages/retailer/AddProductPage';
import { RetailerReservationsPage } from './pages/retailer/RetailerReservationsPage';
import { RetailerAnalyticsPage } from './pages/retailer/RetailerAnalyticsPage';
import { RetailerMessagesPage } from './pages/retailer/RetailerMessagesPage';
import { RetailerStorePage } from './pages/retailer/RetailerStorePage';

// Admin Page
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

// Development Helper
import { DevRoleSwitcher } from './components/common/DevRoleSwitcher';

// Tschüss AI Assistant Chatbot
import { TschussAIChatBubble } from './components/chat/TschussAIChatBubble';

export default function App() {
  return (
    <LanguageProvider>
      <LocationProvider>
        <AuthProvider>
          <BrowserRouter>
              <Routes>
              {/* Public & Consumer Routes under ConsumerLayout */}
              <Route path="/" element={<ConsumerLayout />}>
                {/* Public Pages */}
                <Route index element={<LandingPage />} />
                <Route path="how-it-works" element={<HowItWorksPage />} />
                <Route path="for-business" element={<ForBusinessPage />} />

                {/* Authentication Pages (Publicly accessible) */}
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route path="verify-email" element={<VerifyEmailPage />} />

                {/* Protected Consumer Application Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="app" element={<Navigate to="/app/discover" replace />} />
                  <Route path="app/discover" element={<DiscoverPage />} />
                  <Route path="app/search" element={<DiscoverPage />} />
                  <Route path="app/map" element={<MapDiscoveryPage />} />
                  <Route path="app/products/:id" element={<ProductDetailPage />} />
                  <Route path="app/stores/:id" element={<StoreDetailPage />} />
                  <Route path="app/saved" element={<SavedPage />} />
                  <Route path="app/reservations" element={<ReservationsListPage />} />
                  <Route path="app/reservations/:id" element={<ReservationDetailPage />} />
                  <Route path="app/impact" element={<ConsumerImpactPage />} />
                  <Route path="app/notifications" element={<NotificationsPage />} />
                  <Route path="app/profile" element={<ConsumerProfilePage />} />
                </Route>

                {/* Protected Admin Route */}
                <Route
                  path="admin"
                  element={
                    <RoleProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboardPage />
                    </RoleProtectedRoute>
                  }
                />
              </Route>

              {/* Protected Retailer Portal Routes (RetailerLayout) */}
              <Route
                path="/business"
                element={
                  <RoleProtectedRoute allowedRoles={['retailer', 'admin']}>
                    <RetailerLayout />
                  </RoleProtectedRoute>
                }
              >
                <Route index element={<RetailerDashboardPage />} />
                <Route path="products" element={<RetailerProductsPage />} />
                <Route path="products/new" element={<AddProductPage />} />
                <Route path="reservations" element={<RetailerReservationsPage />} />
                <Route path="analytics" element={<RetailerAnalyticsPage />} />
                <Route path="messages" element={<RetailerMessagesPage />} />
                <Route path="store" element={<RetailerStorePage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Tschüss AI Chatbot Bubble */}
            <TschussAIChatBubble />

            {/* Development Role Switcher Floating Widget */}
            <DevRoleSwitcher />
          </BrowserRouter>
        </AuthProvider>
      </LocationProvider>
    </LanguageProvider>
  );
}

