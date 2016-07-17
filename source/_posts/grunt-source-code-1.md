title: 看看 Grunt 的源码（一）：grunt-cli 源码解析
date: 2015-04-07 14:46:53
tags: ['grunt']
---

由于将来工作需要最近学习了Grunt，至于Grunt是什么大家百度下就好了，我就不多说了。对于它内部的实现比较感兴趣，所以看了看源码。今天先来说说grunt命令行工具grunt-cli的实现。
<!-- more -->
grunt-cli是建立在grunt基础上的命令行工具，通过它可以很方便的使用grunt进行一些自动化任务。grunt-cli的处理过程主要分为下面几步：

1. 加载必须的模块，这其中包括第三方模块和grunt-cli内部的模块
2. 获取命令行参数执行相应的操作
3. 查找grunt.js文件并执行任务

下面的grunt-cli的主要代码：

```javascript
#!/usr/bin/env node

'use strict';

process.title = 'grunt';

//加载文件查找模块,findup用于向上查找
var findup = require('findup-sync');
//加载路径解析模块
var resolve = require('resolve').sync;


//加载grunt-cli内部的cli模块
//cli模块利用nopt第三方库来获取grunt命令中的参数值
var options = require('../lib/cli').options;

//加载grunt-cli内部的completion模块
//completion模块用来打印自动补全的脚本
//这样就可以通过eval "$(grunt --completion=bash)"来执行脚本支持自动补全
//completion.js内部就是通过参数查找文件最后输出
var completion = require('../lib/completion');

//加载grunt-cli内部的info模块
//用来输出版本信息以及帮助信息的模块
//info.js内部主要就是几个输出grunt信息的方法
var info = require('../lib/info');

//加载node自带的路径解析模块
var path = require('path');

//获取当前路径
var basedir = process.cwd();
//grunt.js文件的路径
var gruntpath;

//判断命令行参数进行相应操作
if ('completion' in options) {
//如果grunt命令带有--completion参数，则打印相应的自动补全脚本
//grunt --completion=bash这个命令基本上只会在设置自动补全的使用
//在自动化工作中并不会用到
completion.print(options.completion);
} else if (options.version) {
//如果grunt命令带有--version参数，则打印版本信息
info.version();
} else if (options.base && !options.gruntfile) {
//如果在grunt命令中指定了base文件夹
//那么所有操作都会基于这个文件路径进行
basedir = path.resolve(options.base);
} else if (options.gruntfile) {
//如果grunt命令中指定了gruntfile，那么就会执行这个文件中的任务，同时文件夹切换到对于目录下
//默认情况下grunt会在当前目录以及父目录中查找Gruntfile.js或者Gruntfile.coffee文件
basedir = path.resolve(path.dirname(options.gruntfile));
}

try {
//得到grunt.js的地址
gruntpath = resolve('grunt', {basedir: basedir});
} catch (ex) {
//如果在当前路径没找到，向父目录继续查找
gruntpath = findup('lib/grunt.js');
// No grunt install found!
if (!gruntpath) {
  //无法找到目录
  if (options.version) {
    //如果查询版本信息，由于找不到grunt所以直接退出
    process.exit();
  }
  if (options.help) {
    //显示帮助信息
    info.help();
  }
  info.fatal('Unable to find local grunt.', 99);
}
}

//调用grunt执行任务，精彩从这里开始
require(gruntpath).cli();

```
整个过程比较简单，真正有意思的工作在grunt.js中，后续我会跟大家分享这方面的内容。
