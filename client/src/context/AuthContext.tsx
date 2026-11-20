import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerUser, Address } from '../types/index.ts';
import api from '../services/api.ts';

interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: string;
  email: string;
  mobile: string;
}

interface AuthContextType {
  user: CustomerUser | null;
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  customerLogin: (mobile: string, password: string) => Promise<{ success: boolean; message: string }>;
  customerRegister: (name: string, mobile: string, password: string, email?: string) => Promise<{ success: boolean; message: string }>;
  customerLogout: () => void;
  adminLogin: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  adminLogout: () => void;
  saveCustomerAddress: (address: Partial<Address>) => Promise<{ success: boolean; message: string }>;
  deleteCustomerAddress: (addressId: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomerUser | null>(() => {
    const saved = localStorage.getItem('pfv_customer_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('pfv_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    // Optionally refresh profile if token exists
    const token = localStorage.getItem('pfv_user_token');
    if (token) {
      api.get('/auth/profile')
        .then(res => {
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('pfv_customer_user', JSON.stringify(res.data.user));
          }
        })
        .catch(() => {
          // Keep cached user if offline or error
        });
    }
  }, []);

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const customerLogin = async (mobile: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { mobile, password });
      if (res.data.success) {
        localStorage.setItem('pfv_user_token', res.data.token);
        localStorage.setItem('pfv_customer_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        setIsAuthModalOpen(false);
        return { success: true, message: res.data.message || 'Login successful' };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Network error during login'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const customerRegister = async (name: string, mobile: string, password: string, email?: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', { name, mobile, password, email });
      if (res.data.success) {
        localStorage.setItem('pfv_user_token', res.data.token);
        localStorage.setItem('pfv_customer_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        setIsAuthModalOpen(false);
        return { success: true, message: res.data.message || 'Registration successful' };
      }
      return { success: false, message: res.data.message || 'Registration failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Error during registration'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const customerLogout = () => {
    localStorage.removeItem('pfv_user_token');
    localStorage.removeItem('pfv_customer_user');
    setUser(null);
  };

  const adminLoginAction = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/admin/login', { email: username, password });
      if (res.data.success) {
        localStorage.setItem('pfv_admin_token', res.data.token);
        localStorage.setItem('pfv_admin_user', JSON.stringify(res.data.admin));
        setAdmin(res.data.admin);
        return { success: true, message: 'Admin authenticated successfully' };
      }
      return { success: false, message: res.data.message || 'Admin authentication failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Admin login error'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogout = () => {
    localStorage.removeItem('pfv_admin_token');
    localStorage.removeItem('pfv_admin_user');
    setAdmin(null);
  };

  const saveCustomerAddress = async (addressData: Partial<Address>) => {
    try {
      const res = await api.post('/auth/addresses', addressData);
      if (res.data.success) {
        if (user) {
          const updatedUser = { ...user, addresses: res.data.addresses };
          setUser(updatedUser);
          localStorage.setItem('pfv_customer_user', JSON.stringify(updatedUser));
        }
        return { success: true, message: 'Address saved successfully' };
      }
      return { success: false, message: res.data.message || 'Could not save address' };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const deleteCustomerAddress = async (addressId: string) => {
    try {
      const res = await api.delete(`/auth/addresses/${addressId}`);
      if (res.data.success) {
        if (user) {
          const updatedUser = { ...user, addresses: res.data.addresses };
          setUser(updatedUser);
          localStorage.setItem('pfv_customer_user', JSON.stringify(updatedUser));
        }
        return { success: true, message: 'Address removed' };
      }
      return { success: false, message: res.data.message || 'Failed to remove address' };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        isAuthenticated: !!user,
        isAdminAuthenticated: !!admin,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        customerLogin,
        customerRegister,
        customerLogout,
        adminLogin: adminLoginAction,
        adminLogout,
        saveCustomerAddress,
        deleteCustomerAddress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
