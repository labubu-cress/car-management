# gaol

需要微信小程序首页调整配置参数

```diff
 model HomepageConfig {
-  id                 String   @id @default(cuid())
-  tenantId           String   @unique
-  tenant             Tenant   @relation(fields: [tenantId], references: [id])
-  welcomeTitle       String?
-  welcomeDescription String?
-  bannerImage        String
-  benefitsImage      String
-  createdAt          DateTime @default(now())
-  updatedAt          DateTime @updatedAt
+  id              String   @id @default(cuid())
+  tenantId        String   @unique
+  tenant          Tenant   @relation(fields: [tenantId], references: [id])
+  firstTitle      String
+  firstTitleIcon  String
+  secondTitle     String
+  secondTitleIcon String
+  bannerImage     String
+  benefitsImage   String
+  createdAt       DateTime @default(now())
+  updatedAt       DateTime @updatedAt
 }

上面是 schema 的修改，已经 prisma generate 和 migrate dev 过了，现在修改后端代码相关的部分，并编写测试，
```

# task A

实现后端的相关逻辑，并编写测试，并确保能执行通过。

# task B

实现管理后台前端的相关逻辑
