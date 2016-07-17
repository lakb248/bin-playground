title: 前端优化-Javascript篇(4.DOM优化)
date: 2014-06-16 14:44:11
tags: ['javascript', '前端优化']
---
上篇我介绍了Javascript标识符查找方面的优化，可以看出在这方面的优化给性能带来的提升并不明显，甚至可以说基本没有影响。但是，我今天要分享的是前端Javascript优化的一个大头。众所周知，在浏览器端Javascript中DOM操作相比普通Javascript代码来说是比较耗时的，所以在DOM优化上下功夫可以收到相当可观的性能优化。下面我将分享几个DOM方面的性能优化策略。
<!-- more -->
## 耗时的DOM操作
浏览器中的Javascript可以分为两个部分：ECMAScript和DOM API。而相比原生的ECMAScript来说，DOM API会耗时很多。我们可以把这两部分想象成两个通过桥梁连接的小岛，在ECMAScript小岛上进行的操作运行速度比在DOM小岛上面的操作要快很多，每次在进行DOM操作的时候你都需要从ECMAScript这个小岛通过这个桥梁到达DOM小岛上然后在上面进行耗时的操作。所以大量的DOM操作就会降低性能。
大家先看看下面这个例子:
```javascript
//优化前
var start = new Date().getTime() ;
for(var i = 0 ; i < length ; i ++){
    document.getElementById("test").innerHTML += "a" ;
}
console.log("Before:" + (new Date().getTime() - start)) ;
//优化后
start = new Date().getTime() ;
var content = "" ;
for(var i = 0 ; i < length ; i ++){
    content += "a" ;
}
document.getElementById("test").innerHTML += content ;
console.log("After:" + (new Date().getTime() - start)) ;
```
从运行结果来看，可以说差距那是相当明显啊：

![请输入图片描述][1]

优化前的代码每一次循环都进行了DOM操作，而优化之后，只在最后一步进行了DOM操作，这就是DOM优化的力量啊。所以，我们应该在操作的时候尽量避免对DOM的操作，能少操作DOM就少操作。按照上面的比喻就好比是，我们通过桥梁从ECMAScript小岛到达DOM小岛，然后找出需要进行操作的元素，把它再带回到ECMAScript小岛进行操作，通过这个方式，可以加快操作的速度，我们应该尽可能多的把元素带回到ECMAScript小岛进行操作。
## innerHTML还是createElement
在页面上动态添加结点一般有两个方法:innerHTML和createElement方法。这两个方法在性能上也有一点差别，具体差别在哪儿呢？上代码:
```javascript
var start = new Date().getTime() ;

var content = "<div>" ;
for(var i = 0 ; i < 1000 ; i ++){
    content += "<div></div>" ;
}
content += "</div>" ;
document.getElementById("test").innerHTML += content ;

console.log("innerHTML:" + (new Date().getTime() - start)) ;

document.getElementById("test").innerHTML = "" ;

start = new Date().getTime() ;
//为了避免直接往test节点上面添加节点引起的页面重画，所以使用一个div节点来存储添加的节点，最后把div添加到页面中
var div = document.createElement("div") ;
for(var i = 0 ; i < 1000 ; i ++){
    div.appendChild(document.createElement("div")) ;
}
document.getElementById("test").appendChild(div) ;

console.log("createElement:" + (new Date().getTime() - start)) ;
```
这段代码在不同浏览器上的运行结果是不一样的：

![请输入图片描述][2]

在Chrome上createElement比innerHTML快，而在Firefoxhe和IE上结果则相反，从结果上看似乎是innerHTML以2:1赢了，可是我还是建议大家使用createElement，我把上面的代码改成下面这样：
```javascript
var start = new Date().getTime() ;
var test = document.getElementById("test") ;

for(var i = 0 ; i < 1000 ; i ++){
    test.innerHTML += "<div></div>" ;
}

console.log("innerHTML:" + (new Date().getTime() - start)) ;
document.getElementById("test").innerHTML = "" ;

start = new Date().getTime() ;

for(var i = 0 ; i < 1000 ; i ++){
    test.appendChild(document.createElement("div")) ;
}

console.log("createElement:" + (new Date().getTime() - start)) ;
```
上面这段代码的运行结果

