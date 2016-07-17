title: 再谈Javascript原型继承
date: 2014-11-09 14:45:50
tags: ['javascript']
---
真正意义上来说Javascript并不是一门面向对象的语言，没有提供传统的继承方式，但是它提供了一种原型继承的方式，利用自身提供的原型属性来实现继承。Javascript原型继承是一个被说烂掉了的话题，但是自己对于这个问题一直没有彻底理解，今天花了点时间又看了一遍《Javascript模式》中关于原型实现继承的几种方法，下面来一一说明下，在最后我根据自己的理解提出了一个关于继承比较完整的实现，如果大家有不同意见，欢迎建议。
<!-- more -->
## 原型与原型链
说原型继承之前还是要先说说原型和原型链，毕竟这是实现原型继承的基础。
在Javascript中，每个函数都有一个原型属性`prototype`指向自身的原型，而由这个函数创建的对象也有一个`__proto__`属性指向这个原型，而函数的原型是一个对象，所以这个对象也会有一个`__proto`__指向自己的原型，这样逐层深入直到`Object`对象的原型，这样就形成了原型链。下面这张图很好的解释了Javascript中的原型和原型链的关系。
![图片描述][1]


每个函数都是Function函数创建的对象，所以每个函数也有一个`__proto__`属性指向Function函数的原型。这里需要指出的是，真正形成原型链的是每个对象的`__proto__`属性，而不是函数的`prototype`属性，这是很重要的。
## 原型继承
### 基本模式
```javascript
var Parent = function(){
  this.name = 'parent' ;
} ;
Parent.prototype.getName = function(){
  return this.name ;
} ;
Parent.prototype.obj = {a : 1} ;

var Child = function(){
  this.name = 'child' ;
} ;
Child.prototype = new Parent() ;

var parent = new Parent() ;
var child = new Child() ;

console.log(parent.getName()) ; //parent
console.log(child.getName()) ; //child
```
这种是最简单实现原型继承的方法，直接把父类的对象赋值给子类构造函数的原型，这样子类的对象就可以访问到父类以及父类构造函数的`prototype`中的属性。 这种方法的原型继承图如下：
![图片描述][2]

这种方法的优点很明显，实现十分简单，不需要任何特殊的操作；同时缺点也很明显，如果子类需要做跟父类构造函数中相同的初始化动作，那么就得在子类构造函数中再重复一遍父类中的操作：
```javascript
var Parent = function(name){
  this.name = name || 'parent' ;
} ;
Parent.prototype.getName = function(){
  return this.name ;
} ;
Parent.prototype.obj = {a : 1} ;

var Child = function(name){
  this.name = name || 'child' ;
} ;
Child.prototype = new Parent() ;

var parent = new Parent('myParent') ;
var child = new Child('myChild') ;

console.log(parent.getName()) ; //myParent
console.log(child.getName()) ; //myChild

```
上面这种情况还只是需要初始化`name`属性，如果初始化工作不断增加，这种方式是很不方便的。因此就有了下面一种改进的方式。
### 借用构造函数
```javascript
var Parent = function(name){
  this.name = name || 'parent' ;
} ;
Parent.prototype.getName = function(){
  return this.name ;
} ;
Parent.prototype.obj = {a : 1} ;

var Child = function(name){
  Parent.apply(this,arguments) ;
} ;
Child.prototype = new Parent() ;

var parent = new Parent('myParent') ;
var child = new Child('myChild') ;

console.log(parent.getName()) ; //myParent
console.log(child.getName()) ; //myChild
```
上面这种方法在子类构造函数中通过`apply`调用父类的构造函数来进行相同的初始化工作，这样不管父类中做了多少初始化工作，子类也可以执行同样的初始化工作。但是上面这种实现还存在一个问题，父类构造函数被执行了两次，一次是在子类构造函数中，一次在赋值子类原型时，这是很多余的，所以我们还需要做一个改进：
```javascript
var Parent = function(name){
  this.name = name || 'parent' ;
} ;
Parent.prototype.getName = function(){
  return this.name ;
} ;
Parent.prototype.obj = {a : 1} ;

var Child = function(name){
  Parent.apply(this,arguments) ;
} ;
Child.prototype = Parent.prototype ;

var parent = new Parent('myParent') ;
var child = new Child('myChild') ;

console.log(parent.getName()) ; //myParent
console.log(child.getName()) ; //myChild
```
这样我们就只需要在子类构造函数中执行一次父类的构造函数，同时又可以继承父类原型中的属性，这也比较符合原型的初衷，就是把需要复用的内容放在原型中，我们也只是继承了原型中可复用的内容。上面这种方式的原型图如下：
![图片描述][3]

