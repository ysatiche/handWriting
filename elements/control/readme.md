# control

## 流程

### 出现 control

handlechoose 之后 如果有元素被选中，则出现，设置 flag

### 当drawbegin 时

判断点是否在 control 区域中，如果不在，则 control 消失，flag消失 在的话则 drawbegin return

### drawing时

如果 flag 存在时，则return

### render

如果有control存在，则先获取变化矩阵,在调用其他元素render






