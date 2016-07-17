title: Markdown初探
date: 2014-05-24 14:34:25
tags: ['markdown']
---

听说Markdown是在很早以前了，可是一直不知道这是用来干嘛的。这次由于使用Hexo搭建了博客需要使用Markdown来写博客，专门了解了一下。
<!-- more -->
# 何为Markdown
　　下面是Markdown的官网解释
> Markdown is a text-to-HTML conversion tool for web writers. Markdown allows you to write using an easy-to-read, easy-to-write plain text format, then convert it to structurally valid XHTML.

　　大致意思就是说Markdown是一个把文本转换成html的工具，它可以让我们用易于读写的文本格式在写作，然后转换为格式化的XHML。按我自己的理解，Markdown就是一种标签语言，和HTML一样，它可以用简单的符号来表示不同的文本格式，最后显示成HTML。它最大的特点就是易于读写，不管你是否了解编程，都可以用Markdown来写作。
　　
# 基本语法
　　下面这段文本涵盖了Markdown一些比较常用比较基本的语法，看完大家也就会对Markdown的语法有大致的了解。

```markdown
# 一级标题

## 二级标题

### 三级标题

以此类推最多可以有六级标题

在文本两边加上*号表示 *斜体*

在文本两边加上两个*号表示 **粗体**

在文本两边加上三个* 号表示  ***粗体并且斜体***

一个空行表示一个段落

*/-/+号后面加个空格表示无序列表

* 列表1
- 列表2
+ 列表3

数字点后面加上空格表示有序列表

1. 有序列表1
2. 有序列表2

>加空格表示引用
>引用内容

一个Tab代表代码块

代码块

可是代码块更适合用三个`包含来实现


链接用[]包含然后跟上()括号中写上链接地址[链接](http://lakb248.github.io)

```


# 一级标题
## 二级标题
### 三级标题

以此类推最多可以有六级标题

在文本两边加上 * 号表示 *斜体*

在文本两边加上两个 * 号表示 **粗体**

在文本两边加上三个 * 号表示  ***粗体并且斜体***，注意星号和文本之间没有空格

一个空行表示一个段落

*/-/+号后面加个空格表示无序列表

* 列表1
- 列表2
+ 列表3  

阿拉伯数字点后面加上空格表示有序列表

1. 有序列表1
2. 有序列表2
3. 有序列表3

　>加空格表示引用
　
>引用内容

一个Tab代表代码块

    代码块


可是代码块更适合用三个`包含来实现

```javascript
	var javascript = function(){
		for(var i = 0 ; i < length ; i ++){}
	}
```


链接用[]包含然后跟上()括号中写上链接地址[链接](http://bin-playground.top)

　　基本的语法就是上面这些，更多的语法请看[这里](http://wowubuntu.com/markdown/)。当然要熟练这些语法还是需要自己通过不断的使用来达到。
