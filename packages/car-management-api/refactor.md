
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

1.  **核心认证流程迁移**:
    *   之前迁移工作中缺失的**认证层**已经完全建立。
    *   旧的 `auth.service.ts` 逻辑已迁移至 `src/modules/auth/auth.service.ts`。
    *   创建了全新的 Hono `authMiddleware` (`src/api/admin/middleware/auth.ts`)，用于保护所有 Admin API。
    *   在 `src/api/admin/index.ts` 中对路由进行了重构，分离了受保护的路由和不受保护的路由。
    *   实现了新的、不受保护的登录路由 `/api/v1/admin/auth/login`。

2.  **模块迁移 - `AdminUser` 模块**:
    *   **已完全迁移** (此模块仅存在于 admin API 中)。
    *   `admin-user.service.ts` 的业务逻辑已整合到 `src/modules/users/admin-user.service.ts`。
    *   `admin` 端的 `AdminUser` API (增删改查) 已在 `src/api/admin/features/admin-users/` 目录下完成实现，并应用了新的认证中间件和权限检查逻辑。
    *   所有相关的旧控制器、服务和路由定义均已清理。

**下一步任务 (Next Action):**

重构已接近尾声。通过检查旧的路由文件 `src/routes/admin.route.ts`，我们发现还剩下最后两个功能需要迁移：

1.  `User` (普通小程序用户管理)
2.  `Img` (获取图片上传凭证)

下一个 Agent 的任务是迁移这两个剩余的模块。

**下一个要迁移的模块是：`User` (普通用户管理)**

请严格遵循已经建立的模式来迁移 `User` 模块：

1.  **分析与创建 Service**:
    *   分析旧的 `src/controllers/admin/user.controller.ts` 和 `src/services/admin/user.service.ts` 的逻辑。
    *   在 `src/modules/users/` 中创建 `user.service.ts` 文件，并将旧 service 的逻辑迁移进去。
2.  **实现 Admin API**:
    *   在 `src/api/admin/features/` 下创建 `users` 目录。
    *   在此目录中创建 `schema.ts`, `controller.ts`, `routes.ts`。
    *   在 `controller.ts` 中实现 API 逻辑，调用新的 `user.service.ts`。
    *   在 `routes.ts` 中定义 Hono 路由。
3.  **集成路由**:
    *   将 `features/users/routes.ts` 导出的路由挂载到 `src/api/admin/index.ts` 的**受保护路由组**中。
4.  **清理旧代码**:
    *   从 `src/routes/admin.route.ts` 中移除所有与 `users` 相关的路由。
    *   删除旧的 `src/controllers/admin/user.controller.ts` 和 `src/services/admin/user.service.ts` 文件。

**下一个 Agent 的第一个具体动作是：** 请开始执行 **`User` 模块** 的迁移工作，首先从分析 `src/controllers/admin/user.controller.ts` 和 `src/services/admin/user.service.ts` 开始。


---

### **任务交接点 (Agent Handoff Point): 最终审查**

**上次任务总结:**

前一个 Agent 已经根据本文件中定义的重构计划，完成了 `User` 和 `Img` 这最后两个模块从旧 Express 架构到新 Hono 架构的迁移工作。

**已完成的工作:**

1.  **`User` 模块迁移 (Admin API):**
    *   旧的 `user.service.ts` 逻辑已迁移至 `src/modules/users/user.service.ts`。
    *   在 `src/api/admin/features/users/` 目录下创建了完整的 Hono API (controller, routes, schema)。
    *   路由已在 `src/api/admin/index.ts` 中正确挂载。

2.  **`Img` 模块迁移 (Admin API):**
    *   旧的 `qcloudCos.ts` 逻辑已迁移至 `src/modules/cloud/qcloud.service.ts`。
    *   在 `src/api/admin/features/img/` 目录下创建了 Hono API (controller, routes)。
    *   路由已在 `src/api/admin/index.ts` 中正确挂载。

3.  **代码清理:**
    *   删除了所有旧的控制器 (`user.controller.ts`, `img.controller.ts`)。
    *   删除了所有旧的服务 (`user.service.ts`)。
    *   删除了旧的路由文件 (`admin.route.ts`)。
    *   删除了旧的、现已多余的目录 (`/src/routes`, `/src/cloud`, `/src/controllers`, `/src/services`)。

**下一步任务 (Next Action): 最终代码审查**

您的任务是作为一名代码审查员（Code Reviewer），对前一个 Agent 完成的重构工作进行一次全面的、细致的审查。

**您的审查清单应包括但不限于以下几点：**

1.  **结构一致性检查:**
    *   **目录结构**: 验证最终的项目目录结构是否**严格符合**本文件开头定义的**最终目录结构**。检查 `src/api/admin/features` 和 `src/modules` 下的目录和文件命名是否规范、一致。
    *   **代码模式**: 检查新创建的 `users` 和 `img` API (`controller.ts`, `routes.ts`) 是否遵循了项目中已有的 `admin-users` 模块的编码风格和模式（例如，错误处理、从上下文获取 `tenantId` 的方式等）。

2.  **代码质量与正确性检查:**
    *   **`user.service.ts`**: 检查 `src/modules/users/user.service.ts` 的逻辑是否与旧 `services/admin/user.service.ts` 完全一致。
    *   **`qcloud.service.ts`**: 检查 `src/modules/cloud/qcloud.service.ts` 的逻辑是否与旧 `cloud/qcloudCos.ts` 完全一致。
    *   **控制器逻辑**: 审查 `users/controller.ts` 和 `img/controller.ts`。逻辑是否清晰？`tenantId` 是否被正确处理？错误处理是否完备？
    *   **路由定义**: 审查 `users/routes.ts` 和 `img/routes.ts`。Zod 验证是否正确应用？路由是否正确导出？

