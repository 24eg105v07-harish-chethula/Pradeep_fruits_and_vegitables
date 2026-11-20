import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Search,
  ShoppingCart,
  User,
  ChevronDown,
  Clock,
  Sparkles,
  LogOut,
  ShoppingBag,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { useCartContext } from '../context/CartContext.tsx';
import { useAuthContext } from '../context/AuthContext.tsx';
import { useLocationContext } from '../context/LocationContext.tsx';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ searchQuery, onSearchChange }) => {
  const navigate = useNavigate();
  const { openCart, itemCount, finalTotal } = useCartContext();
  const { user, isAuthenticated, customerLogout, openAuthModal } = useAuthContext();
  const { currentArea, openLocationModal } = useLocationContext();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
      {/* Top micro banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-white text-[11px] font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-amber-300" />
          <span>Express 30-Minute Grocery Delivery across <strong>Bhadradri Kothagudem, Telangana</strong></span>
        </span>
        <span className="hidden md:inline-block text-emerald-300">•</span>
        <span className="hidden md:inline-block">Use Code <strong>WELCOME50</strong> for 50% OFF!</span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3 md:gap-6">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform">
              <span className="text-xl">🥦</span>
            </div>
            <div>
              <div className="font-extrabold text-base md:text-lg leading-tight tracking-tight text-emerald-950 uppercase flex items-center gap-1.5">
                <span>PRADEEP</span>
                <span className="text-emerald-600 font-black">FRUITS & VEGETABLES</span>
              </div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <span>Bhadradri Kothagudem</span>
                <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                <span className="text-emerald-700">30 Min Delivery</span>
              </div>
            </div>
          </Link>

          {/* Delivery Location Selector */}
          <button
            onClick={openLocationModal}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 transition-all text-left group"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-100/80 flex items-center justify-center text-emerald-800">
              <MapPin className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-extrabold text-emerald-800 flex items-center gap-1">
                <span>Delivery in ~{currentArea?.estimatedMinutes || 30} mins</span>
              </div>
              <div className="text-xs font-bold text-gray-900 group-hover:text-emerald-700 flex items-center gap-0.5 truncate max-w-[150px]">
                <span>{currentArea?.areaName || 'Kothagudem Town'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600" />
              </div>
            </div>
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder='Search "Tomato", "Apple", "పాలకూర", "Onion"...'
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 rounded-2xl text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Customer Account / Login */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-800 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:inline truncate max-w-[90px]">{user?.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 text-xs font-medium animate-scaleUp">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="font-bold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-gray-500">+91 {user?.mobile}</p>
                    </div>
                    <Link
                      to="/my-orders"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4 text-emerald-600" />
                      <span>My Orders</span>
                    </Link>
                    <button
                      onClick={() => {
                        customerLogout();
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="px-3 md:px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <User className="w-4 h-4 text-gray-600" />
                <span>Login</span>
              </button>
            )}

            {/* Admin Portal Shortcut */}
            <Link
              to="/admin/dashboard"
              className="hidden lg:flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors border border-emerald-200"
              title="Admin Delivery & Order Dashboard"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Admin</span>
            </Link>

            {/* Shopping Cart Button */}
            <button
              onClick={openCart}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-200 transition-all active:scale-95 group"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-emerald-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {itemCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span>{itemCount > 0 ? `${itemCount} Items` : 'My Cart'}</span>
                {itemCount > 0 && <span className="text-[10px] text-emerald-200">₹{finalTotal}</span>}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar & Location Row */}
        <div className="mt-3 md:hidden space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search vegetables, fruits, groceries..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between bg-emerald-50/70 px-3 py-1.5 rounded-xl border border-emerald-100 text-xs">
            <button
              onClick={openLocationModal}
              className="flex items-center gap-1.5 font-bold text-emerald-900 truncate"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="truncate">{currentArea?.areaName}, Kothagudem</span>
              <ChevronDown className="w-3 h-3 text-emerald-600 shrink-0" />
            </button>
            <span className="shrink-0 text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-extrabold">
              ⚡ 30 MINS
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
