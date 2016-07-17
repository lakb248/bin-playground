title: angularjs实践过程中的心得总结
date: 2015-03-10 14:46:12
tags: ['angular']
---
利用寒假的时间给我家女神做了一个WebApp作为情人节礼物，一为表表忠心，二为练练手，在过程中也发现一些问题，在此总结总结。这里面除了angular方面的问题，还有一些单页面应用开发过程中的问题。
<!-- more -->
##加载优化
WebApp第一个版本完成之后兴高采烈的打开浏览器测试，结果Chrome的加载时间让我大跌眼镜，整整用了八秒钟的时间首页在显示出来，这明显是不可接受的。所以必须进行拆分加载。整个WebApp分为一个首页和三个功能模块，所以很自然把三个模块拆分出来，优先加载首页，在点击导航的时候再依次加载对应模块代码。
功能模块的延迟加载实际上就是与功能有关的控制器，服务和路由的延迟加载，所以在拆分加载中遇到的问题就是来自这些方面。首先常用的`module.controller`的controller定义方式无法满足App启动之后的controller动态定义，也就是说如果在angular启动了App之后再使用`module.controller`的方式定义controller是无效的，仍然会报controller undefined的错误。这时候就需要使用`$controllerProvider`的`register`方法来动态定义controller。功能模块的异步加载自然而然想到了`requirejs`,具体实现如下：
```javascript
var meng = angular.module('meng',['ionic','ngRoute']) ;
//异步加载功能模块
var resolveController = function(names){
 return {
     loadController : ['$q','$rootScope',function($q,$rootScope){
         var defer = $q.defer() ;
         require(names,function(){
             defer.resolve() ;
             $rootScope.$apply() ;
         }) ;
         return defer.promise ;
     }]
 }
} ;

//route config
meng.config(
  ['$routeProvider','$controllerProvider','$provide','$compileProvider',
  function($routeProvider,$controllerProvider,$provide,$compileProvider){

  meng.register = {
      controller: $controllerProvider.register,
      factory: $provide.factory,
      directive: $compileProvider.directive
  };

  $provide.decorator('$route',function($delegate){
      var $route = $delegate ;
      $route.when = function( path, route ) {
          $routeProvider.when( path, route );
          return this ;
      };
      return $route ;
  }) ;

  $routeProvider
      .when('/',{
          templateUrl : 'views/main.html'
      })
      .when('/info',{
          templateUrl : 'views/info.html'
      })
      .when('/task',{
          templateUrl : 'views/task/task.html',
          controller : 'taskController',
          resolve : resolveController(['TaskModule'])
      })
      .when('/wallet',{
          templateUrl : 'views/wallet/wallet.html',
          controller : 'walletController',
          resolve : resolveController(['WalletModule'])
      })
      .when('/note',{
          templateUrl : 'views/note/note_list.html',
          controller : 'noteController',
          resolve : resolveController(['NoteModule'])
      })
      .otherwise('/');
}]) ;

```
上面的实现的关键就是`resolveController`方法，它在路由过程中利用require方法去加载功能对应的模块代码，在代码加载完成后进行路由跳转。上面省略了require的配置部分，`TaskModule`，`WalletModule`，`NoteModule`分别对于task.js，wallet.js和note.js三个文件。
上面代码中还解决了延迟加载中的另一个问题，angular中路由配置是通过`$routeProvider`完成的，但是这个服务在config的时候才能获取，在App启动之后是无法获取进行路由配置的，而`$route`对象是随时都可以获取的，所以这里在config过程中对利用angular提供的装饰方法对`$route`进行了扩展，增加了一个when方法指向`$routeProvider`的`when`方法，这样就可以在其他地方对路由进行配置。
通过上面的方法进行加载拆分有一个问题，它并没有很好的利用angular中模块化的特性，为了延迟加载功能不得不把原来分为三个module的代码都合并到一个module中，这样破坏了模块的独立性，如何在angular的module上进行延迟加载我还在寻找方法。
##数据缓存
高响应是单页面应用的一大优势，这是因为单页面应用会尽可能少的刷新页面。除了通过减少刷新来提高响应以外，减少不必要的数据交互也是一个关键。而为了减少不必要的数据交互，对数据进行缓存是很有必要的。在首次请求数据返回之后，将数据缓存下来，在下一次请求数据是先在缓存中查找，如果没有再去请求服务器数据，在这个过程中我们必须要保证缓存的数据与服务器数据保持同步，所以在进行增删改的时候需要同时对本地和服务器的数据进行增删改。而我在开发过程中把这部分功能实现放在Model中，这样向上隐藏内部的数据层实现。在数据缓存这方面大家如果有更好的办法，欢迎交流。
##离线存储
HTML5中的ApplicationCache离线存储是一个很好的提高App加载速度的途径，但是它也会给开发过程中带来一些不便，经常出现更新资源但是没有更新manifest文件带来的失误，而且希望更新生效需要进行两次页面刷新，这是比较不方便的。所以这个东西好用确实好用，只是加入离线存储应该放在开发过程的最后，在完成功能实现的前提下再把ApplicationCache加上去，这样可以避免它给开发过程中带来的不便。
##小结
上面所说的三个问题只是目前遇到的主要的三个问题，App还在改进中。对于angular的使用还不够熟练，对于单页面中的组织结构划分和模块化的理解还不够透彻，除了上面所说的问题以外还有几个问题有待继续钻研，比如如何更高效的处理数据缓存，移动设备上点击的击穿现象，还有CSS动画的问题，总之就是多动手多思考少吃零食多睡觉。
PS:做了这个App之后发现自己真是不适合做设计，改了又改界面才勉强达到我家女神的要求，再接再厉吧。
