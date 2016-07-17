title: 看看 Grunt 的源码（三）：grunt 任务注册相关源码解析
date: 2015-04-20 14:46:58
tags: ['javascript']
---
上一篇分享了关于grunt中任务运行相关源码的解析，这一篇来分享grunt中跟任务注册相关的源码解析，废话不多说，开始吧。
<!-- more -->
跟任务注册相关的两个方法是 `grunt.registerTask` 和`grunt.registerMultiTask` 。这两个方法都位于 `lib/grunt/task.js` 文件中。首先来看看 `grunt.registerTask` 方法的实现，这个方法还涉及到了 `lib/util/task.js` 文件中的 `registerTask` 方法。

```javascript
//lib/grunt/task.js
task.registerTask = function(name) {
  // 将任务加入到registry中
  registry.tasks.push(name);
  // 调用parent的registerTask方法注册任务
  parent.registerTask.apply(task, arguments);
  // 调用parent.registerTask方法之后，任务会被加入到_tasks缓存中
  var thisTask = task._tasks[name];
  // 复制任务的元数据
  thisTask.meta = grunt.util._.clone(registry.meta);
  // 对注册的任务函数进行封装
  // 在真实函数执行之前进行一些预处理
  var _fn = thisTask.fn;
  thisTask.fn = function(arg) {
    // 缓存任务名称
    var name = thisTask.name;
    // 初始化任务的errorcount
    errorcount = grunt.fail.errorcount;
    // 返回任务运行期间的errorcount
    Object.defineProperty(this, 'errorCount', {
      enumerable: true,
      get: function() {
        return grunt.fail.errorcount - errorcount;
      }
    });
    // 将task.requires方法添加到this对象中
    this.requires = task.requires.bind(task);
    // 将grunt.config.requires方法添加到this对象中
    this.requiresConfig = grunt.config.requires;
    // options方法返回任务的相关option参数，可以通过参数覆盖默认的配置
    this.options = function() {
      var args = [{}].concat(grunt.util.toArray(arguments)).concat([
        grunt.config([name, 'options'])
      ]);
      var options = grunt.util._.extend.apply(null, args);
      grunt.verbose.writeflags(options, 'Options');
      return options;
    };
    // 初始化log输出工作
    var logger = _fn.alias || (thisTask.multi && (!arg || arg === '*')) ? 'verbose' : 'log';
    grunt[logger].header('Running "' + this.nameArgs + '"' +
      (this.name !== this.nameArgs ? ' (' + this.name + ')' : '') + ' task');
    grunt[logger].debug('Task source: ' + thisTask.meta.filepath);
    // 运行真实注册的任务函数
    return _fn.apply(this, arguments);
  };
  return task;
};
//lib/util/task.js
// 注册任务
Task.prototype.registerTask = function(name, info, fn) {
  // 如果没有传递info，调整参数
  // 比如grunt.registerTask('taskName',function(){})的情况
  // 这时候info为function函数，所以把info赋值给fn
  if (fn == null) {
    fn = info;
    info = null;
  }
  // 如果fn是字符串或者字符串数组
  // 比如grunt.registerTask('task',['task1','task2','task3'])的情况
  var tasks;
  if (typeof fn !== 'function') {
    // 针对上面的情况，这时候tasks=['task1','task2','task3']
    tasks = this.parseArgs([fn]);
    // 将任务的函数改为将每个子任务添加到任务队列中
    // 也就是分别将task1,task2和task3加入任务队列中
    fn = this.run.bind(this, fn);
    fn.alias = true;
    // 这种情况下task相当于task1,task2和task3任务组合的别名
    if (!info) {
      info = 'Alias for "' + tasks.join('", "') + '" task' +
        (tasks.length === 1 ? '' : 's') + '.';
    }
  } else if (!info) {
    info = 'Custom task.';
  }
  // 将任务加入到缓存中
  this._tasks[name] = {name: name, info: info, fn: fn};
  // 返回任务对象，支持链式调用
  return this;
};
```

在 `registerTask` 方法中，首先会调用 `lib/util/task.js` 中的 `registerTask` 方法，而在这个方法中会修正方法的参数，然后将任务对象加入到任务缓存中；接着回到 `registerTask` 方法中对注册的函数进行封装，在封装的函数中会在函数执行前进行一些初始化工作，最后再执行注册函数。

下面来看看 `grunt.registerMultiTask` 方法的实现。这个方法是针对具有多个target的任务的注册。

