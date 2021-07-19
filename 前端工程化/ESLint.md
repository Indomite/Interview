# ESlint全讲
> 为什么需要ESlint？      

ESLint 是在 ECMAScript/JavaScript 代码中识别和报告模式匹配的工具，它的目标是保证**代码的一致性和避免错误**，还可以**统一代码风格**      
（其实在eslint --init初始化的时候选择的功能**To check syntax, find problems, and enforce code style**，就已经明确说明ESlint是干什么的）

## 怎么安装
[官网讲解](http://eslint.cn/docs/user-guide/getting-started)    
首先ESlint基于node编写，那么属于npm的包，但是又属于可执行命令一类
```bush
//全局安装
npm i eslint -g
eslint [检测的文件...] //全局安装可以直接执行指令，省事，但是对于项目的维护性来说不强（如果团队开发ESlint配置应该统一


//本地依赖安
npm init -y
npm i eslint -D //它只是检测代码，而且是静态检测（不是执行的时候检测），所以相当于一个工具或者说是一个插件
npx eslint [检测的文件...]
```

## 高度配置化
> ESlint优秀的地方就是规则可以根据自己的团队风格去边，自由度非常高

[官网讲解](http://eslint.cn/docs/user-guide/configuring)    
先说下几种配置方式
- package.json的eslintConfig字段进行配置，配置的内容和.eslintrc.json形式一致
- [npx(可选)] eslint --init 选择三种配置文件.eslintrc[.js、.json、.yaml]
- 在要使用eslint扫描的源文件中使用eslint规定格式的注释，声明对于的规则（只在该文件声明之后的地方有效）

虽然配置的方式多种多样，但是万变不离其宗：在.eslintrc.js文件怎么配，其它的方式只是换个地方（**当然生效的优先级有区分**）：      
原代码注释 > .eslintrc.js > .eslintrc.yaml > .eslintrc.json > package.json
**这种优先级具有覆盖性**（先埋个坑）

## 具体的配置项

```javascript
module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "rules": {
    }
}
```
- env 代表环境，针对不同的环境会做不同的**语法检查**（内置对象不同）
- extends 代码规则的继承，如果是一个数组，递归的依次合并（**啥是继承？**）
- parserOptions 一些基础的解析配置，比如ecmaVersion代表安装ECMAScript几来分析代码（还可以配置一些插件的选项，比如JSX的分析）
- rules 代码检测的规则（eslint的核心，规定如何检测）

## 覆盖VS继承
1. eslint的rules字段既然是检测错误的规则，那么需要规定检测是否需要检测错误，检测错误的级别，分别对应：
off（关闭检测）或者数字0，warn（产生警告）或者数字1，error（产生错误）或者数字2     

2. 假定我们需要一个规定字符串使用的标识符：单引号、双引号、反勾号（字符串模板）

3. 我们会这样配置rules的quotes，
    ```json
    //extends1
    {
        "rules": {
            "quotes": ["error"]
        }
    }
    //extend2
    {
        "rules": {
            "quotes": ["error"]
        }
    }
    //extend1和extend2在配置在extends字段的效果
    {
        "rules": {
            "quotes": ["error", "double"]
        }
    }
    //extend1和extend2进行覆盖的结果，谁在前优先级高
    {
        "rules": {
            "quotes": ["error"]
        }
    }
    ```
- 配置的extends是属于继承关系
- **不同的配置方式**属于覆盖（前面的5种）、配置的rules相对extends产生的基础配置属于覆盖

## global字段配置
> 其实就是一个no-undef的语法解析的排除选项配置，你可以选择直接在rules中关闭

当访问当前源文件内未定义的变量时，**no-undef** 规则将发出警告。如果你想在一个源文件里使用全局变量，推荐你在 ESLint 中定义这些全局变量，这样 ESLint 就不会发出警告了。你可以使用注释或在配置文件中定义全局变量

globals 配置属性设置为一个对象，该对象包含以你希望使用的每个全局变量。对于每个全局变量键，将对应的值设置为 "writable" 以允许重写变量，或 "readonly" 不允许重写变量
```javascript
{
    "globals": {
        "var1": "writable",
        "var2": "readonly"
    }
}
```

## rules配置规则
[官网讲解](http://eslint.cn/docs/rules/)    
需要注意的是
- 所有的规则默认都是禁用的。在配置文件中，使用 "extends": "eslint:recommended" 来启用推荐的规则，报告一些常见的问题，在下文中这些推荐的规则都带有一个**绿色**标记。
- 对于空格的风格则有**黄色**标记

## plugin插件
ESlint是一个完全插件化的插件，可以将各各不同的功能实现交给ESlint对应的插件去处理，比如React的JSX识别，Vue的template识别
> 如果说eslint本身是对JS的语法分析和风格要求，那么eslint的插件就是为了解析其它的文件类型（JSX文件，VueTemplate文件）

## glob模式
如果同一个目录下的文件需要有不同的配置。因此，你可以在配置中使用 overrides 键，它只适用于匹配特定的 glob 模式的文件，使用你在命令行上传递的格式 (e.g., app/**/*.test.js)
```json
{
    "overrides": [
    {
        //*表示所有的 /**/*.js表示任意层级的目录下
      "files": ["bin/*.js", "lib/*.js"],
      "excludedFiles": "*.test.js",
      "rules": {
        "quotes": ["error", "single"]
      }
    }
  ]
}
```

## ESlint命令
- eslint 文件夹目录 [...文件夹目录] eslint默认处理.js的文件，如果指定文件目录会递归的扫描所有的.js文件（可以处理多个目录下的js文件）
- eslint --ext .js,.jsx 文件夹目录 [...文件夹目录]
