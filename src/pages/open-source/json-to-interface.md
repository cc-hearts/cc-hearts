---
title: json-to-interface 源码解析
date: 2023-06-15
---

```ts
export default function JsonToTS(json: any, userOptions?: Options): string[] {
  const defaultOptions: Options = {
    rootName: 'RootObject',
  }
  const options = {
    ...defaultOptions,
    ...userOptions,
  }

  /**
   * Parsing currently works with (Objects) and (Array of Objects) not and primitive types and mixed arrays etc..
   * so we shall validate, so we dont start parsing non Object type
   */
  // 判断是否是纯对象数组
  const isArrayOfObjects =
    isArray(json) &&
    json.length > 0 &&
    json.reduce((a, b) => a && isObject(b), true)

  // 如果不是纯对象数组或者是 对象 抛出异常
  if (!(isObject(json) || isArrayOfObjects)) {
    throw new Error('Only (Object) and (Array of Object) are supported')
  }

  // 获取类型结构
  const typeStructure = getTypeStructure(json)
  /**
   * due to merging array types some types are switched out for merged ones
   * so we delete the unused ones here
   */
  optimizeTypeStructure(typeStructure)

  const names = getNames(typeStructure, options.rootName)

  return getInterfaceDescriptions(typeStructure, names).map(
    getInterfaceStringFromDescription
  )
}
```

```ts
export function getTypeStructure(
  targetObj: any, // object that we want to create types for
  types: TypeDescription[] = []
): TypeStructure {
  switch (getTypeGroup(targetObj)) {
    case TypeGroup.Array:
      const typesOfArray = (<any[]>targetObj)
        .map((_) => getTypeStructure(_, types).rootTypeId)
        .filter(onlyUnique)
      const arrayInnerTypeId = getInnerArrayType(typesOfArray, types) // create "union type of array types"
      const typeId = getIdByType([arrayInnerTypeId], types) // create type "array of union type"

      return {
        rootTypeId: typeId,
        types,
      }

    case TypeGroup.Object:
      const typeObj = createTypeObject(targetObj, types)
      const objType = getIdByType(typeObj, types)

      return {
        rootTypeId: objType,
        types,
      }

    case TypeGroup.Primitive:
      return {
        rootTypeId: getSimpleTypeName(targetObj),
        types,
      }

    case TypeGroup.Date:
      const dateType = getSimpleTypeName(targetObj)

      return {
        rootTypeId: dateType,
        types,
      }
  }
}
```

```ts
function getTypeGroup(value: any): TypeGroup {
  if (isDate(value)) {
    return TypeGroup.Date
  } else if (isArray(value)) {
    return TypeGroup.Array
  } else if (isObject(value)) {
    return TypeGroup.Object
  } else {
    return TypeGroup.Primitive
  }
}
```

```ts
// 数组唯一值的判断写法。
array.filter((val, index, self) => self.indexOf(val) === index)
```

```ts
// 判断是否不是联合类型
function isNonArrayUnion(typeName: string) {
  const arrayUnionRegex = /^\(.*\)\[\]$/
  return typeName.includes(' | ') && !arrayUnionRegex.test(typeName)
}
```