### 临时构造函数模式(圣杯模式)
上面借用构造函数模式最后改进的版本还是存在问题，它把父类的原型直接赋值给子类的原型，这就会造成一个问题，就是如果对子类的原型做了修改，那么这个修改同时也会影响到父类的原型，进而影响父类对象，这个肯定不是大家所希望看到的。为了解决这个问题就有了临时构造函数模式。
```javascript
var Parent = function(name){
  this.name = name || 'parent' ;
} ;
Parent.prototype.getName = function(){
  return this.name ;
} ;
Parent.prototype.obj = {a : 1} ;

var Child = function(name){
  Parent.apply(this,arguments) ;
} ;
var F = new Function(){} ;
F.prototype = Parent.prototype ;
Child.prototype = new F() ;

var parent = new Parent('myParent') ;
var child = new Child('myChild') ;

console.log(parent.getName()) ; //myParent
console.log(child.getName()) ; //myChild
```
该方法的原型继承图如下：
![图片描述][4]
很容易可以看出，通过在父类原型和子类原型之间加入一个临时的构造函数`F`，切断了子类原型和父类原型之间的联系，这样当子类原型做修改时就不会影响到父类原型。

### 我的方法
《Javascript模式》中到圣杯模式就结束了，可是不管上面哪一种方法都有一个不容易被发现的问题。大家可以看到我在'Parent'的`prototype`属性中加入了一个`obj`对象字面量属性，但是一直都没有用。我们在圣杯模式的基础上来看看下面这种情况：
```javascript
var Parent = function(name){
  this.name = name || 'parent' ;
} ;
Parent.prototype.getName = function(){
  return this.name ;
} ;
Parent.prototype.obj = {a : 1} ;

var Child = function(name){
  Parent.apply(this,arguments) ;
} ;
var F = new Function(){} ;
F.prototype = Parent.prototype ;
Child.prototype = new F() ;

var parent = new Parent('myParent') ;
var child = new Child('myChild') ;

console.log(child.obj.a) ; //1
console.log(parent.obj.a) ; //1
child.obj.a = 2 ;
console.log(child.obj.a) ; //2
console.log(parent.obj.a) ; //2
```
在上面这种情况中，当我修改`child`对象`obj.a`的时候，同时父类的原型中的`obj.a`也会被修改，这就发生了和共享原型同样的问题。出现这个情况是因为当访问`child.obj.a`的时候，我们会沿着原型链一直找到父类的`prototype`中，然后找到了`obj`属性，然后对`obj.a`进行修改。再看看下面这种情况：
```javascript
var Parent = function(name){
  this.name = name || 'parent' ;
} ;
Parent.prototype.getName = function(){
  return this.name ;
} ;
Parent.prototype.obj = {a : 1} ;

var Child = function(name){
  Parent.apply(this,arguments) ;
} ;
var F = new Function(){} ;
F.prototype = Parent.prototype ;
Child.prototype = new F() ;

var parent = new Parent('myParent') ;
var child = new Child('myChild') ;

console.log(child.obj.a) ; //1
console.log(parent.obj.a) ; //1
child.obj.a = 2 ;
console.log(child.obj.a) ; //2
console.log(parent.obj.a) ; //2
```
这里有一个关键的问题，当对象访问原型中的属性时，原型中的属性对于对象来说是只读的，也就是说`child`对象可以读取`obj`对象，但是无法修改原型中`obj`对象引用，所以当`child`修改`obj`的时候并不会对原型中的`obj`产生影响，它只是在自身对象添加了一个`obj`属性，覆盖了父类原型中的`obj`属性。而当`child`对象修改`obj.a`时，它先读取了原型中`obj`的引用，这时候`child.obj`和`Parent.prototype.obj`是指向同一个对象的，所以`child`对`obj.a`的修改会影响到`Parent.prototype.obj.a`的值，进而影响父类的对象。`AngularJS`中关于`$scope`嵌套的继承方式就是模范Javasript中的原型继承来实现的。
根据上面的描述，只要子类对象中访问到的原型跟父类原型是同一个对象，那么就会出现上面这种情况，所以我们可以对父类原型进行拷贝然后再赋值给子类原型，这样当子类修改原型中的属性时就只是修改父类原型的一个拷贝，并不会影响到父类原型。具体实现如下：
```javascript
var deepClone = function(source,target){
  source = source || {} ;
  target = target || {};
  var toStr = Object.prototype.toString ,
      arrStr = '[object array]' ;
  for(var i in source){
      if(source.hasOwnProperty(i)){
          var item = source[i] ;
          if(typeof item === 'object'){
              target[i] = (toStr.apply(item).toLowerCase() === arrStr) ? [] : {} ;
              deepClone(item,target[i]) ;    
          }else{
              target[i] = item;
          }
      }
  }
  return target ;
} ;
var Parent = function(name){
  this.name = name || 'parent' ;
} ;
Parent.prototype.getName = function(){
  return this.name ;
} ;
Parent.prototype.obj = {a : '1'} ;

var Child = function(name){
  Parent.apply(this,arguments) ;
} ;
Child.prototype = deepClone(Parent.prototype) ;

var child = new Child('child') ;
var parent = new Parent('parent') ;

console.log(child.obj.a) ; //1
console.log(parent.obj.a) ; //1
child.obj.a = '2' ;
console.log(child.obj.a) ; //2
console.log(parent.obj.a) ; //1
```
综合上面所有的考虑，Javascript继承的具体实现如下，这里只考虑了Child和Parent都是函数的情况下：
```javascript
var deepClone = function(source,target){
  source = source || {} ;
  target = target || {};
  var toStr = Object.prototype.toString ,
      arrStr = '[object array]' ;
  for(var i in source){
      if(source.hasOwnProperty(i)){
          var item = source[i] ;
          if(typeof item === 'object'){
              target[i] = (toStr.apply(item).toLowerCase() === arrStr) ? [] : {} ;
              deepClone(item,target[i]) ;    
          }else{
              target[i] = item;
          }
      }
  }
  return target ;
} ;

var extend = function(Parent,Child){
  Child = Child || function(){} ;
  if(Parent === undefined)
      return Child ;
  //借用父类构造函数
  Child = function(){
      Parent.apply(this,argument) ;
  } ;
  //通过深拷贝继承父类原型    
  Child.prototype = deepClone(Parent.prototype) ;
  //重置constructor属性
  Child.prototype.constructor = Child ;
} ;

```

## 总结
说了这么多，其实Javascript中实现继承是十分灵活多样的，并没有一种最好的方法，需要根据不同的需求实现不同方式的继承，最重要的是要理解Javascript中实现继承的原理，也就是原型和原型链的问题，只要理解了这些，自己实现继承就可以游刃有余。


[1]: https://segmentfault.com/img/bVco7f
[2]: https://segmentfault.com/img/bVdnzS
[3]: https://segmentfault.com/img/bVdnzU
[4]: https://segmentfault.com/img/bVdnzV
