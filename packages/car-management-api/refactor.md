
### **任务：重构 car-management-api 项目**

**1. 项目背景与核心目标**

您好！这是一个 AI 任务接力。您的任务是继续一个 `car-management-api` 后端项目的重构工作。

*   **项目位置**: `packages/car-management-api` (在一个 monorepo 中)
*   **当前技术栈**: Node.js, Express
*   **目标技术栈**: Node.js, **Hono**, **Zod**
*   **核心需求**:
    1.  将后端框架从 Express 迁移到 Hono。
    2.  引入 Zod 进行所有 API 的请求 schema 验证。
    3.  对项目进行目录结构重构，采用"功能模块化"的最佳实践。
    4.  **关键设计要求**: 新的目录结构必须能够让未来的**小程序后端 (`app`)** 和 **管理后台后端 (`admin`)** 轻松拆分成两个独立的应用。

**2. 已分析的文件**

我们已经分析了以下文件来理解现有业务逻辑：
*   `packages/car-management-api/src/routes/admin.route.ts`
*   `packages/car-management-api/src/routes/app.route.ts`

分析结论是，API 分为 `admin` 和 `app` 两大块，它们共享了部分业务逻辑（如汽车信息查询），但也有各自独立的功能（如租户管理仅限 admin）。

**3. 最终确定的目录结构**

这是我们共同确定的、为未来拆分而设计的最佳目录结构。**请严格遵循此结构进行重构**。

```
src/
├── index.ts                 # 应用主入口 (Hono 初始化, 挂载 admin 和 app 路由)
├── lib/                     # 共享库 (db, 云服务 Sdk, etc.)
│   ├── db.ts
│   └── ...
├── middleware/              # 共享中间件 (e.g. logger)
│   └── ...
├── modules/                 # ✨ 核心业务功能模块 (可被 admin 和 app 共享) ✨
│   ├── users/               # 用户模块 (包含基础的用户服务)
│   │   ├── user.service.ts
│   │   └── user.types.ts
│   ├── cars/                # 汽车模块 (包含汽车相关的业务服务)
│   │   ├── cars.service.ts
│   │   └── cars.types.ts
│   └── ...                  # 其他共享模块，如 tenants
│
├── api/                     # ✨ API 层 (严格分离 admin 和 app) ✨
│   ├── admin/               # --- 所有管理后台的代码 ---
│   │   ├── index.ts         # 聚合所有 admin 路由并导出
│   │   ├── middleware/      # admin 专属中间件 (e.g., permissionCheck)
│   │   └── features/        # admin 的功能实现
│   │       ├── auth/
│   │       ├── cars/
│   │       └── ...
│   └── app/                 # --- 所有小程序端的代码 ---
│       ├── index.ts         # 聚合所有 app 路由并导出
│       ├── middleware/      # app 专属中间件
│       └── features/        # app 的功能实现
│           ├── auth/
│           ├── cars/
│           └── ...
```

**4. 详细的迁移计划**

请严格按照以下分阶段计划执行：

*   **阶段一：基础建设**
    1.  **管理依赖**: 在 `packages/car-management-api/package.json` 中添加 `hono`, `@hono/zod-validator`, `zod`；移除 `express` 和 `@types/express`。
    2.  **创建新目录**: 根据第 3 点的规划，创建所有新的文件夹结构。
    3.  **配置 Hono 入口**: 重构 `src/index.ts`，用 Hono 替换 Express，并设置好从 `api/admin/index.ts` 和 `api/app/index.ts` 导入路由，分别挂载到 `/api/v1/admin` 和 `/api/v1/app`。
    4.  **迁移共享库**: 将数据库初始化逻辑（例如 Prisma Client）移至 `src/lib/db.ts`。

*   **阶段二：模块迁移 (逐个业务领域进行)**
    *   以一个模块（例如 **Cars**）为例，迁移步骤如下：
        1.  在 `modules/cars/` 中创建 `cars.service.ts`，将原 `services` 目录中相关的数据库操作逻辑剥离并整合进去。
        2.  在 `api/admin/features/cars/` 中创建 `routes`, `controller`, `schema` 文件，实现管理后台的汽车管理 API，并调用 `modules/cars/cars.service.ts`。使用 Zod 验证所有 Create/Update 请求。
        3.  在 `api/app/features/cars/` 中创建 `routes`, `controller`, `schema` 文件，实现小程序端的汽车查询 API，同样调用 `modules/cars/cars.service.ts`。
    *   按此模式，逐个迁移 `auth`, `users`, `tenants` 等所有功能。

