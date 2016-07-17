title: 前端优化-Javascript篇(2.异步加载脚本)
date: 2014-06-02 14:43:19
tags: ['javascript', '前端优化']
---
上篇博客说过脚本后置可以使页面更快的加载，可是这样的优化还是有限的，如果脚本需要执行一个耗时的操作，就算后置了它还是会阻塞后续脚本加载和执行并且阻塞整个页面。下面介绍非阻塞加载脚本技术也就是异步加载。
<!-- more -->
# 非阻塞加载脚本
1.defer(关于defer的一篇[好文](https://hacks.mozilla.org/2009/06/defer/))
　　目前所有浏览器都支持defer属性，但是Chrome和Firefox中只有在加载外部脚本时defer才会生效，行内脚本使用defer是没有作用的。而IE中不论什么情况，defer都有效。
　　defer的作用就是阻止脚本在下载完成后立刻执行，它会让脚本延迟到所有脚本加载执行完成后，在DOMContentLoaded之前执行，通俗的说就是顺序加载延迟执行。虽然都是在DOMContentLoaded之前执行，但是在不同浏览器之间，执行的各种脚本执行的顺序还是不一样的。看下面这个例子：
```html
<html>
  <meta charset="utf-8">
  <head>
    <script type="text/javascript">
      var result = "" ;
      var head = document.getElementsByTagName("head")[0] ;
      //DOMContentLoaded
      if(window.addEventListener){
        document.addEventListener("DOMContentLoaded",function(){
          result += "DOMContentLoaded\n" ;
        }) ;
      }else{
        document.attachEvent("onDOMContentLoaded",function(){
          result += "DOMContentLoaded\n" ;
        }) ;
      }
      window.onload = function(){
      	result += "window loaded\n";
      	//console.log("window loaded") ;
      } ;
    </script>
    <!--头部行内延迟脚本-->
    <script type="text/javascript" defer = "defer">
      result += "Head Inline Script defer\n" ;
    </script>
    <!--头部行内脚本-->
    <script type="text/javascript">
      result += "Head Inline Script\n" ;
    </script>
    <!--头部外部延迟脚本 External Head Script defer-->
    <script type="text/javascript" src = "external_head_defer.js" defer="defer"></script>
    <!--头部行内脚本 External Head Script-->
    <script type="text/javascript" src = "external_head.js"></script>
  </head>
  <body>
    <button>SHOW</button>
    <!--Body行内延迟脚本-->  
    <script type="text/javascript" defer = "defer">
      result += "Body Inline Script defer\n" ;
    </script>
    <!--Body行内脚本-->
    <script type="text/javascript">
      result += "Body Inline Script\n" ;
    </script>
    <!--Body外部延迟脚本 External Body Script defer-->
    <script type="text/javascript" defer = "defer" src = "external_body_defer.js"></script>
    <!--Body外部脚本 External Body Script-->
    <script type="text/javascript" src = "external_body.js"></script>
    <script type="text/javascript">
      document.getElementsByTagName("button")[0].onclick = function(){console.log(result);} ;
    </script>
  </body>
</html>
```
运行结果如下：
![Defer][1]
从上面可以看出几个问题：
　　首先，IE9以下不支持DOMContentLoaded(后面会说明这个情况)
　　其次，验证了上面说的Chrome和Firefox行内脚本不支持defer属性
　　最后，defer确实达到了延迟执行的目的，没有阻塞后面脚本的加载和执行。但是耗时的操作还是会阻塞DOMContentLoaded事件，而大多数情况下大家都会把页面初始化的脚本附加在DOMContentLoaded事件上，所以defer方法还是不能很好解决这个问题。

2.Script DOM
　　这是最常用也是现在普遍的解决方法。它只需要简单几句话就可以实现脚本的异步加载，并且所有浏览器都支持这个方法。但是在每个浏览器中，执行还是略有不同。看下面这个例子：
```html
<html>
  <meta charset="utf-8">
  <head>
    <script type="text/javascript">
      var result = "\n" ;
      var head = document.getElementsByTagName("head")[0] ;
      //DOMContentLoaded
      if(window.addEventListener){
        document.addEventListener("DOMContentLoaded",function(){
          alert("DOMContentLoaded") ;
          result += "DOMContentLoaded\n" ;
        }) ;
      }else{
        document.attachEvent("onDOMContentLoaded",function(){
          alert("DOMContentLoaded") ;
          result += "DOMContentLoaded\n" ;
        }) ;
      }
      window.onload = function(){
      	result += "window loaded\n";
      } ;
    </script>
    <!--头部外部延迟脚本 External Head Script defer-->
    <script type="text/javascript" src = "external_head_defer.js" defer="defer"></script>
    <!--头部行内脚本 External Head Script-->
    <script type="text/javascript" src = "external_head.js"></script>
  </head>
  <body>
    <button>SHOW</button>
    <script type="text/javascript">
      document.getElementsByTagName("button")[0].onclick = function(){console.log(result);} ;
    </script>
    <script type="text/javascript">
      result += "start\n" ;
      var head = document.getElementsByTagName("head")[0] ;
      var script8 = document.createElement("script") ;
      script8.type = "text/javascript" ;
      script8.onload = function(){alert("done");} ;
      script8.readystatechange = function(){
      	if(script8.readyState == "loaded" || script8.readyState == "complete"){
      		alert("done") ;
      	}
      } ;
      //Body Dynamic Script
      script8.src = "dynamic_body.js" ;
      head.appendChild(script8) ;
      result += "end\n" ;
    </script>    
  </body>
</html>
```
运行结果如下:
![ScriptDom][2]
　　下面这张图是在ScriptDom脚本后面加入一个耗时的脚本，使得这个脚本执行完成后，保证ScriptDOM的脚本处于可执行状态：
```javascript
<script type="text/javascript">
    function doSomething(length){
		var start = new Date().getTime() ;
		while((new Date().getTime() - start) < 1000 * length){}
	}
	doSomething(3) ;
</script>  
```
结果如下：
![ScriptDOM][3]
运行结果同时也说明了几个问题：
　　首先，ScriptDOM不会阻塞后续脚本的执行，根据start和end 的位置可以很容易看出。
　　其次，在第二张图的情况下，ScriptDOM和defer同时都可以执行，在不同浏览器中它们的优先级的不一样的。在Firfox和Chrome中，ScriptDOM的优先级比defer低，而在IE中情况则相反。
　　最后，通过两种情况的对比发现，在Chrome中ScriptDOM不会阻塞DOMContentLoaded事件但是会阻塞onload事件；在Firefox中ScriptDOM既会阻塞DOMContentLoaded事件也会阻塞onload事件；而在IE中，情况则要根据代码执行情况来决定。如果在DOMContentLoaded事件或者onload事件触发之前，ScriptDOM代码处于可执行状态，那么就会阻塞两个事件；如果在DOMContentLoaded事件或者onload事件触发之前，ScriptDOM代码处于不可执行状态，那么就不会阻塞两个事件。总结的来说就是在Chrome和IE中DOMContentLoaded事件不需要等待ScriptDOM执行，而在Firefox中需要等待ScriptDOM执行。

　　通过上面两种方法的对比发现，defer和ScriptDOM都不会阻塞后续脚本的执行。但是相对来说，ScriptDOM在使用上更加灵活而且并不总是阻塞DOMContentLoaded事件，并且ScriptDOM的使用场景主要是在按需加载和模块加载器上，而一般使用这些技术的时候，页面已经处于加载完成的状态，所以对于性能不会有影响。
　　
# DOMContentLoaded
　　上面说到DOMContentLoaded事件，DOMcontentLoaded是现代浏览器才支持的一个事件，万恶的IE从IE9开始才支持这个事件。那么在什么情况下才会触发DOMContentLoaded事件呢？DOMContentLoaded会在浏览器接收到服务器传过来的HTML文档，整个页面DOM结构加载完成并且所有行内脚本和外部脚本执行完成后触发 (通过上面异步脚本的例子可以看出，ScriptDOM异步加载脚本不会阻塞DOMContentLoaded，或者说DOMContentLoaded不需要等待ScriptDOM执行就可以出发) ，它跟onload事件的区别是，DOMContentLoaded事件不需要等待图片，ifram和样式表等资源加载完成就会触发，而onload事件需要等待整个页面都加载完成包括各种资源才会触发。所以对于我们来说DOMContentLoaded是一个更有用的事件，因为只要DOM结构加载完成，我们就可以通过Javasscript来操作页面上的DOM节点。
　　但是上面关于DOMContentLoaded事件触发条件的定义只是官方文档的说法，具体情况并不总是这样。
　　有时样式表的加载会阻塞脚本的执行从而阻塞DOMContentLoaded事件，这种情况一般出现在样式表后面跟着脚本。也就是说如果把脚本放在样式表后面，那么脚本就必须等到样式表加载完成才能开始执行，这样就会阻塞页面的DOMContentLoaded事件。但是这样做也是有道理的，因为有时候我们的脚本会处理DOM样式方面的东西。
　　这种阻塞情况在不同浏览器上表现也会不一样。在IE和Firefox中，不管样式表后面跟着是行内脚本还是外部脚本，都会发生阻塞。在Chrome中，只有外部脚本才会发生阻塞。
　　由于IE在IE9以下不支持DOMContentLoaded事件，所以我们需要用一些Hack技术来实现这个功能。分两种情况来实现：
　　1.网页不嵌套在iframe中
　　在IE中我们可以通过一个方式来判断DOM是否加载完成，就是doScroll方法。如果DOM加载完成，那么我们就可以调用document的doScroll方法，否则就会抛出异常。我们可以利用这个特性不断轮询来做Hack。
```javascript
    function bindReady(handle){
        //判断是否在iframe中
        try{
            var isFrame = window.frameElement != null ;
        }catch(e){}
        if(document.documentElement.doScroll && !isFrame){
            //轮询是否可以调用doScroll方法
            function tryScroll(){
                try{
                    document.documentElement.doScroll("left");
                    handle() ;
                }catch(e){
                    setTimeout(tryScroll,10) ;
                }
            }
            tryScroll() ;
        }
    }
```
　　2.网页嵌套在iframe中
　　如果网页嵌套在iframe中，那么是无法通过doScroll的方法来Hack实现DOMContentLoaded的。我们可以通过另外一种方式来实现---readystatechange，代码如下：
```javascript
    function bindReady(handle){
        document.onreadystatechange = function(){
            if(document.readyState === "complete" || document.readyState === "loaded"){
                handle() ;
            }
        }
    }
```
　　结合上面的讨论，我们可以得出一个通用的bindReady方法。
```javascript
//绑定DOMContentLoaded事件，支持绑定多个处理函数
var handleList = [] ;
function onReady(handle){
    //按顺序执行处理函数
    var doHandles = function(){
        var length = handleList.length ;
        for(var i = 0 ; i < length ; i ++){
            handleList[i]() ;
        }
    }
    if(handleList.length == 0){
        //在还没有处理函数时，把doHandles注册到ready上，这样后面加入的处理函数就可以一并执行
        bindReady(doHandles) ;
    }
    //把处理函数加入到函数列表中
    handleList.push(handle) ;
}
function bindReady(handle){
    var called = false ;
    var ready = function(){
        //防止重复调用
        if(!called){
            called = true ;
            handle() ;
        }
    }
    if(document.addEventListener){
        //支持DOMcontentLoaded
        document.addEventListener("DOMContentLoaded",ready,false);
    }else if(document.attachEvent){
        //IE
        try{
            var isFrame = window.frameElement != null ;
        }catch(e){}
        //网页不在iframe中
        if(document.documentElement.doScroll && !isFrame){
            function tryScroll(){
                try{
                    document.documentElement.doScroll("left") ;
                    ready() ;
                }catch(e){
                    setTimeout(tryScroll,10) ;
                }
            }
            tryScroll() ;
        }else{
            //网页在iframe中
            document.onreadystatechange = function(){
                if(document.readyState === "complete" || document.readyState === "loaded"){
                    ready() ;
                }
            }
        }
    }
    //老式浏览器不支持上面两种事件
    if(window.addEventListener){
        window.addEventListener("load",ready,false) ;
    }else if(window.attachEvent){
        window.attachEvent("onload",ready) ;
    }else{
        //允许绑定多个处理函数
        var fn = window.onload ;
        window.onload = function(){
            fn && fn() ;
            ready() ;
        }
    }
}
```
# 说在最后
　　说了这么多，虽然通过脚本后置和异步加载可以降低脚本加载对页面的影响，但是就算是实现了异步加载，但是由于浏览器的脚本解析的单线程的，所以脚本执行的时候仍然会阻塞整个页面(当然除了使用Web Worker)，这时候用户是无法完成正常交互的，所以要想真正彻底的优化页面加载，还需要从代码的优化开始。从下一篇开始，我会分享关于这方面的学习。

  [1]: http://segmentfault.com/img/bVcn15
  [2]: http://segmentfault.com/img/bVcn17
  [3]: http://segmentfault.com/img/bVcn19