```javascript
// 组成含有多target的task
task.registerMultiTask = function(name, info, fn) {
  // 针对grunt.registerMultiTask('taskName',function(){})的情况
  if (fn == null) {
    fn = info;
    info = 'Custom multi task.';
  }

  var thisTask;
  task.registerTask(name, info, function(target) {
    var name = thisTask.name;
    // 获得除了任务名以外的参数
    this.args = grunt.util.toArray(arguments).slice(1);
    // 如果没有指定target或者指定为*，那么运行所以target
    if (!target || target === '*') {
      return task.runAllTargets(name, this.args);
    } else if (!isValidMultiTaskTarget(target)) {
      // 如果存在不合法的target则抛出错误
      throw new Error('Invalid target "' + target + '" specified.');
    }
    // 判断是否存在对应target的配置
    this.requiresConfig([name, target]);
    // options方法返回任务的相关option参数，可以通过参数覆盖默认的配置
    this.options = function() {
      var targetObj = grunt.config([name, target]);
      var args = [{}].concat(grunt.util.toArray(arguments)).concat([
        grunt.config([name, 'options']),
        grunt.util.kindOf(targetObj) === 'object' ? targetObj.options : {}
      ]);
      var options = grunt.util._.extend.apply(null, args);
      grunt.verbose.writeflags(options, 'Options');
      return options;
    };
    // 将target添加到this对象中
    this.target = target;
    // 为this对象添加flags属性，并且初始化flags对象
    // flags对象用来记录参数列表中是否存在对象的参数
    // 如果存在值为true
    this.flags = {};
    this.args.forEach(function(arg) { this.flags[arg] = true; }, this);
    // 将target的对于配置添加到this对象中
    // 这个配置也就是我们通过initConfig定义的配置
    this.data = grunt.config([name, target]);
    // 将封装之后的files对象添加到this对象中
    this.files = task.normalizeMultiTaskFiles(this.data, target);
    // 将src的相关值添加到this的filesSrc属性中
    Object.defineProperty(this, 'filesSrc', {
      enumerable: true,
      get: function() {
        return grunt.util._(this.files).chain().pluck('src').flatten().uniq().value();
      }.bind(this)
    });
    // 调用任务注册函数，传入相应参数
    return fn.apply(this, this.args);
  });
  // 缓存任务
  thisTask = task._tasks[name];
  // 将任务标记为多任务
  thisTask.multi = true;
};
```
在 `registerMultiTask` 方法中会调用 `registerTask` 方法注册任务，而在注册的函数中首先会根据传入的target执行相应操作，如果没有传入target或者传入 `*` 那么就调用 `runAllTargets` 方法将所有target都加入任务队列中，否则执行对应的target，接着获取target的相应配置，调用 `normalizeMultiTaskFiles` 方法将配置数据转换为内部的file对象（PS：这个过程是grunt比较方便的一个地方，它有多种形式来定义文件路径之间的映射，并且支持多种表达式，file对象也是我一开始看grunt的东西，觉得这很神奇。后面我会说到这个方法），最后调用任务实际注册的函数。

