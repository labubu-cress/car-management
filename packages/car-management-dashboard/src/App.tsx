import { Layout } from '@/components/Layout';
import { LoginForm } from '@/components/LoginForm';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AdminUsers } from '@/pages/AdminUsers';
import { CarCategories } from '@/pages/CarCategories';
import { CarCategoryForm } from '@/pages/CarCategoryForm';
import { CarTrimForm } from '@/pages/CarTrimForm';
import { CarTrims } from '@/pages/CarTrims';
import ContactUsConfigPage from '@/pages/ContactUsConfig';
import { Dashboard } from '@/pages/Dashboard';
import { Faqs } from '@/pages/Faqs';
import { FirstTenantSetup } from '@/pages/FirstTenantSetup';
import HomepageConfigPage from '@/pages/HomepageConfig';
import { Tenants } from '@/pages/Tenants';
import { UserMessages } from '@/pages/UserMessages';
import { Users } from '@/pages/Users';
import { VehicleScenarios } from '@/pages/VehicleScenarios';
import '@/styles/global.css';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Navigate, Route, HashRouter as Router, Routes } from 'react-router-dom';
import ChangePassword from './pages/ChangePassword';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, needsFirstTenant } = useAuth();

  if (isLoading) {
    return <div>加载中...</div>;
  }

  if (!user) {
    return <LoginForm />;
  }

  if (needsFirstTenant) {
    return <FirstTenantSetup />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tenants" element={<Tenants />} />
                <Route path="/admin-users" element={<AdminUsers />} />
                <Route path="/vehicle-scenarios" element={<VehicleScenarios />} />
                <Route path="/car-categories" element={<CarCategories />} />
                <Route path="/car-categories/new" element={<CarCategoryForm />} />
                <Route path="/car-categories/:id/edit" element={<CarCategoryForm />} />
                <Route path="/car-trims" element={<CarTrims />} />
                <Route path="/car-trims/new" element={<CarTrimForm />} />
                <Route path="/car-trims/:id/edit" element={<CarTrimForm />} />
                <Route path="/users" element={<Users />} />
                <Route path="/homepage-config" element={<HomepageConfigPage />} />
                <Route path="/contact-us-config" element={<ContactUsConfigPage />} />
                <Route path="/faqs" element={<Faqs />} />
                <Route path="/user-messages" element={<UserMessages />} />
                <Route path="/change-password" element={<ChangePassword />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster
            position="top-right"
            containerStyle={{
              top: 80,
              right: 20,
            }}
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App; 