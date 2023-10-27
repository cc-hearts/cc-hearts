---
title: nginx 配置 https
date: 2023-10-25
articleId: a8c0e966-f327-468f-a09c-9883b6961e92
---

`nginx` 配置 `https` 需要 `SSL` 证书

## Docker 配置 SSL 证书

> 证书需要提前申请好，例如 [阿里云 SSL 证书申请](https://www.aliyun.com/product/cas?source=5176.11533457&userCode=ywqc0ubl&type=copy)

`Dockerfile` 配置如下

```txt
FROM nginx:latest

LABEL MAINTAINER="cc heart"

COPY dist/ /opt/cc-hearts/

# 将 SSL 证书复制到 nginx下的指定目录中，后续在 default.conf 中会用到
COPY ssl.pem /etc/nginx/ssl/
COPY ssl.key /etc/nginx/ssl/

COPY default.conf /etc/nginx/conf.d/default.conf
```

对于 `default.conf`, 需要配置如下

```conf
  server {
    # https 默认走 443
    listen 443 ssl;
    server_name  www.cc-heart.cn;
    # 证书路径就是 Dockerfile 中指定的路径
    ssl_certificate /etc/nginx/ssl/ssl.pem;
    ssl_certificate_key /etc/nginx/ssl/ssl.key;

    #charset koi8-r;
    access_log  /var/log/nginx/host.access.log  main;
    error_log  /var/log/nginx/error.log  error;

    location / {
        root   /opt/cc-hearts;
        index  index.html index.htm;
        try_files $uri $uri/ /index.html =404;
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   html;
    }
}

# 对于 http 可以做一层重定向转发到 https
server {
    listen 80;
    server_name  www.cc-heart.cn;
    return 301 https://$server_name$request_uri;
}
```

## 参考资料

- <https://segmentfault.com/a/1190000022673232>
