# 运行

- npm i

- npm start

- 把 index.html 拖到浏览器里就可以了

# 优化点

- typescript重构

```js
const handWritting = new HandWritting('canvasId', 'canvasTmpId')
```

- handwritting里只包含（笔，橡皮，圈选，旋转/移动/缩放，撤销恢复基本功能）

笔，橡皮，圈选功能切换

```js
handWritting.setStatus('pen' || 'eraser' || 'choose-pen')
```

旋转/移动/缩放等功能在 choose-pen 状态下，圈选元素后默认触发

撤销恢复,暂时只有 添加元素，删除元素，橡皮擦擦去元素这三种情况下进行撤销恢复,之后可添加


- 旋转移动撤销外框 改成canvas方式绘制，并设置成可配置的

自定义操作配置。

1.继承 `./elements/control/control.ts` 

2.handWritting添加自定义control


```js
class customControl extends control {}
handWritting.addControl(customControl)
```

- 撤销恢复功能 改成 简单策略模式，随后可拓展成简单语法解析

- 神笔等配置成插件，提供必要参数，放置在 /plugins/ 下

两种加载插件方法，一是将代码放到 `./plugins/` 下方，handWritting 初始化时自动加载该文件夹下每个文件夹下的 `index.ts` 文件

第二种是调用 `handWritting.loadPlugin(name, plugin)` 来动态加载插件

怎么调用自定义插件？

```js
handWritting.setStatus(name) // name 如果是第一种加载方法的话 name是文件夹的名字，如果是第二种方法时 name 是 `handWritting.loadPlugin(name, plugin)` 中的name

```

最终插件开发模式，应该是继承npm包 `@peiyou/elementbase` 这种，然后基于它开发


# 未完成

- declare 问题，比如 point类型 需要文件多次引用

- 旋转/移动/缩放 一次操作多种变化时会不准确

- 点选功能有问题，圈选需要优化

- 撤销恢复基本功能未完善 [todo]

- 神笔/尺规/几何图形等功能未完成

- 手掌橡皮未完成

- 剪切板粘贴到canvas [TODO]

- 滤镜

- 动画

- 特效

# 功能开发点

## 剪切板粘贴到canvas

# 其他

- canvas 设置宽高

```html
<!-- 不能用css设置 -->
<canvas id="canvasId" width="1920" height="1080"></canvas>
```





