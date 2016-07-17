title: (译)为什么原型继承很重要
date: 2015-03-14 14:46:35
tags: ['javascript']
---
五天之前我写了一个关于ES6标准中Class的[文章](http://aaditmshah.github.io/standardizing-harmony-classes)。在里面我介绍了如何用现有的Javascript来模拟类并且介绍了ES6中类的用法，其实它只是一个语法糖。感谢[Om Shakar](http://geekyogi.tumblr.com/)以及[Javascript Room](http://rlemon.github.io/so-chat-javascript-rules/)中的各位，我的编程风格从那时候开始发生了改变；就像[Dougla Crockford](http://www.crockford.com/)2006年做的一样，我也学习了很多来完全理解基于原型的编程方式。

Javascript是一个多样化的编程语言。它拥有面向对象和函数式的编程特点，你可以使用任何一种风格来编写代码。然而这两个编程风格并不能很好的融合。例如，你不无法同时使用`new`(典型的面向对象的特点)和`apply`(函数式编程的特点).原型继承一直都作为连接这两种风格的桥梁。
<!-- more -->
## 基于类继承的问题

大部分Javascript程序员会告诉你基于类的继承不好。然而它们中只有很少一部分知道其中的原因。事实实际上是基于类的基础并没有什么不好。Python是基于类继承的，并且它是一门很好的编程语言。但是，基于类的继承并不适合用于Javascript。Python正确的使用了类，它们只有简单的工厂方法不能当成构造函数使用。而在Javascript中任何函数都可以被当成构造函数使用。

Javascript中的问题是由于每个函数都可以被当成构造函数使用，所以我们需要区分普通的函数调用和构造函数调用；我们一般使用`new`关键字来进行区别。然而，这样就破坏了Javascript中的函数式特点，因为`new`是一个关键字而不是函数。因而函数式的特点无法和对象实例化一起使用。

```javascript
function Person(firstname,lastname){
    this.firstname = firstname ;
    this.lastname = lastname ;
}
```

考虑上面这段程序。你可以通过`new`关键字来调用`Person`方法来创建一个函数`Person`的实例：

```javascript
var author = new Person('Aadit','Shah') ;
```

然而，没有任何办法来使用`apply`方法来为构造函数指定参数列表：

```javascript
var author = new Person.apply(null,['Aadit','Shah']);//error
```

但是，如果`new`是一个方法那么上面的需求就可以通过下面这种方式实现了：

```javascript
var author = Person.new.apply(Person,['Aadit','Shah']) ;
```

幸运的是，因为Javascript有原型继承，所以我们可以实现一个`new`的函数：

```javascript
Function.prototype.new = function () {
    function functor() { return constructor.apply(this, args); }
    var args = Array.prototype.slice.call(arguments);
    functor.prototype = this.prototype;
    var constructor = this;
    return new functor;
};
```

在像Java这样对象只能通过`new`关键字来实例化的语言中，上面这种方式是不可能实现的。

下面这张表列出了原型继承相比于基于类的基础的优点：

|基于类的继承         |原型继承           |
|-------------|-------------|
|类是不可变的。在运行时，你无法修改或者添加新的方法|原型是灵活的。它们可以是不可变的也可以是可变的|
|类可能会不支持多重继承|对象可以继承多个原型对象|
|基于类的继承比较复杂。你需要使用抽象类，接口和final类等等|原型继承比较简洁。你只有对象，你只需要对对象进行扩展就可以了|

## 不要再使用关键词new了

到现在你应该知道为什么我觉得`new`关键字是不会的了吧---你不能把它和函数式特点混合使用。然后，这并不代表你应该停止使用它。`new`关键字有合理的用处。但是我仍然建议你不要再使用它了。`new`关键字掩盖了Javascript中真正的原型继承，使得它更像是基于类的继承。就像[Raynos](http://stackoverflow.com/users/419970/raynos)说的:

> `new`是Javascript在为了获得流行度而加入与Java类似的语法时期留下来的一个残留物

Javascript是一个源于[Self](http://www.selflanguage.org/)的基于原型的语言。然而，为了市场需求，Brendan Eich把它当成Java的小兄弟推出：

> 并且我们当时把Javascript当成Java的一个小兄弟，就像在微软语言家庭中Visual Basic相对于C++一样。

这个设计决策导致了`new`的问题。当人们看到Javascript中的`new`关键字，他们就想到类，然后当他们使用继承时就遇到了傻了。就像Douglas Crockford说的：

> 这个间接的行为是为了使传统的程序员对这门语言更熟悉，但是却失败了，就像我们看到的很少Java程序员选择了Javascript。Javascript的构造模式并没有吸引传统的人群。它也掩盖了Javascript基于原型的本质。结果就是，很少的程序员知道如何高效的使用这门语言

因此我建议停止使用`new`关键字。Javascript在传统面向对象假象下面有着更加强大的原型系统。然大部分程序员并没有看见这些还处于黑暗中。

## 理解原型继承

原型继承很简单。在基于原型的语言中你只有对象。没有类。有两种方式来创建一个新对象---“无中生有”对象创建法或者通过现有对象创建。在Javascript中`Object.create`方法用来创建新的对象。新的对象之后会通过新的属性进行扩展。

### “无中生有”对象创建法

Javascript中的`Object.create`方法用来从0开始创建一个对象，像下面这样:

```javascript
var object = Object.create(null) ;
```

上面例子中新创建的`object`没有任何属性。

### 克隆一个现有的对象

`Object.create`方法也可以克隆一个现有的对象，像下面这样:

```javascript
var rectangle = {
    area : function(){
        return this.width * this.height ;
    }
} ;
var rect = Object.create(rectangle) ;
```

上面例子中`rect`从`rectangle`中继承了`area`方法。同时注意到`rectangle`是一个对象字面量。对象字面量是一个简洁的方法用来创建一个`Object.prototype`的克隆然后用新的属性来扩展它。它等价于:

```javascript
var rectangle = Object.create(Object.prototype) ;
rectangle.area = function(){
    return this.width * this.height ;
} ;
```

### 扩展一个新创建的对象

上面的例子中我们克隆了`rectangle`对象命名为`rect`，但是在我们使用`rect`的`area`方法之前我们需要扩展它的`width`和`height`属性，像下面这样:

```javascript
rect.width = 5 ;
rect.height = 10 ;
alert(rect.area()) ;
```

然而这种方式来创建一个对象的克隆然后扩展它是一个非常傻缺的方法。我们需要在每个`rectangle`对象的克隆上手动定义`width`和`height`属性。如果有一个方法能够为我们来完成这些工作就很好了。是不是听起来有点熟悉？确实是。我要来说说构造函数。我们把这个函数叫做`create`然后在`rectangle`对象上定义它:

```javascript
var rectangle = {
    create : function(width,height){
        var self = Object.create(this) ;
        self.height = height ;
        self.width = width ;
        return self ;
    } ,
    area : function(){
        return this.width * this.height ;
    }
} ;
var rect = rectangle.create(5,10) ;
alert(rect.area()) ;
```

### 构造函数 VS 原型

等等。这看起来很像Javascript中的正常构造模式:

```javascript
function Rectangle(width, height) {
    this.height = height;
    this.width = width;
} ;

Rectangle.prototype.area = function () {
    return this.width * this.height;
};

var rect = new Rectangle(5, 10);

alert(rect.area());
```

是的，确实很像。为了使得Javascript看起来更像Java原型模式被迫屈服于构造模式。因此每个Javascript中的函数都有一个`prototype`对象然后可以用来作为构造器(这里构造器的意思应该是说新的对象是在`prototype`对象的基础上进行构造的)。`new`关键字允许我们把函数当做构造函数使用。它会克隆构造函数的`prototype`属性然后把它绑定到`this`对象中，如果没有显式返回对象则会返回`this`。

原型模式和构造模式都是平等的。因此你也许会怀疑为什么有人会困扰于是否应该使用原型模式而不是构造模式。毕竟构造模式比原型模式更加简洁。但是原型模式相比构造模式有许多优势。具体如下：

|构造模式|原型模式|
|------|------|
|函数式特点无法与`new`关键字一起使用|函数式特点可以与`create`结合使用|
|忘记使用`new`会导致无法预期的bug并且会污染全局变量|由于`create`是一个函数，所以程序总是会按照预期工作|
|使用构造函数的原型继承比较复杂并且混乱|使用原型的原型继承简洁易懂|

最后一点可能需要解释一下。使用构造函数的原型继承相比使用原型的原型继承更加复杂，我们先看看使用原型的原型继承:

```javascript
var square = Object.create(rectangle);
square.create = function (side) {
    return rectangle.create.call(this, side, side);
} ;
var sq = square.create(5) ;
alert(sq.area()) ;
```

上面的代码很容易理解。首先我们创建一个`rectangle`的克隆然后命名为`square`。接着我们用新的`create`方法重写`square`对象的`create`方法。最终我们从新的`create`方法中调用`rectangle`的`create`函数并且返回对象。相反的，使用构造函数的原型继承像下面这样:

```javascript
function Square(){
    Rectangle.call(this,side,side) ;
} ;

Square.prototype = Object.create(Rectangle.prototype) ;

Square.prototype.constructor = Square ;

var sq = new Square(5) ;

alert(sq.area()) ;
```

当然，构造函数的方式更简单。然后这样的话，向一个不了解情况的人解释原型继承就变得非常困难。如果想一个了解类继承的人解释则会更加困难。

当使用原型模式时一个对象继承自另一个对象就变得很明显。当使用方法构造模式时就没有这么明显，因为你需要根据其他构造函数来考虑构造继承。

### 对象创建和扩展相结合

在上面的例子中我们创建一个`rectangle`的克隆然后命名为`square`。然后我们利用新的`create`属性扩展它，重写继承自`rectangle`对象的`create`方法。如果把这两个操作合并成一个就很好了，就像对象字面量是用来创建`Object.prototype`的克隆然后用新的属性扩展它。这个操作叫做`extend`，可以像下面这样实现:

```javascript
Object.prototype.extend = function(extension){
    var hasOwnProperty = Object.hasOwnProperty ;
    var object = Object.create(this) ;

    for(var property in extension){
        if(hasOwnProperty.call(extension,property) ||
            typeof obejct[property] === 'undefined')
            //这段代码有问题，按照文章意思，这里应该使用深复制，而不是简单的浅复制,deepClone(extension[property],object[property]),deepClone的实现可以看我之前关于继承的博客
            object[properyty] = extension[property] ;
    }
    return object ;
} ;
```

> 译者注：我觉得博主这里的实现有点不符合逻辑，正常`extend`的实现应该是可以配置当被扩展对象和用来扩展的对象属性重复时是否覆盖原有属性，而博主的实现就只是简单的覆盖。同时博主的实现在`if`判断中的做法个人觉得是值得学习的，首先判断`extension`属性是否是对象自身的，如果是就直接复制到`object`上，否则再判断`object`上是否有这个属性，如果没有那么也会把属性复制到`object`上，这种实现的结果就使得被扩展的对象不仅仅只扩展了`extension`中的属性，还包括了`extension`原型中的属性。不难理解，`extension`原型中的属性会在`extension`中表现出来，所以它们也应该作为`extension`所具有的特性而被用来扩展`object`。所以我对这个方法进行了改写:

```javascript
    Object.prototype.extend = function(extension,override){
    var hasOwnProperty = Object.hasOwnProperty ;
    var object = Object.create(this) ;
    for(var property in extension){
        if(hasOwnProperty.call(extension,property) ||
            typeof object[property] === 'undefined'){
            if(object[property] !== 'undefined'){
                if(override){
                    deepClone(extension[property],object[property]) ;
                }
            }else{
                deepClone(extension[property],object[property]) ;
            }    
        }
    }
};
```

利用上面的`extend`方法，我们可以重写`square`的代码:

```javascript
var square = rectangle.extend({
    create : function(side){
        return rectangle.create.call(this,side,side) ;
    }
}) ;

var sq = square.create(5) ;
alert(sq.area()) ;
```

`extend`方法是原型继承中唯一需要的操作。它是`Object.create`函数的超集，因此它可以用在对象的创建和扩展上。因此我们可以用`extend`来重写`rectangle`，使得`create`函数更加结构化看起来就像[模块模式](http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html)。

```javascript
var rectangle = {
    create : function(width,height){
        return this.extend({
            height : height ,
            width : width
        }) ;
    }
} ;

var rect = rectangle.create(5,10) ;
alert(rect.area()) ;
```

### 原型继承的两种方法

一些人可能已经注意到`extend`函数返回的对象实际上是继承了两个对象的属性，一个是被扩展的对象，另一个是用来扩展的对象。另外从两个对象继承属性的方式也不一样。第一种情况下是通过委派来继承属性(也就是使用`Object.create()`来继承属性)，第二种情况下使用合并属性的方式来继承属性。

#### 委派(差异化继承)

很多Javascript程序员对于差别继承比较熟悉。维基百科是这么解释的:

> 大部分对象是从其他更一般的对象中得到的，只是在一些很小的地方进行了修改。每个对象通常在内部维护一个指向其他对象的引用列表，这些对象就是该对象本身进行差异化继承的对象。

Javascript中的原型继承是基于差异化继承的。每个对象都有个内部指针叫做[[proto]] (在大部分浏览器中可以通过\__proto\__属性访问)，这个指针指向对象的原型。多个对象之间通过内部[[proto]]属性链接起来形成了原型链，链的最后指向`null`。

当你试图获取一个对象的属性时Javascript引擎会首先查找对象自身的属性。如果在对象上没找到该属性，那么它就会去对象的原型中去查找。以此类推，它会沿着原型链一直查找知道找到或者到原型链的末尾。

```javascript
function get(object,property){
    if(!Object.hasOwnProperty.call(object,property)){
        var prototype = Object.getPrototypeOf(object) ;
        if(prototype) return get(prototype,property) ;
    }else{
        return object[property] ;
    }
} ;
```

Javascript中属性查找的过程就像上面的程序那样。

#### 克隆(合并式继承)

大多数Javascript程序员会觉得复制一个对象的属性到另一个对象上并不是一个正确的继承的方式，因为任何对原始对象的修改都不会反映在克隆的对象上。五天前我会同意这个观点。然而现在我相信合并式继承是原型继承的一种正确方式。对于原始对象的修改可以发送到它的副本来实现真正的原型继承。

合并式继承和代理有他们的优点和缺点。下表列出了它们的优缺点:

|  代理  |  合并  |
|------|------|
|任何对于原型的修改都会反映在所有副本上|任何对于原型的修改都需要手动更新到副本中|
|属性查找效率较低因为需要进行原型链查找|属性查找更搞笑因为继承的属性是通过复制的方式附加在对象本身的|
|使用`Object.create()`方法只能继承单一对象|对象可以从任意数量的对象中通过复制继承属性|

### 从多个原型继承

上表中最后一点告诉我们对象可以通过合并的方式从多个原型中继承属性。这是一个重要的特点因为这证明原型继承比Java中的类继承更强大并且与C++中的类继承一样强大。为了实现多重继承，你只需要修改`extend`方法来从多个原型中复制属性。

```javascript
Object.prototype.extend = function(){
    var hasOwnProperty = Object.hasOwnProperty ;
    var object = Object.create(this) ;
    var length = arguments.length ;
    var index = length ;

    while(index){
        var extension = arguments[length - (index--)] ;
        for(var property in extension){
            if(hasOwnProperty.call(extension,property)||
                typeof object[property] === 'undefined'){
                //这里同样应该使用深复制
                object[property] = extension[property] ;
            }
        }
    }
    return object;
} ;
```

多重继承是非常有用的因为它提高了代码的可重用性和模块化。对象通过委派继承一个原型对象然后通过合并继承其他属性。比如说你有一个事件发射器的原型，像下面这样：

```javascript
var eventEmitter = {
    on : function(event,listener){
        if(typeof this[event] !== 'undefined')
            this[event].push(listener) ;
        else
            this[event] = [listener] ;
    } ,
    emit : function(event){
        if(typeof this[event] !== 'undefined'){
            var listeners = this[event] ;
            var length = listeners.length,index = length ;
            var args = Array.prototype.slice.call(arguments,1) ;

            while(index){
                var listener = listeners[length - (index--)] ;
                listener.apply(this,args) ;
            }
        }
    }
} ;
```

现在你希望`square`表现得像一个事件发射器。因为`square`已经通过委派的方式继承了`rectangle`，所以它必须通过合并的方式继承`eventEmitter`。这个修改可以很容易地通过使用`extend`方法实现：

```javascript
var square = rectangle.extend(eventEmitter,{
    create : function(side){
        return rectangle.create.call(this,side,side) ;
    } ,
    resize : function(newSize){
        var oldSize = this.width ;
        this.width = this.height = newSize ;
        this.emit('resize',oldSize,newSize) ;
    }
}) ;
var sq = square.create(5) ;
sq.on('resize',function(oldSize,newSize){
    alert('sq resized from ' + oldSize + 'to' + newSize + '.') ;
}) ;

sq.resize(10) ;
alert(sq.area()) ;
```

在Java中是不可能实现上面的程序的，因为它不支持多重继承。相应的你必须另外再创建一个`EventEmitter`类或者使用一个`EventEmitter`接口并且在每个实现该接口的类中分别实现`on`和`emit`方法。当然你在C++中不需要面对这个问题。我们都知道Java sucks(呵呵呵)。

### Mixin的蓝图(Buleprint)

在上面的例子中你肯定注意到`eventEmitter`原型并没有一个`create`方法。这是因为你不应该直接创建一个`eventEmitter`对象。相反`eventEmitter`是用来作为其他原型的原型。这类原型称为mixin。它们等价于抽象类。mixin用来通过提供一系列可重用的方法来扩展对象的功能。

然而有时候mixin需要私有的状态。例如`eventEmitter`如果能够把它的事件监听者列表放在私有变量中而不是放在`this`对象上会安全得多。但是mixin没有`create`方法来封装私有状态。因此我们需要为mixin创建一个蓝图(blueprint)来创建闭包。蓝图(blueprint)看起来会像是构造函数但是它们并不用像构造函数那样使用。例如：

```javascript
function eventEmitter(){
    var evnets = Object.create(null) ;

    this.on = function(event,listener){
        if(typeof events[event] !== 'undefined')
            events[event].push(listener) ;
        else
            events[event] = [listener] ;
    } ;
    this.emit = function(event){
        if(typeof events[event] !== 'undefined'){
            var listeners = events[event] ;
            var length = listeners.length ,index = length ;
            var args = Array.prototype.slice.call(arguments,1) ;
        }
    } ;
} ;
```

一个蓝图用来在一个对象创建之后通过合并来扩展它(我觉得有点像装饰者模式)。[Eric Elliot](http://ericleads.com/)把它们叫做[闭包原型](http://ericleads.com/2013/02/fluent-javascript-three-different-kinds-of-prototypal-oo/)。我们可以使用蓝图版本的`eventEmitter`来重写`square`的代码，如下：

```javascript
var square = rectangle.extend({
    create : function(side){
        var self = rectangle.create.call(this,side,side) ;
        eventEmitter.call(self) ;
        return self ;
    } ,
    resize : function(newSize){
        var oldSize = this.width ;
        this.width = this.height = newSize ;
        this.emit('resize',oldSize,newSize) ;
    }
}) ;
var sq = square.create(5) ;

sq.on('resize',function(oldSize,newSize){
    alert('sq resized from ' + oldSize + 'to' + newSize + '.') ;
}) ;

sq.resize(10) ;

alert(sq.area()) ;
```

蓝图在Javascript中是独一无二的。它是一个很强大的特性。然而它们也有自己的缺点。下表列出了mixin和蓝图的优缺点：

|  Mixin  |  蓝图  |
|-------|------|
|它们用来扩展对象的原型。因此对象共享同一个原型|它们用来扩展新创建的对象。因此每个对象都是在自己对象本身进行修改|
|因为缺少封装方法所以不存在私有状态|它们是函数，所以可以封装私有状态|
|它们是静态原型并且不能被自定义|它们可以传递参数来自定义对象，可以向蓝图函数传递一些用来自定义的参数|

### 修复instanceof操作

许多Javascript程序员会觉得使用原型模式来继承违背了语言的精髓。他们更偏向于构造模式因为他们觉得通过构造函数创建的对象才是真正的实例，因为`instanceof`操作会返回`true`。然而，这个争论是没有意义的，因为`instanceof`操作可以像下面这样实现：

```javascript
Object.prototype.instanceof = function(prototype){
	var object = this ;
	do{
		if(object === prototype) return true ;
		var object = Object.getPrototypeOf(object) ;
	}while(object) ;
	return false ;
}
```

这个`instanceof`方法现在可以被用来测试一个对象是否是通过委派从一个原型继承的。例如：

```javascript
sq.instanceof(square) ;
```

然而还是没有办法判断一个对象是否是通过合并的方式从一个原型继承的，因为实例的关联信息丢失了。为了解决这个问题我们将一个原型的所有克隆的引用保存在原型自身中，然后使用这个信息来判断一个对象是否是一个原型的实例。这个可以通过修改`extend`方法来实现：

```javascript
Object.prototype.extend = function(){
	var hasOwnProperty = Object.hasOwnProperty ;
	var object = Object.create(this) ;
	var length = arguments.lenght ;
	var index = length ;

	while(index){
		var extension = arguments[length - (index--)] ;

		for(var property in extension){
			if(property !== 'clones' &&
				hasOwnProperty.call(extension,property) ||
				typeof object[property] === 'undefined')
				object[property] = extension[property] ;

		if(hasOwnProperty.call(extension,'clones')})
			extension.clones.unshift(object) ;
		else
			extension.clones = [object] ;
		}
	}
	return object;
} ;
```

通过合并继承自原型的对象形成了一个克隆树，这些树从根对象开始然后向下一直到叶子对象。一个克隆链是一个从根对象到叶子对象的单一路径，这跟遍历原型链很相似。我们可以使用这个信息来判断一个对象是否是通过合并继承自一个原型。

```javascript
Object.prototype.instanceof = function(prototype){
	if (Object.hasOwnProperty.call(prototype, "clones"))
		var clones = prototype.clones;
	var object = this;

	do {
		if (object === prototype ||
			clones && clones.indexOf(object) >= 0)
			return true;
		var object = Object.getPrototypeOf(o  bject);
	} while (object);

	return false;
} ;
```

这个`instanceof`方法现在可以用来判断一个对象是否是通过合并继承自一个原型。例如:

```javascript
sq.instanceof(eventEmitter);
```

在上面的程序中`instanceof`会返回`true`如果我妈使用mixin版本的`eventEmitter`。然而如果我们使用蓝图版本的`eventEmitter`它会返回`false`。为了解决这个问题我创建了一个蓝图函数，这个函数接收一个蓝图作为参数，向它添加一个`clones`属性然后返回一个记录了它的克隆的新蓝图：

```javascript
function blueprint(f){
	var g = function(){
		f.apply(this,arguments) ;
		g.clones.unshift(this) ;
	} ;
	g.clones = [] ;
	return g ;
} ;
var eventEmitter = blueprint(function(){
	var events = Object.create(null);
    this.on = function (event, listener) {
        if (typeof events[event] !== "undefined")
            events[event].push(listener);
        else events[event] = [listener];
    };

    this.emit = function (event) {
        if (typeof events[event] !== "undefined") {
            var listeners = events[event];
            var length = listeners.length, index = length;
            var args = Array.prototype.slice.call(arguments, 1);

            while (index) {
                var listener = listeners[length - (index--)];
                listener.apply(this, args);
            }
        }
    };
}) ;
```

### 向原型发送变化

上面例子中的`clones`属性有双重作用。它可以用来判断一个对象是否是通过合并继承自一个原型的，然后他可以用来发送原型改变给所有它的克隆。原型继承相比类继承最大的优势就是你可以修改一个原型在它创建之后。为了使克隆可以继承对于原型的修改，我们创建了一个叫做`define`的函数：

```javascript
Object.prototype.define = function (property, value) {
    this[property] = value;

    if (Object.hasOwnProperty.call(this, "clones")) {
        var clones = this.clones;
        var length = clones.length;

        while (length) {
            var clone = clones[--length];
            if (typeof clone[property] === "undefined")
                clone.define(property, value);
        }
    }
};
```

现在我们可以修改原型然后这个修改会反映在所有的克隆上。例如我们可以创建创建一个别名`addEventListener`针对`eventEmitter`上的`on`方法：

```javascript
var square = rectangle.extend(eventEmitter, {
    create: function (side) {
        return rectangle.create.call(this, side, side);
    },
    resize: function (newSize) {
        var oldSize = this.width;
        this.width = this.height = newSize;
        this.emit("resize", oldSize, newSize);
    }
});

var sq = square.create(5);

eventEmitter.define("addEventListener", eventEmitter.on);

sq.addEventListener("resize", function (oldSize, newSize) {
    alert("sq resized from " + oldSize + " to " + newSize + ".");
});

sq.resize(10);

alert(sq.area());
```

蓝图需要特别注意。尽管对于蓝图的修改会被发送到它的克隆，但是蓝图的新的克隆并不会反映这些修改。幸运的是这个问题的解决方法很简单。我们只需要对`blueprint`方法进行小小的修改，然后任何对于蓝图的修改就会反映在克隆上了。

```javascript
function blueprint(f) {
    var g = function () {
        f.apply(this, arguments);
        g.clones.unshift(this);

        var hasOwnProperty = Object.hasOwnProperty;

        for (var property in g)
            if (property !== "clones" &&
                hasOwnProperty.call(g, property))
                    this[property] = g[property];
    };

    g.clones = [];

    return g;
};
```

## 结论

恭喜你。如果你读完了整篇文章并且理解了我所说的东西，你现在就了解了 原型继承并且为什么它很重要。很感谢你们看完了这篇文章。我希望这个博客能帮到你们。原型继承是强大的并且值得更多的信任。然后大部分人从来不明白这个因为Javascript中的原型继承被构造模式所掩盖了。

## 译者注

这篇文章针对几种继承方式进行了对比。文章中说到的几种扩展的方法我觉得是比较有用的。蓝图(blueprint，这个实在不知道该怎么翻译)的扩展方式比较像设计模式中的装饰者模式，通过函数对对象进行扩展，这个是一种比较好玩的扩展方式，可以跟原型继承配合使用。另外文中提到了`new`关键字的弊端，个人觉得主要的原因还是`new`关键字的出现掩盖了Javascript本身原型继承的特点，人们自然而然就会想到传统的类继承，这样就无法发挥原型继承的最大威力。最后说到的属性修改传播的问题也挺有意思的，应该会有相应的应用场景。总之，我觉得原型继承相比于传统的类继承提供了更大的灵活性，可以给我们开发者提供很大的发挥空间，不过不管怎样，到最后还是要涉及到基本的原型继承的原理上，所以掌握了原型继承的原理就可以根据不同的应用场景使用各种各样的扩展方式。


---

> 原文地址：http://aaditmshah.github.io/why-prototypal-inheritance-matters/
