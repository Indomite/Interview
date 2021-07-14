## 深入浅出Babel

在现代JavaScript中babel的作用可谓是举足轻重，无论是工程化通过babel进行编码，还是说在ES6中通过babel转码编译，作为一个工具链，主要用于在当前和旧的浏览器或环境中，将 ECMAScript 2015+ 代码转换为 JavaScript 向后兼容版本的代码。

- 转换语法
- Polyfill 目标环境中缺少的功能（通过如 [core-js](https://github.com/zloirock/core-js) 的第三方 `polyfill`）
- 源代码转换(codemods)

### Babel的处理流程

https://bobi.ink/2019/10/01/babel/

1. **词法解析(Lexical Analysis)**： 词法解析器(Tokenizer)在这个阶段将字符串形式的代码转换为Tokens(令牌). Tokens 可以视作是一些语法片段组成的数组.每个 Token 中包含了语法片段、位置信息、以及一些类型信息. 这些信息有助于后续的语法分析。

2. 语法解析器(Parser)会把Tokens转换为抽象语法树(Abstract Syntax Tree，AST)

   **AST 是 Babel 转译的核心数据结构，后续的操作都依赖于 AST**。

3. 接着就是**转换(Transform)**了，转换阶段会对 AST 进行遍历，在这个过程中对节点进行增删查改。Babel 所有插件都是在这个阶段工作, 比如语法转换、代码压缩。

4. **Javascript In Javascript Out**, 最后阶段还是要把 AST 转换回字符串形式的Javascript，同时这个阶段还会生成Source Map。

### Babel的架构

![img](https://bobi.ink/images/babel/arch.png)

#### babel核心

`@babel/core` 对于Babel来说，这个内核主要干这些事情：

- 加载和处理配置(config)
- 加载插件
- 调用 `Parser` 进行语法解析，生成 `AST`
- 调用 `Traverser` 遍历AST，并使用访问者模式应用’插件’对 AST 进行转换
- 生成代码，包括SourceMap转换和源代码生成

#### 核心周边支撑

- **Parser(`@babel/parser`)**： 将源代码解析为 AST 就靠它了。 它已经内置支持很多语法. 例如 JSX、Typescript、Flow、以及最新的ECMAScript规范。目前为了执行效率，parser是[不支持扩展的](https://babeljs.io/docs/en/babel-parser#faq)，由官方进行维护。如果你要支持自定义语法，可以 fork 它，不过这种场景非常少。
- **Traverser(`@babel/traverse`)**： 实现了`访问者模式`，对 AST 进行遍历，`转换插件`会通过它获取感兴趣的AST节点，对节点继续操作, 下文会详细介绍`访问器模式`。
- **Generator(`@babel/generator`)**： 将 AST 转换为源代码，支持 SourceMap

#### 插件

- **语法插件(`@babel/plugin-syntax-\*`)**：上面说了 `@babel/parser` 已经支持了很多 JavaScript 语法特性，Parser也不支持扩展. **因此`plugin-syntax-\*`实际上只是用于开启或者配置Parser的某个功能特性**。

  一般用户不需要关心这个，Transform 插件里面已经包含了相关的`plugin-syntax-*`插件了。用户也可以通过[`parserOpts`](https://babeljs.io/docs/en/options#parseropts)配置项来直接配置 Parser

- **转换插件**： 用于对 AST 进行转换, 实现转换为ES5代码、压缩、功能增强等目的. Babel仓库将转换插件划分为两种(只是命名上的区别)：

  - `@babel/plugin-transform-*`： 普通的转换插件
  - `@babel/plugin-proposal-*`： 还在’提议阶段’(非正式)的语言特性, 目前有[这些](https://babeljs.io/docs/en/next/plugins#experimental)

- **预定义集合(`@babel/presets-\*`)**： 插件集合或者分组，主要方便用户对插件进行管理和使用。比如`preset-env`含括所有的标准的最新特性; 再比如`preset-react`含括所有react相关的插件



- `@babel/template`： 某些场景直接操作AST太麻烦，就比如我们直接操作DOM一样，所以Babel实现了这么一个简单的模板引擎，可以将字符串代码转换为AST。比如在生成一些辅助代码(helper)时会用到这个库
- `@babel/types`： AST 节点构造器和断言. 插件开发时使用很频繁
- `@babel/helper-*`： 一些辅助器，用于辅助插件开发，例如简化AST操作
- `@babel/helper`： 辅助代码，单纯的语法转换可能无法让代码运行起来，比如低版本浏览器无法识别class关键字，这时候需要添加辅助代码，对class进行模拟。

**访问者模式**

想象一下，Babel 有那么多插件，如果每个插件自己去遍历AST，对不同的节点进行不同的操作，维护自己的状态。这样子不仅低效，它们的逻辑分散在各处，会让整个系统变得难以理解和调试， 最后插件之间关系就纠缠不清，乱成一锅粥。

**所以转换器操作 AST 一般都是使用`访问器模式`，由这个`访问者(Visitor)`来 ① 进行统一的遍历操作，② 提供节点的操作方法，③ 响应式维护节点之间的关系；而插件(设计模式中称为‘具体访问者’)只需要定义自己感兴趣的节点类型，当访问者访问到对应节点时，就调用插件的访问(visit)方法**。



#### 事例：

代码：

```js
function hello(v) {
  console.log('hello' + v + '!')
}
```

解析的AST：

```
File
  Program (program)
    FunctionDeclaration (body)
      Identifier (id)  #hello
      Identifier (params[0]) #v
      BlockStatement (body)
        ExpressionStatement ([0])
          CallExpression (expression)
            MemberExpression (callee)  #console.log
              Identifier (object)  #console
              Identifier (property)  #log
            BinaryExpression (arguments[0])
              BinaryExpression (left)
                StringLiteral (left)  #'hello'
                Identifier (right)  #v
              StringLiteral (right)  #'!'
```

调用顺序：

![img](https://bobi.ink/images/babel/traveser.png)

