---
title: typeOrm 使用
---

## 时间范围筛选

```ts
if (updateTimeRange && updateTimeRange.start && updateTimeRange.end) {
  qb = qb.andWhere('update_time BETWEEN :start AND :end', {
    start: updateTimeRange.start,
    end: updateTimeRange.end,
  })
}
```

## IN 筛选

```ts
return this.privilegeRepository
  .createQueryBuilder()
  .select('*')
  .where(`path IN (:...pathList)`, { pathList })
  .execute()
```

## 排序

```ts
// 普通排序
qb = qb.orderBy('update_time', 'DESC')

// 自定义条件，且多重排序
// 例如：assignee字段为 ${userName} 的优先显示,然后再在此基础上再进行时间和状态的排序
qb = qb
  .orderBy(`case assignee when assignee="${userName}" then 1 else 0 end`)
  .addOrderBy('status', 'ASC')
  .addOrderBy('update_time', 'DESC')
```

## 批量插入

```ts
await this.courseTeacherRepository
  .createQueryBuilder()
  .insert()
  .into(CourseTeacher)
  .values(values)
  .execute()
```

## 模糊查询

> 需要将 `%%` 写在 `where` 的`parameters`参数中

```ts
repository.where('course_name like :courseName', {
  courseName: `%${courseName}%`,
})
```

## 实体类表达式的使用

```ts
  @Column({
    type: 'datetime',
    name: 'update_time',
    comment: '更新时间',
    // 可以使用() => 'xxx' 使用sql的表达式
    default: () => 'CURRENT_TIMESTAMP',
  })
  updateTime: Date
```

## 参考资料

- [nestjs type Orm 条件筛选、排序、分页 常见查询功能的实现](https://blog.csdn.net/landiyaaa/article/details/104730677)
