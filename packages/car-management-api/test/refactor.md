# 测试文件重构指南

## 背景

随着项目功能的不断迭代，单个功能的测试文件（例如 `car-categories.test.ts`）可能会变得越来越庞大和复杂。这会导致可读性下降、维护成本增高。为了解决这个问题，我们引入了测试文件重构策略。

## 核心思想

将一个庞大的测试文件，按照其内部逻辑功能模块，拆分成多个更小、更专注的测试文件。

## 重构步骤 - 以 `car-categories.test.ts` 为例

我们以 `car-categories.test.ts` 的重构过程为例，来说明具体的实施步骤。

### 1. 分析功能模块

首先，通读并分析目标测试文件，识别出可以独立拆分的功能模块。在 `car-categories.test.ts` 中，我们识别出以下三个主要模块：

- **基础增删改查 (CRUD) 与排序**: 包含了对车系资源的创建、读取、更新、删除以及排序功能。
- **归档 (Archive) 逻辑**: 包含了 `isArchived` 状态的计算、级联更新等相关测试。
- **角色权限控制 (RBAC)**: 包含了对不同角色（如 `TENANT_VIEWER`）操作车系资源的权限测试。

### 2. 创建新的目录结构

为了更好地组织拆分后的文件，我们在 `test/features/admin/` 目录下创建一个与功能同名的子目录。

```bash
mkdir -p packages/car-management-api/test/features/admin/car-categories
```

### 3. 拆分测试文件

将原文件中的测试用例，按照第一步划分的模块，分别移动到新的文件中。

-   `crud.test.ts`: 存放 CRUD 和排序相关的测试。
-   `archive.test.ts`: 存放归档逻辑相关的测试。
-   `rbac.test.ts`: 存放角色权限相关的测试。

在拆分过程中，需要注意：

-   为每个新文件添加必要的 `import` 语句。
-   确保 `beforeEach` 等钩子函数在新文件中依然能正常工作。
-   调整新文件的相对路径引用（例如 `import from '../../../helper'`）。
-   为每个文件的 `describe` 块起一个清晰、有意义的名字。

### 4. 运行与验证

拆分完成后，需要进行严格的测试验证。

1.  **运行新拆分的测试**: 进入 `packages/car-management-api` 目录，单独运行新创建的测试文件，确保它们全部通过。

    ```bash
    cd packages/car-management-api
    npm run test -- test/features/admin/car-categories/
    ```

2.  **删除旧文件**: 在新测试全部通过后，安全地删除原始的、庞大的测试文件。

3.  **运行全部测试**: 再次运行项目的所有测试，确保本次重构没有对其他模块造成意外的破坏。

    ```bash
    npm run test
    ```

## 未来展望

当发现其他测试文件也变得臃肿时，可以遵循此指南进行重构，以保持测试代码库的整洁、清晰和高可维护性。 