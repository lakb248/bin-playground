title: Github装逼指南——Travis CI 和 Codecov
date: 2016-02-04 14:47:22
tags: ['github', 'ci']
---
好久没写博客了，趁着年前空闲的时间来一篇轻松点的东西。
最近工作中积累了一些Angular组件打算整一整把他们开源了，既然要开源那么代码可靠性就很重要了，单测不能少，为了保证每次提交的代码都能很好的运行，持续集成不能少。之前看到很多开源项目介绍中都有一些单测覆盖率和build结果的图标，就像这样：

![clipboard.png](https://segmentfault.com/img/bVsGKF)
<!-- more -->
觉得挺酷的。打算在自己的开源组件中也整一套。
经过Google决定使用TravisCI来进行持续集成，Codecov来统计单测覆盖率。
## Travis CI
Travis CI是国外新兴的开源持续集成构建项目，支持Github项目。使用十分方便。
1. 使用Github账号登录[Travis CI](https://travis-ci.org/)；
2. 登录之后会自动同步Github项目，选择需要使用Travis CI的项目
3. 在项目的根目录新增`.travis.yml`文件，内容如下：

```yml
#指定运行环境
language: node_js
#指定nodejs版本，可以指定多个
node_js:
  - 0.12.5

#运行的脚本命令
script:
  - npm run ci

#指定分支，只有指定的分支提交时才会运行脚本
branches:
  only:
    - master
```

更多语法请看[这里](https://docs.travis-ci.com/)。使用起来非常方便，这样当你每次向github push代码的时候，Travis CI就会自动运行`.travis.yml`里面的`script`。自动进行编译以及运行单测。
由于Travis CI每次build之前都会运行`npm install`安装项目依赖的npm包，所以在提交代码的时候要保证把所有依赖的包都已经在`package.json`中声明了，否则build就会失败。
## Codecov
Codecov是一个开源的测试结果展示平台，将测试结果可视化。Github上许多开源项目都使用了Codecov来展示单测结果。
Codecov跟Travis CI一样都支持Github账号登录，同样会同步Github中的项目。在nodejs环境下使用Codecov需要安装对于的npm包，运行下面这个命令进行安装：
```shell
npm install codecov --save-dev
```
这个包的作用是将我们运行单测产生的结果文件上传到Codecov上进行可视化展示。同时codecov支持的结果文件类型为`cobertura`。所以需要保证单测执行的结果文件的类型为`cobertura`。
前端项目进行单元测试推进`karma` + 'jasmine'的组合。这两个具体是什么东西大家Google一下就知道。使用`karma`可以通过简单的配置来运行单测。下面是我一个项目中的配置文件，供大家参考：
```javascript
// Karma configuration
// Generated on Mon Feb 01 2016 21:34:22 GMT+0800 (中国标准时间)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    // 使用的测试框架jasmine, requirejs支持模块化加载
    frameworks: ['jasmine', 'requirejs'],


    // list of files / patterns to load in the browser
    files: [
        // karma中用到进行requirejs配置的文件
        'test/test-main.js',
        // 测试中需要用到的文件，includeed设为false表示在页面加载的时候不会加载相应的js文件，也就是可以通过requirejs进行异步加载
        {pattern: 'node_modules/jquery/dist/jquery.min.js', included: false},
        {pattern: 'node_modules/angular/angular.min.js', included: false},
        {pattern: 'node_modules/angular-mocks/angular-mocks.js', included: false},
        {pattern: 'src/bg-single-selector.js', included: false},
        {pattern: 'test/selector.spec.js', included: false}
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    // 针对bg-single-selector.js生成单测覆盖率结果
    preprocessors: {
        'src/bg-single-selector.js': 'coverage'
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    // 测试结果的几种输出方式
    reporters: ['progress', 'coverage', 'verbose'],
    // 测试结果报告的类型
    coverageReporter:{
        reporters: [{
            type:'text-summary'
        }, {
            type: 'html',
            dir: 'test/coverage'
        }, {
            // 这就是Codecov支持的文件类型
            type: 'cobertura',
            subdir: '.',
            dir: 'test/coverage'
        }]
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],
    // 运行测试依赖的插件
    plugins: [
        'karma-jasmine',
        'karma-coverage',
        'karma-verbose-reporter',
        'karma-phantomjs-launcher',
        'karma-requirejs'
    ],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  })
}

```
通过karma进行单元测试，将命令写到`.travis.yml`中就可以在每次build的时候运行单测，同时运行`codecov [cobertura-coverage.xml路径]`就会把单测结果上传到Codecov。在本地运行codecov会失败，需要将这个过程加入到Travis CI的build脚本中，才能成功上传。因为在本地运行就会被作为私有项目，对于私有项目在上传结果时需要加上Codecov提供的token。
## 在github中加入图标
到了最后一步，Travis CI和Codecov都提供图标链接来展示结果。我们只需要将图标链接加入到项目的README中就可以看到结果了。
对于Travis CI来说，点击下图中的图标：

![clipboard.png](https://segmentfault.com/img/bVsGOi)
就会弹出图标的地址。
对于Codecov来说，打开项目的设置列表就会看到，如下：

![clipboard.png](https://segmentfault.com/img/bVsGOj)

最后只需要将对应的链接加到README文件中就可以了。下面是最后的效果：

![clipboard.png](https://segmentfault.com/img/bVsGOq)

是不是很赞！
项目地址：[BGSingleSelector](https://github.com/GaojingComponent/BGSingleSelector)，欢迎大家试用提意见，同时不要吝啬Star。

最后的最后，做一个广告。[百度告警平台](http://gaojing.baidu.com/#/)。这是一个智能的告警平台，提供实时精确的告警送达，故障的协作处理能力。再也不需要担心遗漏监控报警，解放运维人力。
