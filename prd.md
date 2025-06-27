# goal
后台管理系统需要增加一个角色，该角色创建的时候，会绑定到某个租户，并且：
1. 该角色只能查看所属租户下的东西
2. 该角色只有只读权限
3. 该角色的权限肯定要小于 admin

# taskA （completed)
修改 schema.prisma, 并运行 migrate dev

# task B (partail)
修改 admin 的后端代码与相关测试 

# task C
更新 管理后台前端

