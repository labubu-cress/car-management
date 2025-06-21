import type {
    AdminUser,
    CarCategory,
    CarTrim,
    CarTrimWithFavorites,
    ContactUsConfig,
    CreateAdminUserInput,
    CreateCarCategoryInput,
    CreateCarTrimInput,
    CreateFaqInput,
    CreateTenantInput,
    CreateVehicleScenarioInput,
    DashboardStats,
    Faq,
    HomepageConfig,
    LoginInput,
    LoginResponse,
    Tenant,
    UpdateAdminUserInput,
    UpdateCarCategoryInput,
    UpdateCarTrimInput,
    UpdateContactUsConfigInput,
    UpdateFaqInput,
    UpdateHomepageConfigInput,
    UpdateTenantInput,
    UpdateVehicleScenarioInput,
    UploadToken,
    User,
    UserWithFavorites,
    VehicleScenario,
} from "@/types/api";
import axios from "axios";

// 创建 axios 实例
const api = axios.create({
  baseURL: "/api/v1/admin",
  timeout: 10000,
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      const loginPath = "/#/login";
      window.location.href = import.meta.env.BASE_URL
        ? `${import.meta.env.BASE_URL.replace(/\/$/, "")}${loginPath}`
        : loginPath;
    }
    return Promise.reject(error);
  },
);

// 认证相关
export const authApi = {
  login: (data: LoginInput): Promise<LoginResponse> => api.post("/auth/login", data).then((res) => res.data),
};

// 租户管理
export const tenantsApi = {
  getAll: (): Promise<Tenant[]> => api.get("/tenants").then((res) => res.data),

  getById: (id: string): Promise<Tenant> => api.get(`/tenants/${id}`).then((res) => res.data),

  create: (data: CreateTenantInput): Promise<Tenant> => api.post("/tenants", data).then((res) => res.data),

  update: (id: string, data: UpdateTenantInput): Promise<Tenant> =>
    api.put(`/tenants/${id}`, data).then((res) => res.data),

  delete: (id: string): Promise<void> => api.delete(`/tenants/${id}`).then(() => undefined),
};

// 管理员用户管理
export const adminUsersApi = {
  getAll: (): Promise<AdminUser[]> => api.get("/admin-users").then((res) => res.data),

  getById: (id: string): Promise<AdminUser> => api.get(`/admin-users/${id}`).then((res) => res.data),

  create: (data: CreateAdminUserInput): Promise<AdminUser> => api.post("/admin-users", data).then((res) => res.data),

  update: (id: string, data: UpdateAdminUserInput): Promise<AdminUser> =>
    api.put(`/admin-users/${id}`, data).then((res) => res.data),

  delete: (id: string): Promise<void> => api.delete(`/admin-users/${id}`).then(() => undefined),
};

// 车辆场景管理
export const vehicleScenariosApi = {
  getAll: (tenantId: string): Promise<VehicleScenario[]> =>
    api.get(`/tenants/${tenantId}/vehicle-scenarios`).then((res) => res.data),

  getById: (tenantId: string, id: string): Promise<VehicleScenario> =>
    api.get(`/tenants/${tenantId}/vehicle-scenarios/${id}`).then((res) => res.data),

  create: (tenantId: string, data: CreateVehicleScenarioInput): Promise<VehicleScenario> =>
    api.post(`/tenants/${tenantId}/vehicle-scenarios`, data).then((res) => res.data),

  update: (tenantId: string, id: string, data: UpdateVehicleScenarioInput): Promise<VehicleScenario> =>
    api.put(`/tenants/${tenantId}/vehicle-scenarios/${id}`, data).then((res) => res.data),

  delete: (tenantId: string, id: string): Promise<void> =>
    api.delete(`/tenants/${tenantId}/vehicle-scenarios/${id}`).then(() => undefined),
};

