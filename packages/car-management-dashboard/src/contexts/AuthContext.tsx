import { authApi, tenantsApi } from '@/lib/api';
import type { AdminUser, Tenant } from '@/types/api';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: AdminUser | null;
  currentTenant: Tenant | null;
  tenants: Tenant[];
  isLoading: boolean;
  needsFirstTenant: boolean;
  login: (username: string, password: string, keepLoggedIn: boolean) => Promise<void>;
  logout: () => void;
  selectTenant: (tenant: Tenant) => void;
  refreshTenants: (currentUser?: AdminUser | null) => Promise<void>;
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

  const refreshTenants = async (currentUser: AdminUser | null = user) => {
    try {
      const tenantsData = await tenantsApi.getAll();
      setTenants(tenantsData);
      
      // 检查是否需要创建第一个租户
      if (tenantsData.length === 0) {
        setNeedsFirstTenant(true);
        setCurrentTenant(null);
        sessionStorage.removeItem('current_tenant');
        return;
      }
      
      setNeedsFirstTenant(false);
      
      // 如果是 tenant_viewer, 自动选择其所属的 tenant
      if (currentUser?.role === 'tenant_viewer' && currentUser.tenantId) {
        const viewerTenant = tenantsData.find(t => t.id === currentUser.tenantId);
        if (viewerTenant) {
          setCurrentTenant(viewerTenant);
          sessionStorage.setItem('current_tenant', JSON.stringify(viewerTenant));
          return;
        }
      }

      // 恢复或选择当前租户
      const savedTenant = sessionStorage.getItem('current_tenant');
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
      sessionStorage.setItem('current_tenant', JSON.stringify(activeTenant));
    } catch (error) {
      console.error('Failed to load tenants:', error);
      throw error;
    }
  };

  // 初始化认证状态
  useEffect(() => {
    const initAuth = async () => {
      // 优先从 localStorage 获取，实现"保持登录"
      let token = localStorage.getItem('admin_token');
      let savedUser = localStorage.getItem('admin_user');

      // 如果 localStorage 没有，再从 sessionStorage 获取，用于单次会话
      if (!token || !savedUser) {
        token = sessionStorage.getItem('admin_token');
        savedUser = sessionStorage.getItem('admin_user');
      }

      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          await refreshTenants(parsedUser);
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();

    const handleAuthError = () => {
      logout();
    };
    window.addEventListener("auth-error", handleAuthError);

    return () => {
      window.removeEventListener("auth-error", handleAuthError);
    };
  }, []);

  const login = async (username: string, password: string, keepLoggedIn: boolean) => {
    try {
      const response = await authApi.login({ username, password });
      
      const storage = keepLoggedIn ? localStorage : sessionStorage;
      storage.setItem('admin_token', response.token);
      storage.setItem('admin_user', JSON.stringify(response.user));
      setUser(response.user);

      // 加载租户列表并检查是否需要创建第一个租户
      await refreshTenants(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    // 清除所有可能的登录信息
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_user');

    // 租户信息只在 sessionStorage 中
    sessionStorage.removeItem('current_tenant');
    setUser(null);
    setCurrentTenant(null);
    setTenants([]);
    setNeedsFirstTenant(false);
    
    // 重定向到登录页
    const loginPath = "/#/login";
    if (window.location.pathname !== loginPath) {
      window.location.href = import.meta.env.BASE_URL
        ? `${import.meta.env.BASE_URL.replace(/\/$/, "")}${loginPath}`
        : loginPath;
    }
  };

  const selectTenant = (tenant: Tenant) => {
    setCurrentTenant(tenant);
    sessionStorage.setItem('current_tenant', JSON.stringify(tenant));
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