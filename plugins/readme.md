# canvas plugins 

## 如何加载

- 内置插件，如（神笔，尺规等）

通过动态模块加载

- 外置插件，先下载文件或者npm包引入

## 插件管理

### `HandWritting.ts` 中提供一套api来管理

- loadPlugin(module)

### 通过插件的配置文件来申明

```js
{
  renderCtx: 'ctx', // 表示render时使用的画布，'ctx' 'ctxTemp', 注意：当选择为ctxTemp时，drawend 后ctxtemp 会清空
  saveCtx: true // 如果 renderCtx == 'ctxTemp' 时，是否在 drawend 后重绘到ctx，当为 false 时，不会被计入 eles 中
}
```


