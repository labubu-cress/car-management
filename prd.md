# task

根据下面的指导，完成 /api/v1/app/resolve-tenant
```md
创建一个新的全局API接口
在后端创建一个新的、无需租户ID和用户认证的API接口，例如 GET /api/v1/app/resolve-tenant。该接口通过小程序自身的 appId 来查询对应的 tenantId。

代码示例 (可以放在 packages/car-management-api/src/api/app/features/ 下的新目录中):

TypeScript

import { Hono } from 'hono';
import { prisma } from '@/lib/db';

const app = new Hono();

app.get('/resolve-tenant', async (c) => {
  const wechatAppId = c.req.query('appId');
  if (!wechatAppId) {
    return c.json({ message: 'appId is required' }, 400);
  }

  const tenant = await prisma.tenant.findUnique({
    where: { appId: wechatAppId },
    select: { id: true } // 只返回 tenantId 即可
  });

  if (!tenant) {
    return c.json({ message: 'Tenant not found' }, 404);
  }

  return c.json({ tenantId: tenant.id });
});

export default app;
别忘了在 packages/car-management-api/src/api/app/index.ts 中注册这个新的路由。

改造小程序启动逻辑

小程序启动时，调用微信的 wx.getAccountInfoSync() API 来获取自身 appId。
使用获取到的 appId 调用上面创建的 GET /api/v1/app/resolve-tenant 接口。
获取到后端返回的 tenantId 后，将其存储在小程序的全局状态或本地缓存中。
之后的所有业务API请求，都带上这个动态获取的 tenantId。
```


