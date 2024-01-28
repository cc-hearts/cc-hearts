---
title: 字符编码
date: 2023-12-08
articleId: 29fe600a-c035-4ae0-b5c5-70f23d61678c
---

# 字符编码

符号的字节大小取决于具体的编码方案。在 ASCII 码中，英文标点符号和中文标点符号都占用一个字节。在其他编码方案如 UTF-8 和 Unicode 中，中文标点符号通常占用更多的字节。

- 在 ASCII 码中，一个英文字母占用一个字节，但无法表示中文字符。
- 在 UTF-8 编码中，一个英文字母占用一个字节，一个中文字符通常占用三个字节。UTF-8 编码使用可变长度编码方案。
- 在 Unicode 编码中，一个英文字母通常占用一个字节，一个中文字符的字节数取决于具体的编码方案。在常见的编码方案如 UTF-8 和 UTF-16 中，中文字符通常占用两个字节或更多。
- 在 UTF-16 编码中，一个英文字母字符或一个汉字字符通常占用两个字节，但并非所有汉字字符都占用四个字节。某些 Unicode 扩展区的汉字字符可能需要四个字节来存储。
- 在 UTF-32 编码中，世界上任何字符的存储都需要四个字节。UTF-32 使用固定长度编码方案，每个字符占用四个字节。

## 进制转换

在了解完常用的字符编码后，还需要了解进制之间的转换。

本文以 javaScript 语言进行进制的代码转换。

### 其余进制转 10 进制

`Number()` 可以将其他进制的数字转化成 10 进制

```js
Number(0x12) // 18
Number(0o12) // 10
Number(0b1001) // 9
```

### 10 进制转其他进制

`Number.prototype.toString(radix)` 支持将 10 进制转换为 2~36 进制

## utf8

UTF-8 编码是一种用于表示 Unicode 字符的编码方式，它使用 1 到 4 个字节来表示一个字符。UTF-8 编码的 16 进制表示方法如下：

> 一字节等于 8 bit

![image_1706451375641.png](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2024-01-28/image_1706451375641.png)

这里以 `中` 字举例，它的 unicode 编码是 `4E2D`，这个范围在 `0x000800` - `0x00ffff` 中，因此会占 3 个字节，转换为 2 进制表示为：

```js
;(0x4e2d).toString(2) // 0x4E2D 转换为2进制有15位 但是补充维 encoding 需要16位 因此前置添0 '0100 111000 101101'
```

填充到第三个规则中，则二进制是

```js
11100100 10111000 10101101
// 转换为 16进制则是
// E4 B8 AD
```

因此结果 `E4 B8 AD` 就是表示为 unicode 编码中的 `中` 字

> 使用 node 验证：

```js
Buffer.from('中') // <Buffer e4 b8 ad>
```

完整转换函数如下：

```js
// 16进制转10进制
function utf16ToNumber(utf16) {
  return Number.parseInt(utf16, 16)
}
// 10进制转2进制
function numberTo2Int(number) {
  return Number(number).toString(2)
}

function int2ToUtf8(number) {
  const int2 = numberTo2Int(number)
  // 判断字段的边界情况
  let result = []
  let num,
    regExp = /(?=(?:\d{6})+$)/
  if (number > 0x10ffff || number < 0x000000) {
    throw Error('number invalid')
  } else if (number > 0x000000 && number <= 0x7f) {
    // 0xxxxxxx
    result.push(Number.parseInt(String(int2).padStart(8, '0'), 2))
  } else if (number > 0x7f && number <= 0x07ff) {
    //  110xxxxx 10xxxxxx
    num = String(int2).padStart(11, '0')
  } else if (number > 0x07ff && number <= 0xffff) {
    // 1110xxxx 10xxxxxx 10xxxxxx
    num = String(int2).padStart(16, '0')
  } else {
    // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
    num = String(int2).padStart(21, '0')
  }
  if (num) {
    result = num.split(regExp).map((val) => {
      const in2 =
        val.length === 3
          ? `11110${val}`
          : val.length === 4
          ? `1110${val}`
          : val.length === 5
          ? `110${val}`
          : `10${val}`
      return Number(in2, 2)
    })
  }
  return result.map((val) => Number(`0b${val}`).toString(16))
}

// unicode 编码转成16进制的方式
function unicodeToBuffer(string) {
  const str = escape(string)
  let number = 0
  if (/%u/.test(str)) {
    // 10 进制的number
    number = utf16ToNumber(str.split(/\u/).slice(-1))
  } else {
    number = str.charCodeAt(0)
  }
  // 10进制转成16进制的utf8
  return int2ToUtf8(number)
}
```

## 参考资料

- <https://zhuanlan.zhihu.com/p/51202412>
- <https://www.ruanyifeng.com/blog/2007/10/ascii_unicode_and_utf-8.html>
