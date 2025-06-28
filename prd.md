# goal

微信小程序的 appid 与 appsecret 之前是从环境变量读的，只支持一个小程序，这个设计并不合理。
每个租户创建的时候，都会填写 appid 与 appsecret ，所以应该从数据库去读，并且要支持多个小程序。

# task A （completed）

先整理一个修改计划。放到 plan.md

# task B

按照 plan.md 修改后端代码与相关测试
