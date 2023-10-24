FROM nginx:latest

LABEL MAINTAINER="heart<7362469@qq.com>"

COPY dist/ /opt/cc-hearts/

COPY ssl.pem /etc/nginx/ssl/
COPY ssl.key /etc/nginx/ssl/

COPY default.conf /etc/nginx/conf.d/default.conf
