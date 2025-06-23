# gaol

car-category 要添加一个属性 isArchived， 业务含义如下：
car-category 的 isArchived 永远通过统计 car-trim 的 isArchied 属性来计算得到。
如果用户想要修改 car-category 的 isArchived, 其实是通过修改 所有 car-trim 的 isArchied 属性来实现的。

# task A

确认是否不需要修改 prisma schema，如果不需要修改，则自动执行 task B

# task B

实现后端的相关逻辑，并编写测试，并确保能执行通过。

# task C

实现管理后台前端的相关逻辑
