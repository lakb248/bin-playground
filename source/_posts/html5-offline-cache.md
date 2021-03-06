title: 有趣的HTML5：离线存储
date: 2014-10-21 14:45:31
tags: ['html5', 'application-cache']
---
最近由于找工作一直没时间也没有精力更新博客，找工作真是一件苦逼的事情啊。。。不抱怨了，我们来看看HTML5的新特性---离线存储吧。

随着Web App的发展，越来越多的移动端App使用HTML5的方式来开发，除了一些HybridApp以外，其他一部分Web App还是通过浏览器来访问的，通过浏览器访问就需要联网发送请求，这样就使得用户在离线的状态下无法使用App，同时Web App中一部分资源并不是经常改变，并不需要每次都向服务器发出请求，出于这些原因，HTML5提出的一个新的特性：离线存储。通过离线存储，我们可以通过把需要离线存储在本地的文件列在一个manifest配置文件中，这样即使在离线的情况下，用户也可以正常使用App。
<!-- more -->
## 怎么用
首先来讲解下离线存储的使用方法，说起来也很简单。只要在你的页面头部像下面一样加入一个`manifest`的属性就可以了。
```html
<!DOCTYPE HTML>
<html manifest = "cache.manifest">
...
</html>
```
然后`cache.manifest`文件的书写方式，就像下面这样：
```javascript
CACHE MANIFEST
#v0.11

CACHE:

js/app.js
css/style.css

NETWORK:
resourse/logo.png

FALLBACK:
/ /offline.html
```
离线存储的manifest一般由三个部分组成:
1.CACHE:表示需要离线存储的资源列表，由于包含manifest文件的页面将被自动离线存储，所以不需要把页面自身也列出来。
2.NETWORK:表示在它下面列出来的资源只有在在线的情况下才能访问，他们不会被离线存储，所以在离线情况下无法使用这些资源。不过，如果在CACHE和NETWORK中有一个相同的资源，那么这个资源还是会被离线存储，也就是说CACHE的优先级更高。
3.FALLBACK:表示如果访问第一个资源失败，那么就使用第二个资源来替换他，比如上面这个文件表示的就是如果访问根目录下任何一个资源失败了，那么就去访问offline.html。

## 浏览器怎么解析manifest

那么浏览器是怎么对离线的资源进行管理和加载的呢？这里需要分两种情况来讨论。

+ 在线的情况下，浏览器发现html头部有manifest属性，它会请求manifest文件，如果是第一次访问app，那么浏览器就会根据manifest文件的内容下载相应的资源并且进行离线存储。如果已经访问过app并且资源已经离线存储了，那么浏览器就会使用离线的资源加载页面，然后浏览器会对比新的manifest文件与旧的manifest文件，如果文件没有发生改变，就不做任何操作，如果文件改变了，那么就会重新下载文件中的资源并进行离线存储。
+ 离线的情况下，浏览器就直接使用离线存储的资源。

这个过程中有几个问题需要注意。

+ 如果服务器对离线的资源进行了更新，那么必须更新manifest文件之后这些资源才能被浏览器重新下载，如果只是更新了资源而没有更新manifest文件的话，浏览器并不会重新下载资源，也就是说还是使用原来离线存储的资源。
+ 对于manifest文件进行缓存的时候需要十分小心，因为可能出现一种情况就是你对manifest文件进行了更新，但是http的缓存规则告诉浏览器本地缓存的manifest文件还没过期，这个情况下浏览器还是使用原来的manifest文件，所以对于manifest文件最好不要设置缓存。
+ 浏览器在下载manifest文件中的资源的时候，它会一次性下载所有资源，如果某个资源由于某种原因下载失败，那么这次的所有更新就算是失败的，浏览器还是会使用原来的资源。
+ 在更新了资源之后，新的资源需要到下次再打开app才会生效，如果需要资源马上就能生效，那么可以使用`window.applicationCache.swapCache()`方法来使之生效，出现这种现象的原因是浏览器会先使用离线资源加载页面，然后再去检查manifest是否有更新，所以需要到下次打开页面才能生效。

## 咱们来试试吧
说了这么多，不如自己动手来试试。这里需要说明的是，如果需要看到离线存储的效果，那么你需要把你的网页部署到服务器上，不管是本地还是生产环境服务器中，通过本地文件打开网页是无法体验到离线存储的。
我在我的电脑上跑了一个本地node服务器，通过localhost访问。我的manifest文件向下面这样：
```javascript
CACHE MANIFEST
#v0.11

CACHE:
lib/ionic/js/ionic.bundle.js
lib/angular-ui-router.js
js/app.js
lib/ionic/css/ionic.css
css/style.css
views/login_header.html
views/login.html
lib/ionic/fonts/ionicons.ttf?v=1.5.2
lib/ionic/fonts/ionicons.woff?v=1.5.2

NETWORK:
lib/ionic/fonts/ionicons.ttf?v=1.5.2
lib/ionic/fonts/ionicons.woff?v=1.5.2
css/style.css
```
然后我们访问网页看看效果。

![图片描述][1]

可以看出浏览器根据manifest文件下载相应资源并且缓存在本地，现在我们来试试再次访问网页

![图片描述][2]

资源已经离线存储在本地，所以浏览器不需要再次下载资源，可以直接使用本地缓存的资源。接着，我们更新下服务器上的资源，比如我修改下`app.js`，结果我这里就不显示了，跟上面那张图是一样的，更新的资源并没有生效，现在我们更新下manifest文件，比如把版本改为`0.12`

![图片描述][3]

很显然，只有更新了manifest文件，对离线资源的更新才能在浏览器上生效。
最后，我们来试试离线状态下是什么情况，这才是离线存储的重头戏。通过Chrome设置离线状态，刷新页面

![图片描述][4]

由于在离线状态，所以浏览器无法访问到manifest文件，但是网页还是可以正常访问，这就是离线存储的威力。
对于HTML5中离线存储对象`window.applicationCache`有几个事件需要我们关注下：

![图片描述][5]

1.`oncached`:当离线资源存储完成之后触发这个事件，这个是文档的说法，我在Chrome上面测试的时候并没有触发这个事件。
2.`onchecking`:当浏览器对离线存储资源进行更新检查的时候会触发这个事件
3.`ondownloading`:当浏览器开始下载离线资源的时候会触发这个事件
4.`onprogress`:当浏览器在下载每一个资源的时候会触发这个事件，每下载一个资源就会触发一次。
5.`onupdateready`:当浏览器对离线资源更新完成之后会触发这个事件
6.`onnoupdate`:当浏览器检查更新之后发现没有资源更新的时候触发这个事件


参考文章：
https://developer.mozilla.org/en-US/docs/Web/HTML/Using_the_application_cache
http://diveintohtml5.info/offline.html
  [1]: https://segmentfault.com/img/bVdeEM
  [2]: https://segmentfault.com/img/bVdeEN
  [3]: https://segmentfault.com/img/bVdeEO
  [4]: https://segmentfault.com/img/bVdeEP
  [5]: https://segmentfault.com/img/bVdeE1