// 车辆分类管理
export const carCategoriesApi = {
  getAll: (tenantId: string, name?: string, vehicleScenarioId?: string): Promise<CarCategory[]> =>
    api.get(`/tenants/${tenantId}/car-categories`, { params: { name, vehicleScenarioId } }).then((res) => res.data),

  getById: (tenantId: string, id: string): Promise<CarCategory> =>
    api.get(`/tenants/${tenantId}/car-categories/${id}`).then((res) => res.data),

  create: (tenantId: string, data: CreateCarCategoryInput): Promise<CarCategory> =>
    api.post(`/tenants/${tenantId}/car-categories`, data).then((res) => res.data),

  update: (tenantId: string, id: string, data: UpdateCarCategoryInput): Promise<CarCategory> =>
    api.put(`/tenants/${tenantId}/car-categories/${id}`, data).then((res) => res.data),

  delete: (tenantId: string, id: string): Promise<void> =>
    api.delete(`/tenants/${tenantId}/car-categories/${id}`).then(() => undefined),

  reorder: (tenantId: string, vehicleScenarioId: string, categoryIds: string[]): Promise<void> =>
    api.put(`/tenants/${tenantId}/car-categories/reorder`, { vehicleScenarioId, categoryIds }).then(() => undefined),
};

// 车型配置管理
export const carTrimsApi = {
  getAll: (tenantId: string, categoryId: string): Promise<CarTrim[]> =>
    api.get(`/tenants/${tenantId}/car-trims?categoryId=${categoryId}`).then((res) => res.data),

  getById: (tenantId: string, id: string): Promise<CarTrimWithFavorites> =>
    api.get(`/tenants/${tenantId}/car-trims/${id}`).then((res) => res.data),

  create: (tenantId: string, data: CreateCarTrimInput): Promise<CarTrim> =>
    api.post(`/tenants/${tenantId}/car-trims`, data).then((res) => res.data),

  update: (tenantId: string, id: string, data: UpdateCarTrimInput): Promise<CarTrim> =>
    api.put(`/tenants/${tenantId}/car-trims/${id}`, data).then((res) => res.data),

  delete: (tenantId: string, id: string): Promise<void> =>
    api.delete(`/tenants/${tenantId}/car-trims/${id}`).then(() => undefined),

  reorder: (tenantId: string, categoryId: string, trimIds: string[]): Promise<void> =>
    api.put(`/tenants/${tenantId}/car-trims/reorder`, { categoryId, trimIds }).then(() => undefined),
};

// 用户管理
export const usersApi = {
  getAll: (tenantId: string): Promise<User[]> => api.get(`/tenants/${tenantId}/users`).then((res) => res.data),

  getById: (tenantId: string, id: string): Promise<UserWithFavorites> =>
    api.get(`/tenants/${tenantId}/users/${id}`).then((res) => res.data),
};

// 图片上传
export const imageApi = {
  getUploadToken: (tenantId: string): Promise<UploadToken> =>
    api.get(`/tenants/${tenantId}/img/upload-token`).then((res) => res.data),
};

export const dashboardApi = {
  getStats: (tenantId: string): Promise<DashboardStats> =>
    api.get(`/tenants/${tenantId}/dashboard/stats`).then((res) => res.data),
};

export const homepageConfigApi = {
  get: (tenantId: string): Promise<HomepageConfig> =>
    api.get(`/tenants/${tenantId}/homepage-config`).then((res) => res.data),
  update: (tenantId: string, data: UpdateHomepageConfigInput): Promise<HomepageConfig> =>
    api.put(`/tenants/${tenantId}/homepage-config`, data).then((res) => res.data),
};

export const contactUsConfigApi = {
  get: (tenantId: string): Promise<ContactUsConfig> =>
    api.get(`/tenants/${tenantId}/contact-us-config`).then((res) => res.data),
  update: (tenantId: string, data: UpdateContactUsConfigInput): Promise<ContactUsConfig> =>
    api.put(`/tenants/${tenantId}/contact-us-config`, data).then((res) => res.data),
};

// 常见问题管理
export const faqsApi = {
  getAll: (tenantId: string): Promise<Faq[]> =>
    api.get(`/tenants/${tenantId}/faqs`).then((res) => res.data.faqs),

  create: (tenantId: string, data: CreateFaqInput): Promise<Faq> =>
    api.post(`/tenants/${tenantId}/faqs`, data).then((res) => res.data),

  update: (tenantId: string, id: string, data: UpdateFaqInput): Promise<Faq> =>
    api.put(`/tenants/${tenantId}/faqs/${id}`, data).then((res) => res.data),

  delete: (tenantId: string, id: string): Promise<void> =>
    api.delete(`/tenants/${tenantId}/faqs/${id}`).then(() => undefined),
};

export default api;