![请输入图片描述][3]

可以看出来innerHTML和createElement差很多。为了测试我用了比较大的数据1000，在实际开发中一般不会出现这种情况，所以性能上的差异也就不会那么明显，但是除了考虑性能问题以外，我们还应该考虑代码的可读性以及可维护下方面的问题，而考虑到这些的话，我个人还是比较推荐使用createElement，如果大家有什么别的看法，欢迎一起讨论。
## HTMLCollection
HTMLCollection是若干个DOM节点的集合，它具有数组的一些特性，比如length属性、通过下标访问，但是它并不是数组，它没有push和slice方法。在DOM操作中我们经常会用到HTMLCollection，下面的方法都会返回HTMLCollection:      

+ getElementsByName
+ getElementsByTagName
+ getElementsByClassName
+ document.forms
+ document.images
+ document.links

还有一些别的方法和属性会返回HTMLCollection，在这里就不一一列举了。如何处理它们也是影响性能的一个方面。优化策略跟上面的大同小异，就是用局部变量缓存集合以及集合的长度，我就不进行实际测试了。HTMLCollection还有一个很重要的特性就是它是根据页面的情况动态更新的，如果你更新的页面那么它的内容也会发生变化。比如下面这段代码：
```javascript
var divs = document.getElementsByTagName("div") ;
for(var i = 0 ; i < divs.length ; i ++){
    document.body.appendChild(document.createElement("div")) ;
}
```
这段代码的原意是向body中添加多一倍的div节点，但是真正的运行会导致死循环，这就是因为divs是动态更新的，每次向body中添加div节点都会使length属性发生变化也就是加1，所以这个循环会一直执行下去，在开发的时候应该注意这个问题。一个理想的办法就是缓存divs的长度，这样就不会引起死循环了。
## 节点筛选
如果需要得到某个节点的所以孩子节点，我们可能会用到childNodes属性；得到第一个孩子，我们可能会用到firstChild；得到下一个兄弟节点，我们可能会用到nextSibling。但是这些属性都存在一些问题就是它们会把一些空格和空行也当作孩子节点返回给我们，而这些经常不是我们所想要的，如果使用这些属性那么我们就需要对它们进行筛选，这样势必会影响效率。所以我们应该用别的属性来替代这些，看下表:

![请输入图片描述][4]

表格左边的是推荐的属性，它们只会返回Element节点。不过并不是所有浏览器都支持，所以在使用之前我们需要先判断一下。
## 使用选择器方法替代传统方法
现代浏览器给我们提供了另外一种方法在获取我们需要的节点，这个方法是querySelectorAll和querySelector。它们通过CSS选择器作为参数，返回满足条件的节点。querySelectorAll方法返回满足条件的所有节点而querySelector返回满足条件的第一个节点。使用这两个方法来替代我们以前经常用的getElementById，getElementsByTagName等方法也是提高性能的一个途径。不过还是老问题，并不是所有浏览器都支持这两个方法，所有还是先做个判断吧。
## Reflow 和 Repaint
首先，Repaint是指页面上的元素的外观发生了改变但是不影响布局的情况下引起的浏览器重新绘画元素外观的行为，比如修改color，background-color等属性。Reflow是指页面上的元素的大小布局发生的变化从而引起浏览器对页面其他元素位置大小进行重新计算并且布局的行为。Reflow所导致的性能消耗远比Repaint大，所以我们下面重点讨论Reflow情况下的优化策略。
在讨论Reflow之前先简单的看一下浏览器加载页面的过程。如下图：

![请输入图片描述][5]

