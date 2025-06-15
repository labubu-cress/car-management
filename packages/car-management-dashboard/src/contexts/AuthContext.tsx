import { authApi, tenantsApi } from '@/lib/api';
import type { AdminUser, Tenant } from '@/types/api';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: AdminUser | null;
  currentTenant: Tenant | null;
  tenants: Tenant[];
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  selectTenant: (tenant: Tenant) => void;
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

  // 初始化认证状态
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('admin_token');
      const savedUser = localStorage.getItem('admin_user');
      const savedTenant = localStorage.getItem('current_tenant');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          
          // 加载租户列表
          const tenantsData = await tenantsApi.getAll();
          setTenants(tenantsData);

          // 恢复当前租户
          if (savedTenant) {
            const tenant = JSON.parse(savedTenant);
            const validTenant = tenantsData.find(t => t.id === tenant.id);
            if (validTenant) {
              setCurrentTenant(validTenant);
            }
          }

          // 如果没有选择租户，自动选择第一个活跃的租户
          if (!savedTenant && tenantsData.length > 0) {
            const activeTenant = tenantsData.find(t => t.status === 'active') || tenantsData[0];
            setCurrentTenant(activeTenant);
            localStorage.setItem('current_tenant', JSON.stringify(activeTenant));
          }
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

      // 加载租户列表
      const tenantsData = await tenantsApi.getAll();
      setTenants(tenantsData);

      // 自动选择第一个活跃的租户
      if (tenantsData.length > 0) {
        const activeTenant = tenantsData.find(t => t.status === 'active') || tenantsData[0];
        setCurrentTenant(activeTenant);
        localStorage.setItem('current_tenant', JSON.stringify(activeTenant));
      }
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
  };

  const selectTenant = (tenant: Tenant) => {
    setCurrentTenant(tenant);
    localStorage.setItem('current_tenant', JSON.stringify(tenant));
  };

  const value: AuthContextType = {
    user,
    currentTenant,
    tenants,
    isLoading,
    login,
    logout,
    selectTenant,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 