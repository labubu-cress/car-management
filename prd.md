# gaol

需要微信小程序faq 的配置做调整

```diff
diff --git a/packages/car-management-api/prisma/schema.prisma b/packages/car-management-api/prisma/schema.prisma
index e0424c5..f31ac12 100644
--- a/packages/car-management-api/prisma/schema.prisma
+++ b/packages/car-management-api/prisma/schema.prisma
@@ -175,6 +175,7 @@ model Faq {
   id        String   @id @default(cuid())
   question  String
   answer    String   @db.Text
+  icon      String
   tenantId  String
   tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
   createdAt DateTime @default(now())
```

上面是 schema 的修改，已经 prisma generate 和 migrate dev 过了

# task A

实现后端的相关逻辑，并编写测试，并确保能执行通过。

# task B

实现管理后台前端的相关逻辑
