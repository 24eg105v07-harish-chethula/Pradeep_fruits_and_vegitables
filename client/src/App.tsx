import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LocationProvider } from './context/LocationContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';

import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { LocationModal } from './components/LocationModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';

import { HomePage } from './pages/HomePage.tsx';
import { CheckoutPage } from './pages/CheckoutPage.tsx';
import { OrderTrackingPage } from './pages/OrderTrackingPage.tsx';
import { MyOrdersPage } from './pages/MyOrdersPage.tsx';
import { AdminLoginPage } from './pages/AdminLoginPage.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';

export const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <BrowserRouter>
      <LocationProvider>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans selection:bg-emerald-600 selection:text-white">
              {/* Top Navigation */}
              <Navbar
                searchQuery={searchQuery}
                onSearchChange={(q) => setSearchQuery(q)}
              />

              {/* Modals & Overlays */}
              <LocationModal />
              <AuthModal />
              <CartDrawer />

              {/* Main Routing Body */}
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/track/:orderId" element={<OrderTrackingPage />} />
                  <Route path="/my-orders" element={<MyOrdersPage />} />
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              {/* Footer */}
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </LocationProvider>
    </BrowserRouter>
  );
};

export default App;