3.  **依赖与导入检查:**
    *   检查所有新创建的文件，确保没有错误的相对路径导入 (e.g., `../..`)。
    *   检查 `package.json`，确认 `express` 已被移除，`hono` 和 `zod` 存在。

4.  **清理工作检查:**
    *   再次确认所有在计划中应被删除的旧文件/目录都已被彻底删除，没有残留。

5.  **启动测试 (如果可能):**
    *   请提出一个可以验证项目是否能成功启动的命令 (例如 `npm run dev` 或 `pnpm dev`)。

**您的第一个具体动作是：** 请从**结构一致性检查**的第一点开始，系统地审查整个项目。


---

## 重构前后控制器文件对照表

以下是 `Express` 框架下的旧控制器文件与重构至 `Hono` 框架后新文件位置的对照表。

### 后台管理（Admin） API

| 旧文件 (位于 `/src/controllers/admin/`) | 新文件 (位于 `/src/api/admin/features/`) |
| --------------------------------------- | ---------------------------------------- |
| `admin-user.controller.ts`              | `admin-users/controller.ts`              |
| `auth.controller.ts`                    | `auth/controller.ts`                     |
| `car-category.controller.ts`            | `cars/controller.ts` (已合并)            |
| `car-trim.controller.ts`                | `cars/controller.ts` (已合并)            |
| `vehicle-scenario.controller.ts`        | `cars/controller.ts` (已合并)            |
| `img.controller.ts`                     | `img/controller.ts`                      |
| `tenant.controller.ts`                  | `tenants/controller.ts`                  |
| `user.controller.ts`                    | `users/controller.ts`                    |

### 小程序（App） API

| 旧文件 (位于 `/src/controllers/app/`) | 新文件 (位于 `/src/api/app/features/`) |
| ------------------------------------- | -------------------------------------- |
| `auth.controller.ts`                  | `auth/controller.ts`                   |
| `user.controller.ts`                  | `users/controller.ts`                  |
| `car.controller.ts`                   | `cars/controller.ts`                   |

### 服务层 (Services)

旧的 `services` 目录已被拆分和重组到新的 `modules` 目录下，按功能领域（领域驱动设计思想）进行组织。

| 旧文件 (位于 `/src/services/`)            | 新文件 (位于 `/src/modules/`)                                        | 备注                               |
| ----------------------------------------- | -------------------------------------------------------------------- | ---------------------------------- |
| `admin-user.service.ts`                   | `users/admin-user.service.ts`                                        |                                    |
| `admin/auth.service.ts`                   | `auth/auth.service.ts`                                               |                                    |
| `admin/user.service.ts`                   | `users/user.service.ts`                                              |                                    |
| `app/auth.service.ts`                     | `auth/app-auth.service.ts`                                           |                                    |
| `app/user.service.ts`                     | `users/app-user.service.ts`                                          |                                    |
| `car-category.service.ts`                 | `cars/cars.service.ts`                                               | 合并到统一的 `cars` 服务中         |
| `car-trim.service.ts`                     | `cars/cars.service.ts`                                               | 合并到统一的 `cars` 服务中         |
| `vehicle-scenario.service.ts`             | `cars/cars.service.ts`                                               | 合并到统一的 `cars` 服务中         |
| `tenant.service.ts`                       | `tenants/tenant.service.ts`                                          |                                    |

### 路由 (Routes) & 中间件 (Middleware)

旧的 `routes` 和 `middleware` 目录被完全移除。新的路由和中间件遵循 `Hono` 框架的最佳实践，被定义在各自的 `api` 功能模块中。

| 旧文件 (位于 `/src/`)         | 新的组织方式 (位于 `/src/api/`)                               | 备注                                                         |
| ----------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------ |
| `routes/admin.route.ts`       | 分散到 `admin/features/*/routes.ts` 的各个文件中              | 例如 `api/admin/features/tenants/routes.ts`                  |
| `routes/app.route.ts`         | 分散到 `app/features/*/routes.ts` 的各个文件中                | 例如 `api/app/features/cars/routes.ts`                       |
| `middleware/admin/`           | `admin/middleware/auth.ts`                                    | 权限等中间件逻辑已直接整合进新的 `controller` 或 `middleware` |
| `middleware/app/`             | `app/middleware/auth.ts`                                      | 认证逻辑重构                                                 |

### 工具库与其他 (Utilities & Others)

| 旧文件 (位于 `/src/`)     | 新文件 (位于 `/src/lib/`) | 备注                                 |
| ------------------------- | ------------------------- | ------------------------------------ |
| `db/client.ts`            | `db.ts`                   |                                      |
| `utils/transform.ts`      | `transform.ts`            |                                      |
| `utils/tenant-id.ts`      | (被移除)                  | 逻辑已整合到中间件和控制器中         |
| `types/typeHelper.ts`     | `typeHelper.ts`           |                                      |
| `types/interface.ts`      | (被移除)                  | 由各功能模块下的 Zod `schema.ts` 代替 |
| `cloud/qcloudCos.ts`      | `oss-sts.ts`              | 与阿里云 OSS 功能合并                |
| `cloud/aliyunOss.ts`      | `oss-sts.ts`              | 与腾讯云 COS 功能合并                |
| `wechat/client.ts`        | `wechat.ts`               |                                      |
