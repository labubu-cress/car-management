# goal
现在要添加一个产品功能，某些 trim 的当前价格，在微信端显示的时候，要显示“具体价格联系我们”之类的文字（具体文字由管理后台去填写）

# task A (completed)
更新 schema, 运行 prisma dev

# task B (completed)
更新app 与 admin 后端代码, 及相关测试

# task C (completed)
跟新 openapi.json

# task D
更新 管理后台前端：
1.填写 trim 价格的时候，不新增 input 框，原来输入当前价格的input ,支持输入文字
2.trims 表格也不新增列，如果有priceOverrideText ，就显示该文字