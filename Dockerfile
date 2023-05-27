FROM nginx:latest

LABEL MAINTAINER="heart<7362469@qq.com>"

COPY dist/ /opt/cc-hearts/

COPY default.conf /etc/nginx/conf.d/default.conf
