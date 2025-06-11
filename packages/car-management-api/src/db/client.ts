import { Prisma, PrismaClient } from "@prisma/client";

// 创建一个共享的 PrismaClient 实例
export const prisma = new PrismaClient();

const tenantModels: Prisma.ModelName[] = ["CarTrim", "CarCategory", "VehicleScenario", "User"];

// 定义一个函数来创建带租户上下文的 Prisma Client 扩展实例
export function createTenantPrismaClient(tenantId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        $allOperations({ model, operation, args, query }) {
          if (!model || !tenantModels.includes(model)) {
            return query(args);
          }

          const newArgs = args as any;

          if (operation === "create") {
            newArgs.data = { ...newArgs.data, tenant: { connect: { id: tenantId } } };
          } else if (operation === "createMany" && newArgs.data) {
            if (Array.isArray(newArgs.data)) {
              newArgs.data = newArgs.data.map((item: any) => ({ ...item, tenantId }));
            }
          } else if (operation === "upsert") {
            newArgs.create = { ...newArgs.create, tenant: { connect: { id: tenantId } } };
          }

          if (
            [
              "findUnique",
              "findUniqueOrThrow",
              "findFirst",
              "findFirstOrThrow",
              "findMany",
              "update",
              "updateMany",
              "delete",
              "deleteMany",
              "count",
              "aggregate",
              "groupBy",
              "upsert",
            ].includes(operation)
          ) {
            if (newArgs.where) {
              newArgs.where = { AND: [newArgs.where, { tenantId }] };
            } else {
              newArgs.where = { tenantId };
            }
          }

          return query(newArgs);
        },
      },
    },
  });
}
