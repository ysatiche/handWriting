import ElementBase from '../element-base'
import Point from '../point'

class Eraser extends ElementBase {

  constructor () {
    super()
    this.type = 'eraser'
    this.config = {
      eraserWidth: 60
    }
  }

  _render (ctx: CanvasRenderingContext2D): boolean {
    if (!this.pointList || this.pointList.length < 1) return this.finish
    let endIndex = this.pointList.length - 1
    for (let i = this.from; i < endIndex; i++) {
      this._clearCircle(ctx, this.pointList[i])
      this.updateRectContainer(this.pointList[i])
    }
    this.from = this.pointList.length - 1
    return this.finish
  }

  _clearCircle (ctx: CanvasRenderingContext2D, p: Point): void {
    const radius = this.config.eraserWidth
    ctx.beginPath()
    ctx.arc(p.x, p.y, radius, 2 * Math.PI, 0)
    ctx.clip()
    ctx.clearRect(p.x - radius - 1, p.y - radius - 1, 2 * radius + 2, 2 * radius + 2)
  }
  /**
   * @override 重写updateRectContainer
   * 由于橡皮 Point 是一个圆 所以这次更新的是圆的外接框
   */
  updateRectContainer (p: Point): void {
    const radius = this.config.eraserWidth
    if (this.rectContainer.left < 0) {
      this.rectContainer.left = p.x - radius
      this.rectContainer.right = p.x + radius
      this.rectContainer.top = p.y - radius
      this.rectContainer.bottom = p.y + radius
    } else {
      if (p.x - radius < this.rectContainer.left) {
        this.rectContainer.left = p.x - radius
      }
      if (p.x + radius > this.rectContainer.right) {
        this.rectContainer.right = p.x + radius
      }
      if (p.y - radius < this.rectContainer.top) {
        this.rectContainer.top = p.y - radius
      }
      if (p.y + radius > this.rectContainer.bottom) {
        this.rectContainer.bottom = p.y + radius
      }
    }
  }

  /**
   * drawend后更新 this.eles
   * 遍历所有的this.eles 中 type == 'pen'
   * 将每条直线拆分成多条
   * 判断依据是否在 橡皮擦的作用区域内
   * 橡皮擦的作用区域是每个点的外接圆总和
   */
  isPointInEraserArea (point: Point): boolean {
    let flag = false
    if (this.helper.isPointInRect(point, this.rectContainer)) {
      for (let i = 0; i < this.pointList.length; i++) {
        if (this.helper.isPointInCircle(point, this.pointList[i].x, this.pointList[i].y, this.config.eraserWidth)) {
          flag = true
          break
        }
      }
    }
    return flag
  }
}

export default Eraser