下面我们就来看看 `normalizeMultiTaskFiles` 方法的具体实现。
```javascript
task.normalizeMultiTaskFiles = function(data, target) {
  var prop, obj;
  var files = [];
  if (grunt.util.kindOf(data) === 'object') {
    if ('src' in data || 'dest' in data) {
      /*
      *Compact Format的情况，比如：
      *'bar' : {
      *  'src' : ['a.js','b.js'] ,
      *  'dest' : 'c.js'
      *}
      */
      obj = {};
      // 将除了options以外的配置复制到obj对象中
      for (prop in data) {
        if (prop !== 'options') {
          obj[prop] = data[prop];
        }
      }
      files.push(obj);
    } else if (grunt.util.kindOf(data.files) === 'object') {
      /*
      *Files Object Format的情况，比如：
      *'bar' : {
      *  'files' : {
      *     'c.js' : ['a.js','b.js']
      *   }
      *}
      */
      for (prop in data.files) {
        files.push({src: data.files[prop], dest: grunt.config.process(prop)});
      }
    } else if (Array.isArray(data.files)) {
      /*
      *Files Array Format的情况，比如：
      *'bar' : {
      *  'files' : [
      *     {'src':['a.js','b.js'],'dest':'c.js'},
      *     {'src':['a.js','b.js'],'dest':'d.js'}
      *   ]
      *}
      */
      grunt.util._.flatten(data.files).forEach(function(obj) {
        var prop;
        if ('src' in obj || 'dest' in obj) {
          files.push(obj);
        } else {
          for (prop in obj) {
            files.push({src: obj[prop], dest: grunt.config.process(prop)});
          }
        }
      });
    }
  } else {
    /*
    *Older Format的情况，比如：
    *'bar' : ['a.js','b.js']
    */
    files.push({src: data, dest: grunt.config.process(target)});
  }

  // 如果没找到合法的文件配置对象，那么返回空的文件数组
  if (files.length === 0) {
    grunt.verbose.writeln('File: ' + '[no files]'.yellow);
    return [];
  }

  // 对需要扩展的文件对象进行扩展
  files = grunt.util._(files).chain().forEach(function(obj) {
    // 调整obj.src属性，使其成为一维数组
    // 如果不存在src属性，则直接返回不需要进行任何操作
    if (!('src' in obj) || !obj.src) { return; }
    // 如果obj.src是数组则压缩成一维数组，否则直接转换为数组
    if (Array.isArray(obj.src)) {
      obj.src = grunt.util._.flatten(obj.src);
    } else {
      obj.src = [obj.src];
    }
  }).map(function(obj) {
    // 在obj的基础上创建对象，移除不需要的属性，处理动态生成src到dest的映射
    var expandOptions = grunt.util._.extend({}, obj);
    delete expandOptions.src;
    delete expandOptions.dest;

    // 利用expand中的配置，扩展文件映射关系，并返回扩展后的file对象
    if (obj.expand) {
      return grunt.file.expandMapping(obj.src, obj.dest, expandOptions).map(function(mapObj) {
        // 将obj对象复制为result对象
        var result = grunt.util._.extend({}, obj);
        // 将obj对象复制为result的orig属性
        result.orig = grunt.util._.extend({}, obj);
        // 如果src或dest为模板，则解析为真正的路径
        result.src = grunt.config.process(mapObj.src);
        result.dest = grunt.config.process(mapObj.dest);
        // 移除不需要的属性
        ['expand', 'cwd', 'flatten', 'rename', 'ext'].forEach(function(prop) {
          delete result[prop];
        });
        return result;
      });
    }

    // 复制obj对象，并且向副本添加一个orig属性，属性的值也是obj对象的一个副本
    // 保存一个obj的副本orig是因为在后面可能会对result中的属性进行修改
    // orig使得result中可以访问到原始的file对象
    var result = grunt.util._.extend({}, obj);
    result.orig = grunt.util._.extend({}, obj);

    if ('src' in result) {
      // 如果result对象中具有src属性，那么给src属性添加一个get方法，
      // 方法中对src根据expand进行扩展
      Object.defineProperty(result, 'src', {
        enumerable: true,
        get: function fn() {
          var src;
          if (!('result' in fn)) {
            src = obj.src;
            // 将src转换为数组
            src = Array.isArray(src) ? grunt.util._.flatten(src) : [src];
            // 根据expand参数扩展src属性，并把结果缓存在fn中
            fn.result = grunt.file.expand(expandOptions, src);
          }
          return fn.result;
        }
      });
    }

    if ('dest' in result) {
      result.dest = obj.dest;
    }

    return result;
  }).flatten().value();

  // 如果命令行带有--verbose参数，则在log中输出文件路径
  if (grunt.option('verbose')) {
    files.forEach(function(obj) {
      var output = [];
      if ('src' in obj) {
        output.push(obj.src.length > 0 ? grunt.log.wordlist(obj.src) : '[no src]'.yellow);
      }
      if ('dest' in obj) {
        output.push('-> ' + (obj.dest ? String(obj.dest).cyan : '[no dest]'.yellow));
      }
      if (output.length > 0) {
        grunt.verbose.writeln('Files: ' + output.join(' '));
      }
    });
  }

  return files;
};
```

grunt提供了多种格式来进行文件参数的配置，`normalizeMultiTaskFiles`方法会将相应target的配置转换为一个`files`数组，这个数组中存放的是每对文件的源地址和目的地址，该方法还负责对`expand`属性相关参数进行解析，最后生成多个源地址和目的地址对存在在`files`数组中。这个方法大大方便了grunt中关于文件的操作和配置。

到这里 grunt 源码的解析就差不多了，更多的东西需要不断在实践中去理解，关于源码的详细注释请看 [这里](https://github.com/lakb248/grunt)。