浏览器在收到HTML文档之后对其进行解析，解析过程分为两个部分DOM文档的解析和CSS样式的解析。解析DOM文档生成一个DOM树，DOM树和解析出来的CSS样式组合生成一个渲染树，最后浏览器根据这个渲染树进行页面的排版和绘画。而最后这一步就是会涉及到Reflow和Repaint。
以下这几个行为会引起页面的Reflow或Repaint：
1. 添加，删除，更新DOM节点
2. 隐藏/显示DOM节点(display:none或visibility:hidden)
3. 修改样式
4. 改变窗口大小，滚动页面

其实浏览器在这方面已经帮我们做了一些优化了，对于每个触发Reflow的行为浏览器并不会马上就触发，而是把它们保存在一个队列中，当到达一定数量的时候再进行批量的Reflow，这样就不需要每次都进行Reflow。但是，我们的一些行为会影响到浏览器的优化，使得Reflow马上触发。当我们请求下面这些属性的时候发生这种现象：
1. offsetTop, offsetLeft, offsetWidth, offsetHeight
2. scrollTop/Left/Width/Height
3. clientTop/Left/Width/Height
4. getComputedStyle(), or currentStyle(IE)

每当我们请求这些属性时，浏览器为了返回实时的情况就必须马上进行Reflow以计算出我们所需要的属性。所以我们应该尽量少的使用这些属性。
从上面可以发现，基于所有DOM操作都会引起Reflow或Repaint，所以尽可能避免页面的Reflow或Repaint可以很好的提高DOM性能。那么该怎么做才能最好的避免或最小化Reflow呢？下面有几个有用的建议：
1.不要逐一修改样式，而改为通过修改className来批量改变样式，如果样式需要动态计算，那么也要使用cssText属性来批量添加样式。例如：

```javascript
// 错误的做法
var left = 10,
    top = 10;
el.style.left = left + "px";
el.style.top  = top  + "px";

// 使用修改className来进行优化
el.className += " theclassname";

// 如果需要动态修改css，那么就使用cssText
el.style.cssText += "; left: " + left + "px; top: " + top + "px;";
```

2.批量处理DOM操作并且让元素脱离文档流，等操作结束后再放回文档流中。有以下几种办法：

+ 使用display：none隐藏element，然后进行操作，最后再显示出来
+ 使用documentFragment ，把新增的节点放在documentFragment中，最后再把documentFragment放到DOM中，因为把documentFragment放到DOM中，它只会把它的孩子节点放到DOM中，就好像documentFragment不存在。
+ 通过cloneNode复制节点，然后离线进行操作，最后再替换DOM中的节点。

3.尽量少的访问会引起马上Reflow的属性，使用局部变量来缓存这些属性，比如：
```javascript
var left = el.offsetLeft,
    top  = el.offsetTop
    esty = el.style;
for(big; loop; here) {
    left += 10;
    top  += 10;
    esty.left = left + "px";
    esty.top  = top  + "px";
}
```
4.对于需要动画的元素，尽量让它脱离文档流，这样就能尽量引起尽量小的Reflow

5.尽量少使用table布局

## 事件代理
事件代理我想这个大家应该都知道了。越多的事件绑定页面就加载越慢并且占用更多内存，同时绑定太多事件也会使得代码的可读性降低。使用事件代理的方法原理就是把事件绑定到元素的父节点，然后在处理函数中判断target，根据不同的target执行不同的逻辑。这样能很大程度的减少绑定是事件数量并且提高代码的简洁度。

## 总结
看了这么多其实总结起来还是比较简单的，在进行DOM操作的时候尽量把DOM操作转换为本地的Javascript操作，使用时先缓存一些DOM元素或者属性，缓存长度。在需要进行大量DOM操作的时候，先让元素脱离文档，等操作结束再把元素放回文档中。优化策略还是需要在实践中不断尝试，不断摸索，找出最优的解决方案。

最近准备毕设没什么时间更新博客，后面尽量安排好时间做到一周一篇，前端优化Javascript篇未完待续。。。

  [1]: http://segmentfault.com/img/bVcATZ
  [2]: http://segmentfault.com/img/bVcAT1
  [3]: http://segmentfault.com/img/bVcAT7
  [4]: http://segmentfault.com/img/bVcAT8
  [5]: http://segmentfault.com/img/bVcAT9
