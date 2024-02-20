---
title: Base for mac
date: 2024-01-22
articleId: 523bbf5c-73a1-41b3-9147-1273d4b0e030
---

# Base for mac

## Mac 压缩文件

## rarosx

```powershell
unrar x 文件名
```

## Vim 编辑文件

1. 键盘输入【i】进入编辑状态，开始并完成内容修改
2. 点击【esc】退出编辑状态，此时无法对内容进行修改
3. 键盘输入【：wq！】强制保存并退出 vim，回到终端的界面

## mac Clash X 代理终端

```shell
export https_proxy=http://127.0.0.1:7890
export http_proxy=http://127.0.0.1:7890
export all_proxy=socks5://127.0.0.1:7891
##上面的三行命令表示,每次新建一个终端会话时,默认让终端去走代理,这样就不需要每次都复制拷贝一下了,很方便,同时,代理程序去智能分流(国内 IP 直连,国外走代理)，避免了连接国内 IP 地址时“绕远”.

alias setproxy="export https_proxy=http://127.0.0.1:7890;export http_proxy=http://127.0.0.1:7890;export all_proxy=socks5://127.0.0.1:7891;echo \"Set proxy successfully\" "
alias unsetproxy="unset http_proxy;unset https_proxy;unset all_proxy;echo \"Unset proxy successfully\" "
alias ipcn="curl myip.ipip.net"
alias ip="curl ip.sb"

## 上面这几个 alias 是自定义的命令

## unsetproxy 取消代理

## setproxy 设置代理

## ip & ipcn 查看 终端IP & 实际IP

```

## zsh

zsh 的配置文件不再是/.zsh_profile 去调用/.zshrc，而是直接就是/.zshrc 就可以了。所以对于 zsh 的一切设置，直接去/.zshrc 中设置。

Homebrew 镜像

## mac 终端提示 Permission denied

解决方式：
修改 data 目录的访问权限，自己的电脑，给最高权限就行：sudo [chmod](https://so.csdn.net/so/search?q=chmod&spm=1001.2101.3001.7020) -R 777 赋权目录

```shell
sudo chmod -R 777 /usr/local/mysql/data/
```

## 删除命令

rmdir 删除空目录，不过一旦目录非空会提示
使用 rm 既可以删除文件又可以删除文件夹
删除文件夹 (无论文件夹是否为空)，使用 -rf 命令即可。
即：rm -rf 目录名字
\-r 就是向下递归，不管有多少级目录，一并删除
\-f 就是直接强行删除，不作任何提示的意思

> 使用这个 rm -rf 的时候一定要格外小心，linux 没有回收站的，删除之后再想找回就很难了

## 常用指令集

```shell
find 文件路径 参数
```

查找名字中包含 detail 的文件

```shell
find ~ -iname 'detail*'
```

```shell
mdfind -name 文件名字
```

## 参考资料

[快速操作删除](https://www.duotin.com/ios/27361.html)
