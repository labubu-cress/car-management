import { authApi, tenantsApi } from '@/lib/api';
import type { AdminUser, Tenant } from '@/types/api';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: AdminUser | null;
  currentTenant: Tenant | null;
  tenants: Tenant[];
  isLoading: boolean;
  needsFirstTenant: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  selectTenant: (tenant: Tenant) => void;
  refreshTenants: () => Promise<void>;
  isViewer: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [needsFirstTenant, setNeedsFirstTenant] = useState(false);

  const refreshTenants = async () => {
    try {
      const tenantsData = await tenantsApi.getAll();
      setTenants(tenantsData);
      
      // 检查是否需要创建第一个租户
      if (tenantsData.length === 0) {
        setNeedsFirstTenant(true);
        setCurrentTenant(null);
        localStorage.removeItem('current_tenant');
        return;
      }
      
      setNeedsFirstTenant(false);
      
      // 恢复或选择当前租户
      const savedTenant = localStorage.getItem('current_tenant');
      if (savedTenant) {
        const tenant = JSON.parse(savedTenant);
        const validTenant = tenantsData.find(t => t.id === tenant.id);
        if (validTenant) {
          setCurrentTenant(validTenant);
          return;
        }
      }

      // 如果没有选择租户，自动选择第一个活跃的租户
      const activeTenant = tenantsData.find(t => t.status === 'active') || tenantsData[0];
      setCurrentTenant(activeTenant);
      localStorage.setItem('current_tenant', JSON.stringify(activeTenant));
    } catch (error) {
      console.error('Failed to load tenants:', error);
      throw error;
    }
  };

  // 初始化认证状态
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('admin_token');
      const savedUser = localStorage.getItem('admin_user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          await refreshTenants();
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login({ username, password });
      
      localStorage.setItem('admin_token', response.token);
      localStorage.setItem('admin_user', JSON.stringify(response.user));
      setUser(response.user);

      // 加载租户列表并检查是否需要创建第一个租户
      await refreshTenants();
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('current_tenant');
    setUser(null);
    setCurrentTenant(null);
    setTenants([]);
    setNeedsFirstTenant(false);
  };

  const selectTenant = (tenant: Tenant) => {
    setCurrentTenant(tenant);
    localStorage.setItem('current_tenant', JSON.stringify(tenant));
  };

  const isViewer = user?.role === 'tenant_viewer';
  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin';

  const value: AuthContextType = {
    user,
    currentTenant,
    tenants,
    isLoading,
    needsFirstTenant,
    login,
    logout,
    selectTenant,
    refreshTenants,
    isViewer,
    isSuperAdmin,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}; 