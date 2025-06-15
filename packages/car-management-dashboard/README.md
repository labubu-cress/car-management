# 汽车管理后台前端

这是一个基于 React + TypeScript + Vite 构建的汽车管理后台前端应用。

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **@vanilla-extract/css** - CSS-in-JS 样式方案
- **React Router** - 路由管理
- **React Query** - 数据获取和缓存
- **Axios** - HTTP 客户端
- **FontAwesome** - 图标库
- **React Hook Form** - 表单管理

## 功能特性

- 🔐 管理员登录认证
- 🏢 多租户支持（类似云管理后台的地域选择）
- 📊 仪表盘概览
- 👥 租户管理
- 🛡️ 管理员用户管理
- 🚗 车辆场景管理
- 📋 车辆分类管理
- ⚙️ 车型配置管理
- 👤 用户管理
- 🖼️ 图片上传支持

## 开发环境启动

1. 确保后端 API 服务在 `localhost:3000` 运行
2. 安装依赖：
   ```bash
   npm install
   ```
3. 启动开发服务器：
   ```bash
   npm run dev
   ```
4. 访问 `http://localhost:3001`

## 项目结构

```
src/
├── components/          # 通用组件
│   ├── Layout/         # 布局组件
│   └── LoginForm.tsx   # 登录表单
├── contexts/           # React Context
│   └── AuthContext.tsx # 认证上下文
├── lib/               # 工具库
│   └── api.ts         # API 客户端
├── pages/             # 页面组件
├── styles/            # 样式文件
│   ├── global.css.ts  # 全局样式
│   └── theme.css.ts   # 主题样式
├── types/             # 类型定义
│   └── api.ts         # API 类型
├── App.tsx            # 主应用组件
└── main.tsx           # 应用入口
```

## API 集成

前端通过 `/api` 代理访问后端 API，所有接口都基于 OpenAPI 规范实现。

## 构建部署

```bash
npm run build
```

构建产物在 `dist` 目录中。
