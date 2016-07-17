title: 看看 Grunt 的源码（二）：grunt 任务运行相关源码解析
date: 2015-04-19 14:46:55
tags: ['grunt']
---
上一篇分享了关于grunt-cli的源码解析，这篇开始grunt核心部分代码的解析，还是从上一篇结束部分开始。
<!-- more -->
```javascript
//调用grunt执行任务
require(gruntpath).cli();
```
  `gruntpath`是通过解析得到的grunt.js的文件路径，通过`require`方法加载grunt模块然后调用模块的`cli`方法来运行命令行最后运行命令行中的任务。

  我们先从大体上看看grunt从输入命令行到任务运行完毕整个过程中都经过了哪些步骤。下图是我根据源码得出的一个流程图。

![图片描述][1]

1. 首先，我们输入命令行之后调用`require(gruntpath).cli()`方法，在cli方法中会初始化命令行的默认参数列表，解析输入命令行的参数以及任务名称
2. 然后调用`grunt.tasks`方法，将任务参数和名称传入。在`grunt.tasks`方法中，会进一步对参数进行解析，初始化log功能，如果参数带有version或者help选项那么直接执行相应的函数，否则就解析任务名称。
3. 接着调用`task.init`方法。加载`Gruntfile.js`文件，注册任务信息以及配置信息。
4. 接着调用`task.run`方法。`task.run`方法并不会运行任务，而是把任务相关信息添加到任务队列中。
5. 最后才是调用`task.start`方法来依次运行任务队列中的任务。
下面来一步步解析grunt核心源码。首先，来看看`lib/grunt/cli.js`文件中的代码。
```javascript
// 执行命令行时执行的函数
var cli = module.exports = function(options, done) {
  // 利用传递的参数设置cli.options对象，但是不覆盖命令行的参数
  if (options) {
    Object.keys(options).forEach(function(key) {
      if (!(key in cli.options)) {
        // 如果输入的命令行中不存在这个参数，那么把它加入到cli的options属性中
        cli.options[key] = options[key];
      } else if (cli.optlist[key].type === Array) {
        // 如果输入的命令行中存在这个参数，并且参数的类型是数组，那么把它加入到数组尾部
        [].push.apply(cli.options[key], options[key]);
      }
    });
  }

  // 运行任务
  grunt.tasks(cli.tasks, cli.options, done);
};

// 默认的参数选项列表
var optlist = cli.optlist = {
  help: {
    short: 'h',
    info: 'Display this help text.',
    type: Boolean
  },
  base: {
    info: 'Specify an alternate base path. By default, all file paths are relative to the Gruntfile. ' +
          '(grunt.file.setBase) *',
    type: path
  },
  color: {
    info: 'Disable colored output.',
    type: Boolean,
    negate: true
  },
  gruntfile: {
    info: 'Specify an alternate Gruntfile. By default, grunt looks in the current or parent directories ' +
          'for the nearest Gruntfile.js or Gruntfile.coffee file.',
    type: path
  },
  debug: {
    short: 'd',
    info: 'Enable debugging mode for tasks that support it.',
    type: [Number, Boolean]
  },
  stack: {
    info: 'Print a stack trace when exiting with a warning or fatal error.',
    type: Boolean
  },
  force: {
    short: 'f',
    info: 'A way to force your way past warnings. Want a suggestion? Don\'t use this option, fix your code.',
    type: Boolean
  },
  tasks: {
    info: 'Additional directory paths to scan for task and "extra" files. (grunt.loadTasks) *',
    type: Array
  },
  npm: {
    info: 'Npm-installed grunt plugins to scan for task and "extra" files. (grunt.loadNpmTasks) *',
    type: Array
  },
  write: {
    info: 'Disable writing files (dry run).',
    type: Boolean,
    negate: true
  },
  verbose: {
    short: 'v',
    info: 'Verbose mode. A lot more information output.',
    type: Boolean
  },
  version: {
    short: 'V',
    info: 'Print the grunt version. Combine with --verbose for more info.',
    type: Boolean
  },
  completion: {
    info: 'Output shell auto-completion rules. See the grunt-cli documentation for more information.',
    type: String
  },
};

// 利用optlist列表初始化aliases和known对象
// 传递给nopt模块进行命令行参数解析
// nopt是一个用来解析命令行参数的第三方模块
var aliases = {};
var known = {};

Object.keys(optlist).forEach(function(key) {
  var short = optlist[key].short;
  if (short) {
    aliases[short] = '--' + key;
  }
  known[key] = optlist[key].type;
});

var parsed = nopt(known, aliases, process.argv, 2);
// 获取命令行中的任务名称
cli.tasks = parsed.argv.remain;
// 获得命令行中的参数
cli.options = parsed;
delete parsed.argv;

// 初始化类型为数组但是还没被初始化的参数，比如npm和task
Object.keys(optlist).forEach(function(key) {
  if (optlist[key].type === Array && !(key in cli.options)) {
    cli.options[key] = [];
  }
});
```
这段代码相对比较简单，主要功能就是解析任务名和参数然后传递给`grunt.tasks`方法进行调用。
下面来看看`grunt.js`中关于`grunt.tasks`方法的代码。
```javascript

// 这个tasks方法一般只在grunt内部调用
// tasks方法用来将任务添加到任务队列中，并且运行任务
grunt.tasks = function(tasks, options, done) {
  // option模块对命令行参数进行包装
  // init方法对参数进行了初始化，在方法内部判断传入参数是否为空
  // 如果为空则初始化为空对象否则使用传入的对象进行初始化
  option.init(options);

  var _tasks, _options;
  // option方法接受可变属性的参数，
  // 如果传入一个参数则在参数对象中找出对于的参数，
  // 如果传入两个参数则根据这两个参数设置key-value键值对，并value
  // 同时方法内部会用正则匹配no-color、no-write的情况，
  // 如果出现则设置option['color']或option['write']为false，并返回false
  if (option('version')) {
    // 如果带有version参数
    // 输出版本信息
    log.writeln('grunt v' + grunt.version);

    if (option('verbose')) {
      // //输出详细信息，包括grunt的路径
      verbose.writeln('Install path: ' + path.resolve(__dirname, '..'));

      grunt.log.muted = true;
      // 初始化任务系统，解析gruntfile以便输出所有可用的任务
      grunt.task.init([], {help: true});
      grunt.log.muted = false;

      // 输出可用的任务信息
      _tasks = Object.keys(grunt.task._tasks).sort();
      verbose.writeln('Available tasks: ' + _tasks.join(' '));

      // 输出所有可用参数的详细信息
      _options = [];
      Object.keys(grunt.cli.optlist).forEach(function(long) {
        var o = grunt.cli.optlist[long];
        _options.push('--' + (o.negate ? 'no-' : '') + long);
        if (o.short) { _options.push('-' + o.short); }
      });
      verbose.writeln('Available options: ' + _options.join(' '));
    }

    return;
  }

  // 初始化log的着色功能
  log.initColors();

  // 如果参数带有help则输出帮助信息
  if (option('help')) {
    help.display();
    return;
  }

  // 根据option输出命令行参数，flags方法会过滤掉值为空的参数
  verbose.header('Initializing').writeflags(option.flags(), 'Command-line options');

  // 判断是否有传入tasks参数并且任务长度大于0
  var tasksSpecified = tasks && tasks.length > 0;
  //将传入参数进行转换，转换为任务数组，如果没有传入有效的任务那么使用默认default任务
  tasks = task.parseArgs([tasksSpecified ? tasks : 'default']);

  // 根据传入的tasks参数初始化任务
  // 在方法中加载gruntfile.js文件，进行任务注册和配置的解析
  // 也就是加载我们编写的任务代码
  task.init(tasks, options);

  verbose.writeln();
  if (!tasksSpecified) {
    verbose.writeln('No tasks specified, running default tasks.');
  }
  verbose.writeflags(tasks, 'Running tasks');

  // 注册异常处理函数，输出异常信息
  var uncaughtHandler = function(e) {
    fail.fatal(e, fail.code.TASK_FAILURE);
  };
  process.on('uncaughtException', uncaughtHandler);

  task.options({
    error: function(e) {
      fail.warn(e, fail.code.TASK_FAILURE);
    },
    done: function() {
      // 当任务完成之后移除异常监听函数，减少多余的开销
      process.removeListener('uncaughtException', uncaughtHandler);

      // 输出最后的运行结果，失败或者成功
      fail.report();

      if (done) {
        // 如果存在done函数的话，当完成任务时执行done函数
        done();
      } else {
        // 如果没有done函数直接结束进程
        util.exit(0);
      }
    }
  });

  // 将任务依次加入内部的任务队列中，run方法并不会运行任务，只是加入到队列中
  tasks.forEach(function(name) { task.run(name); });
  // 开始运行任务队列中的任务
  task.start({asyncDone:true});
};
```
在`grunt.tasks`代码中，首先会进行参数的初始化，接着判断参数是否带有version或者help选项，如果带有这两个选项就进行相应的工作而不运行任务任务，否则解析任务名进行任务初始化并添加到任务队列中，最后运行任务。
在`grunt.tasks`方法中比较重要的三个方法就是`task.init`，`task.run`和`task.start`方法。下面看看`task.init`方法的具体实现。这个方法位于`lib/grunt/task.js`文件中。
```javascript
// 初始化任务
task.init = function(tasks, options) {
  if (!options) { options = {}; }

  // 拥有init方法说明task是初始化任务，比如第三方插件
  var allInit = tasks.length > 0 && tasks.every(function(name) {
    var obj = task._taskPlusArgs(name).task;
    return obj && obj.init;
  });

  // 获取gruntfile.js路径，如果有指定路径那么直接使用否则在当前目录及父目录中查找
  var gruntfile, msg;
  if (allInit || options.gruntfile === false) {
    gruntfile = null;
  } else {
    gruntfile = grunt.option('gruntfile') ||
      grunt.file.findup('Gruntfile.{js,coffee}', {nocase: true});
    msg = 'Reading "' + (gruntfile ? path.basename(gruntfile) : '???') + '" Gruntfile...';
  }
  // 如果参数中将gruntfile设为false，那么说明任务是一个插件或者库
  // 不做任何操作
  if (options.gruntfile === false) {
    // Grunt was run as a lib with {gruntfile: false}.
  } else if (gruntfile && grunt.file.exists(gruntfile)) {
    // 如果存在gruntfile
    grunt.verbose.writeln().write(msg).ok();
    // 修改进程的操作目录，如果有指定base那么使用base目录否则就使用gruntfile所在的目录
    process.chdir(grunt.option('base') || path.dirname(gruntfile));
    // 在verbose情况下输出Registering Gruntfile tasks信息
    loadTasksMessage('Gruntfile');
    // 加载gruntfile中的任务
    loadTask(gruntfile);
  } else if (options.help || allInit) {
    // 如果没找到grunt但是有help参数的话，那么不做任何操作
  } else if (grunt.option('gruntfile')) {
    // 如果指定了gruntfile参数但是找不到文件那么输出错误信息
    grunt.log.writeln().write(msg).error();
    grunt.fatal('Unable to find "' + gruntfile + '" Gruntfile.', grunt.fail.code.MISSING_GRUNTFILE);
  } else if (!grunt.option('help')) {
    grunt.verbose.writeln().write(msg).error();
    grunt.log.writelns(
      'A valid Gruntfile could not be found. Please see the getting ' +
      'started guide for more information on how to configure grunt: ' +
      'http://gruntjs.com/getting-started'
    );
    grunt.fatal('Unable to find Gruntfile.', grunt.fail.code.MISSING_GRUNTFILE);
  }

  // 加载用户指定的npm包
  (grunt.option('npm') || []).forEach(task.loadNpmTasks);
  // 加载用户指定的任务
  (grunt.option('tasks') || []).forEach(task.loadTasks);
};
```
在初始化任务之后`grunt.tasks`方法会调用`task.run`方法，将任务添加到任务队列中等待执行。下面是`task.run`方法的代码，它也是位于`lib/util/task.js`文件中。
```javascript
// 将任务加入到队列中
Task.prototype.run = function() {
  // 将参数转换为数组并且根据参数构建任务对象
  var things = this.parseArgs(arguments).map(this._taskPlusArgs, this);
  // 找出无法构建的任务
  var fails = things.filter(function(thing) { return !thing.task; });
  if (fails.length > 0) {
    // 如果存在无法构建的任务，抛出错误并返回
    this._throwIfRunning(new Error('Task "' + fails[0].nameArgs + '" not found.'));
    return this;
  }

  // 将任务加入到任务队列相应的位置
  this._push(things);
  // 支持链式调用
  return this;
};
// 将任务名分离为真实运行的任务名和参数的对象，比如：
// 'foo'          ==>  任务名为foo，没有参数
// 'foo:bar:baz'  ==>  如果'foo:bar:baz'任务存在，那么任务名为'foo:bar:baz'，没有参数
//                ==>  如果'foo:bar'任务存在，那么任务名为'foo:bar'，参数为'baz'
//                ==>  如果'foo'任务存在，那么任务名为'foo'，参数为'bar'和'baz'
Task.prototype._taskPlusArgs = function(name) {
  // 将传入的任务名根据冒号转换为数组
  var parts = this.splitArgs(name);
  // 从数组最后开始遍历数组
  var i = parts.length;
  var task;
  do {
    // 将0到i的数组转换为任务名，用冒号隔开
    // 然后根据得到的任务名从任务缓存中得到相应的任务
    task = this._tasks[parts.slice(0, i).join(':')];
    // 如果相应任务不存在，那么i减1，知道i等于0
  } while (!task && --i > 0);
  // 除了任务名以外的部分属于参数
  var args = parts.slice(i);
  // 根据参数列表，得到相应的boolean型标记
  var flags = {};
  args.forEach(function(arg) { flags[arg] = true; });
  // 返回构建的任务对象，包括任务名和任务参数
  return {task: task, nameArgs: name, args: args, flags: flags};
};
```
在`task.run`方法中，首先将参数进行分离，分隔出任务名和参数，然后利用任务名和参数构建一个任务对象，最后将这个对象放入任务队列中，参数分离的实现方法为`_taskPlusArgs`。调用`task.run`之后，`grunt.tasks`方法马上就会调用`task.start`方法运行任务队列中的任务。`task.start`方法的实现也在`lib/util/task.js`文件中，如下：
```javascript
// 开始运行任务队列中的任务
Task.prototype.start = function(opts) {
  //初始化opts对象
  if (!opts) {
    opts = {};
  }
  // 如果任务正在运行则退出
  if (this._running) { return false; }
  // 通过nextTask依次运行队列中的任务
  var nextTask = function() {
    // 用来保存从队列中取出的任务对象
    var thing;
    // 取出队列中的元素，直到取出的元素不是placeholder和marker
    // placeholder用来处理嵌套任务的情况
    do {
      //取出队列中的任务对象
      thing = this._queue.shift();
    } while (thing === this._placeholder || thing === this._marker);
    // 如果队列为空，那么完成任务，执行可选的done函数并返回
    if (!thing) {
      this._running = false;
      if (this._options.done) {
        this._options.done();
      }
      return;
    }
    // 向队列中插入一个placeholder
    this._queue.unshift(this._placeholder);

    // 使用取出的任务对象构造任务函数的上下文对象
    var context = {
      // 任务名称:target名称:参数
      nameArgs: thing.nameArgs,
      // 任务名称
      name: thing.task.name,
      // 任务参数，这个参数包括了除了任务名以外的东西，包括target名称和参数
      args: thing.args,
      // 以args为键的键值对，值为true
      flags: thing.flags
    };

    // 运行任务的注册函数，上下文设置为上面构造的context函数
    this.runTaskFn(context, function() {
      return thing.task.fn.apply(this, this.args);
    }, nextTask, !!opts.asyncDone);

  }.bind(this);

  // 把任务标记为正在运行
  this._running = true;
  // 运行任务队列中的下一个任务
  nextTask();
};
// 运行任务的注册函数
Task.prototype.runTaskFn = function(context, fn, done, asyncDone) {
  // 标记是否异步
  var async = false;

  // 执行函数完成之后的工作，更新任务状态，执行done函数也就是运行下一个任务
  var complete = function(success) {
    var err = null;
    if (success === false) {
      // 任务运行失败，创建错误对象
      err = new Error('Task "' + context.nameArgs + '" failed.');
    } else if (success instanceof Error || {}.toString.call(success) === '[object Error]') {
      // 如果传入的是错误对象，表示任务执行失败
      err = success;
      success = false;
    } else {
      // 任务运行成功
      success = true;
    }
    // 任务结束后重置当前运行任务
    this.current = {};
    // 记录任务执行结构
    this._success[context.nameArgs] = success;
    // 如果任务失败则调用错误处理函数
    if (!success && this._options.error) {
      this._options.error.call({name: context.name, nameArgs: context.nameArgs}, err);
    }
    // 如果指定了异步执行，那么使用node自带的nextTick来运行done
    // 否则直接运行done
    if (asyncDone) {
      process.nextTick(function() {
        done(err, success);
      });
    } else {
      done(err, success);
    }
  }.bind(this);

  // 用来支持异步任务，也就是this.async()方法的实现，
  // 返回函数在异步任务完成时被调用执行complete方法
  context.async = function() {
    async = true;
    // 返回的函数在任务中的异步工作完成后被调用
    return function(success) {
      setTimeout(function() { complete(success); }, 1);
    };
  };

  // 记录当前正在运行的任务上下文
  this.current = context;

  try {
    // 执行任务的注册函数
    var success = fn.call(context);
    // 如果没有使用this.async
    // 也就是说async标记为false时在任务完成之后直接调用complete方法
    if (!async) {
      complete(success);
    }
  } catch (err) {
    complete(err);
  }
};
```
在`task.start`方法中定义了一个`nextTask`方法，方法的作用是依次执行任务队列中的任务，从任务队列中取出任务对象，利用任务对象构建一个上下文对象，然后在这个上下文中执行任务的注册函数，执行完注册函数之后执行队列中的下一个任务。执行注册函数的功能有`task.runTaskFn`方法实现。在这个方法中定义了一个`complele`方法，会在任务注册函数执行完成后备调用，进行错误处理工作。同时在`task.runTaskFn`方法中还向上下文对象`context`中添加了一个`async`方法，这个方法就是当我们需要在任务中进行一些异步操作是首先需要调用的方法，调用这个方法之后会返回一个函数，这个函数会异步执行`complete`方法，如果没有`async`方法，那么在我们任务中的异步操作还未返回时，grunt内部就会调用`complete`方法，这样就会造成错误。有了`async`方法，我们就可以确保`complete`方法是在我们任务完成之后才被调用。

上面所涉及到的几个方法就是grunt中运行任务过程中主要的几个方法。大家肯定还觉得少了点什么，想要运行任务首先需要在`gruntfile.js`中注册任务，所以下一次我将和大家分享任务注册相关的源码解析，敬请期待。

  [1]: /img/bVlrNU
