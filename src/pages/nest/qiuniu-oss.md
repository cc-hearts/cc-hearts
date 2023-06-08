---
title: 七牛云的oss对接
---

安装七牛云的 sdk

```shell
pnpm i qiniu
```

```ts
interface option {
  scope: string
  expires: number
}

export function generatorUploadToken(accessKey, secretKey, options: option) {
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
  const putPolicy = new qiniu.rs.PutPolicy(options)
  return putPolicy.uploadToken(mac)
}

export function generatorFilePath(
  accessKey,
  secretKey,
  privateBucketDomain,
  fileName,
  // 默认 1小时过期
  deadline = parseInt(String(Date.now() / 1000)) + 3600
) {
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
  const config = new qiniu.conf.Config()
  //服务器地址
  Reflect.set(config, 'zero', qiniu.zone.Zone_z2)
  const bucketManager = new qiniu.rs.BucketManager(mac, config)
  // bucketManager.privateDownloadUrl(privateBucketDomain, key, deadline)
  return bucketManager.privateDownloadUrl(
    privateBucketDomain,
    fileName,
    deadline
  )
}
```