*   **阶段三：清理和收尾**
    1.  删除所有旧的 `controllers/`, `routes/`, `services/` 目录。
    2.  最终审查，确保所有 API 端点行为与之前一致。

**5. 当前状态与下一步行动**

我们刚刚完成了规划阶段。您的任务是从 **阶段一：基础建设** 的第一步开始执行。

**您的第一个动作是：** 请开始执行 **阶段一** 的第 1 步：**管理依赖项**。


---

### **任务交接点 (Agent Handoff Point)**

**上次任务总结:**

前一个 Agent 已经完成了以下工作：

1.  **基础建设**:
    *   项目依赖已更新，添加了 `hono`, `@hono/zod-validator`, `@hono/node-server`，并移除了 `express`。
    *   已根据 `refactor.md` 的规划创建了全新的目录结构 (`src/api`, `src/modules`, `src/lib` 等)。
    *   `src/index.ts` 已重构为 Hono 应用入口，并配置好了 admin 和 app 的路由挂载。
    *   数据库 Prisma Client 初始化逻辑已迁移至 `src/lib/db.ts`。
2.  **模块迁移 - `Cars` 模块**:
    *   **已完全迁移**。
    *   所有与汽车相关的业务逻辑 (CarCategory, CarTrim, VehicleScenario) 已整合到 `src/modules/cars/cars.service.ts`。
    *   `admin` 端 API (增删改查) 已在 `src/api/admin/features/cars/` 目录下完成实现。
    *   `app` 端 API (查询) 已在 `src/api/app/features/cars/` 目录下完成实现。
    *   所有相关的旧控制器 (`car-*.controller.ts`) 和路由定义都已从旧的 `controllers` 和 `routes` 目录中清理。
3.  **模块迁移 - `Tenants` 模块**:
    *   **已完全迁移** (此模块仅存在于 admin API 中)。
    *   旧的 `tenant.service.ts` 的业务逻辑已整合到 `src/modules/tenants/tenant.service.ts`。
    *   `admin` 端的 `Tenants` API (增删改查) 已在 `src/api/admin/features/tenants/` 目录下，使用 Hono、Zod 和新的 Service 完成了实现。
    *   新的租户路由已挂载到 `src/api/admin/index.ts`。
    *   所有相关的旧控制器 (`tenant.controller.ts`) 和路由定义都已从旧的 `controllers` 和 `routes` 目录中清理。

**下一步任务 (Next Action):**

下一个 Agent 的任务是从 `refactor.md` 规划的下一个模块开始，继续进行迁移。

**下一个要迁移的模块是：`AdminUser` (管理员用户管理)**

请严格遵循已经建立的模式来迁移 `AdminUser` 模块 (注意：此模块也仅存在于 admin API 中)：

1.  **创建 Service**:
    *   在 `src/modules/users/` 中创建 `admin-user.service.ts` 文件。
    *   将旧的 `src/services/admin-user.service.ts` 中的逻辑迁移到新的 service 文件中，并进行必要的调整 (如导入路径)。
2.  **实现 Admin API**:
    *   在 `src/api/admin/features/` 下创建 `admin-users` 目录。
    *   在此目录中创建 `schema.ts`, `controller.ts`, `routes.ts`。
    *   使用 Zod 在 `schema.ts` 中定义创建和更新 AdminUser 的验证规则 (注意处理密码字段)。
    *   在 `controller.ts` 中实现 API 逻辑，并调用 `modules/users/admin-user.service.ts`。
    *   在 `routes.ts` 中定义 Hono 路由。
3.  **集成路由**:
    *   将 `features/admin-users/routes.ts` 导出的路由挂载到 `src/api/admin/index.ts` 中。
4.  **清理旧代码**:
    *   从 `src/routes/admin.route.ts` 中移除所有与 `admin-users` 相关的路由。
    *   删除旧的 `src/controllers/admin/admin-user.controller.ts` 文件。

**下一个 Agent 的第一个具体动作是：** 请开始执行 **`AdminUser` 模块** 的迁移工作，首先从分析 `src/controllers/admin/admin-user.controller.ts` 和 `src/services/admin-user.service.ts` 开始，以准备创建新的 `src/modules/users/admin-user.service.ts`。


---
