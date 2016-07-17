title: Hexo搭建个人博客
date: 2014-05-24 14:38:03
tags: ['hexo']
---


　　一直想搭建一个自己的博客来记录自己的一些学习笔记，由于是学生党经济上有些吃紧所以一直没办法搭建起自己的博客。最近在网上无意中看到了可以借助GitHub来搭建自己的个人博客，于是就折腾了起来。我搭建博客用到的是GitHub+Hexo的搭配，下面就让我来介绍下我的博客搭建的整个过程。
<!--more-->
# Hexo
　　Hexo是一个基于Node.js的快速简单的静态博客框架，利用它通过简单的几个命令就可以搭建一个个人博客。

> A fast, simple & powerful blog framework,powered by Node.js.

# 安装Hexo
　　我是在Windows上面进行搭建的，所以我这里就介绍下Windows上面的安装方法。安装Hexo首先需要下面两个条件:
　　- Node.js
　　- Git
　　这两个的安装方法大家Google下就好了，一堆堆的。有了这些我们就可以利用npm命令来安装hexo了。
```shell
    npm install hexo -g
```
　　安装完hexo之后可以开始初始化博客了。
　　
# 初始化博客
　　初始化Hexo博客只需要进入博客目录，然后执行下面这条命令就可以了
```shell
    hexo init
```
# 生成博客
 　　初始化博客之后博客目录下会产生一些配置文件和模板文件，现在就要利用这些模板文件来生成我们的静态博客文件，通过下面这条命令就可以生成我们的博客
```shell
    hexo generate
```
　　执行完命令之后，在博客目录下会产生一个public文件夹，这里面存放的就是我们的博客静态文件。
# 本地部署
　　生成博客之后我们就可以开始在本地部署我们的博客
```shell
    hexo server
```
　　现在我们打开浏览器访问http://localhost:4000  就可以看到我们的博客了。
# 部署到GitHub
　　通过上面这些步骤我们只是在本地搭建起了博客，要让别人看到还需要把它部署到GitHub上。
　　首先，当然是需要申请一个GitHub账号，然后新建一个Repository，接着在命名的时候需要注意，GitHubPage的名字必须用户名.github.com或者用户名.github.io。
　　创建完Repository之后，我们要配置Hexo的github地址然后才可以把我们的博客部署到GitHub上面。在博客目录底下打开_congig.yml，这就是Hexo的配置文件。找到下面这段代码
```yaml
    # Deployment
    ## Docs: http://hexo.io/docs/deployment.html
    deploy:
    type:
```
　　把上面的内容替换成你刚才创建的Repository地址，如下:
```yaml
    # Deployment
    ## Docs: http://hexo.io/docs/deployment.html
    deploy:
    type: github
    repository: https://github.com/用户名/用户名.github.io.git
    branch: master
```
　　创建Repository并且修改配置文件之后我们就可以把我们的博客部署到GitHub上面了，通过下面这个命令，过程中需要输入Git账号和密码:
```shell
    hexo deploy
```
　　打开浏览器访问http://用户名.github.com 或者 http://用户名.github.io ，部署之后大约十分钟就可以看到博客效果了。
# 配置博客
　　通过上面的步骤我们完成了博客的基本搭建工作，我们还可以通过修改配置文件来进行博客的个性化定制。
　　
　　首先是***博客的标题以及作者***，通过修改_congig.yml中相应的字段就可以设置标题和作者，如下:

```yaml
    # Site
    title: <h1>My Coding Life</h1> //标题
    subtitle: Better Wife , Better Life //副标题
    description: Better Wife , Better Life //描述内容
    author: Bin //作者
    email: lakb248@163.com //邮箱
    language: zh-CN //语言
```

　　其次是***博客的主题***，Hexo有许多现成的主题可以选择，在[这里](https://github.com/tommy351/hexo/wiki/Themes)可以得到。下载相应的主题放到博客目录底下的themes文件夹底下。最后需要修改_config.yml中theme字段的值，如下:
```yaml
    # Extensions
    ## Plugins: https://github.com/tommy351/hexo/wiki/Plugins
    ## Themes: https://github.com/tommy351/hexo/wiki/Themes
    theme: 主题名
```

　　通过上面这一系列步骤，我们的个人博客可以正式上线了。Hexo还有很多其他的功能，比如评论，RSS。更多内容大家请看[官方文档](http://hexo.io/docs/)。
