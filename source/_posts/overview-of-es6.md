title: (译)ECMAScript 6 特性速览
date: 2014-05-24 09:50
tags: ['javascript', 'es6']
---
原文地址:http://www.frontendjournal.com/javascript-es6-learn-important-features-in-a-few-minutes/

　　下一个Javascript版本，也就是ECMAScript 6(ES6或者Harmony)，给我们带来了很多令人兴奋的特性。下面我们来快速看看这些特性。下面列出的这些特性是我觉得很可能会在你日常工作中用到的。
　　如果你是一个Javascript新手或者原来是做服务器端开发的，那么你也不必担心，我相信现在是学习Javascript的最好时机，因为ES6有很多简介并且友好的特性。
<!-- more -->
# 类

　　总所周知，Javascript不像其他面向对象语言那样支持类，但是Javascript可以通过函数和原型来模拟类。
　　下面是一个创建类的新语法。如果你学习过Java或者其他面向对象语言的话，你会觉得很熟悉。
```javascript
class Project {  
  constructor(name) {
    this.name = name;
  }

  start() {
    return "Project " + this.name + " starting";
  }
}

var project = new Project("Journal");  
project.start(); // "Project Journal starting"
```

　　所有你在类里面声明的方法都会添加到类的原型中。
　
# ES6和原型中的继承
　　正如前面说的，Javascript不支持类。所以，既然它不支持类，那么它支持继承吗？
　　的确，Javascript中的继承大部分是通过原型实现。如果你对原型不熟悉，那么一个好消息就是在ES6中你没必要了解原型就可以使用类和继承。原型并不难学习但是在这里你只要知道原型是javascript中实现继承的一种方式就可以了。
　　下面我创建了一个Project的子类，命名为WebProject并且继承Project中的属性和方法
```javascript
class WebProject extends Project {  
  constructor(name, technologies) {
    super(name);
    this.technologies = technologies;
  }

  info() {
    return this.name + " uses " + arrayToString(this.technology);
  }
}

function arrayToString(param) {  
  // ... some implementation
}

var webJournal = new WebProject("FrontEnd Journal", "javascript");  
webJournal.start(); // "FrontEnd Journal starting"  
webJournal.info(); // "FrontEnd Journal uses javascript"  
```
　　注意到在WebProject的构造函数中调用了Project的构造函数，然后就可以使用它的属性和方法了。
　　
# 模块
　　如果你不想把你的JS代码都放在一个文件中或者你想在你的应用中的其他部分重用一些功能，那么你就很可能要用到模块。你需要记住的一个变量是`export`，只要在你要暴露出来的方法前面加上`export`就可以了。
　　下面是我们应用的结构。Project类和WebProject类被放在application.js中。
```javascript
myproject (folder)  
 |
 -- modules (folder)
 |   |
 |   -- helpers.js
 |
 -- application.js
```
　　让我们把`arrayToString()`方法从`application.js`中分离出来然后放在`modules/helpers.js`模块中，这样我们就可以在其他地方重用它了。
```javascript
// modules/helper.js
export function arrayToString(param) {  
  // some implementation
}
```
　　现在我们只需要在`application.js`中导入我们的模块就可以了。
```javascript
// application.js
import { arrayToString } from 'modules/helpers';

class WebProject extends Project {  
  constructor(name, technologies) {
    super(name);
    this.technologies = technology;
  }

  info() {
    return this.name + " uses " + arrayToString(this.technology);
  }
}

// ...
```
# ES6的其他特性
　　下面两个ES6中的特性就比较有趣了。`let`和`const`。
## let
　　为了理解`let`，首先我们需要记住`var`创建的是函数作用域的变量:
```javascript
function printName() {  
  if(true) {
    var name = "Rafael";
  }
  console.log(name); // Rafael
}
```
　　注意到，不像Java或者许多其他语言那样，Javascript中任何在一个函数内部创建的变量都会被提升到函数的顶部。这就意味着无论你在哪里声明的变量，效果就像都是在函数顶部声明的一样。这种行为就叫做`提升`
　　所以上面的函数可以理解成下面这样：
```javascript
function printName() {  
  var name; // variable declaration is hoisted to the top
  if(true) {
    name = "Rafael";
  }
  console.log(name); // Rafael
}
```
　　那么，`let`是如何工作的呢？
　　我们用同样的例子来看看:
```javascript
function printName() {  
  if(true) {
    let name = "Rafael";
  }
  console.log(name); // ReferenceError: name is not defined
}
```
　　由于`let`是在块内部，所以`name`变量只能在块中访问。
```javascript
function printName() {  
  var name = "Hey";
  if(true) {
    let name = "Rafael";
    console.log(name); // Rafael
  }
  console.log(name); // Hey
}
```
　　在这个例子中，由于`let`引用了已经声明的变量，所以"Rafael"只在块内部合法。在块的外部`name`的值是"Hey"。
　　总之，`var`是函数作用域的而`let`是块级作用域的。
## const
　　Javascript在过去很长一段时间都不支持创建常量。随着ES6的到来，你将可以创建常量并且保证它的值不会被改变。
　　创建常量的语法如下:
```javascript
const SERVER_URL = "http://frontendjournal.com"  
```
# 其他有趣的特性
　　ECMAScript 6 同时还带来了很多其他特性:`Map`，`WeakMap`，`Generators`和`Proxies`。
# 什么时候可以开始使用ES6？
　　Firefoxs是支持最多特性的浏览器而Juriy Zaytsev已经把主要浏览器的支持列出来了。 http://kangax.github.com/es5-compat-table/es6/
　　一些ES6特性在NodeJS中也可以使用。可以查看Alex Young的博客[ES6 for Node](http://dailyjs.com/2012/10/15/preparing-for-esnext/)。
# 结论
　　下一个版本的Javascript会带来一个更加简单更加友好的语法来帮助那些从面向对象语言转过来的开发者的学习。现在的唯一的问题就是主要浏览器对ES6的全面支持还需要一些时间。

# 译者注:
　　目前对ECMAScript 6支持比较好的两个浏览器就是Chrome和Firefox，为了更好地体验ES6，我们需要下载开发者版本的浏览器，Chrome Canary [下载地址](http://www.google.com/intl/zh-CN/chrome/browser/canary.html)，Firefox Aurora [下载地址](http://www.mozilla.org/en-US/firefox/channel/#aurora)。
　　要在Firfox中开启ECMAScript 6，需要把`<script type= "text/javascript">`标签改为`<script type="applicationjavascript;version=1.8">`。1.8是Firefox现在支持的版本最高的javascript。
　　在Chrome中开启ECMAScript 6，只需要使用严格模式就可以了，也就是在脚本前面加上`"use strict"`。不过在这之前还需要在地址栏中输入`chrome://flags/`，然后启用实验性 JavaScript。
