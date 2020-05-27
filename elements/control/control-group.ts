import createControls from './defaut-control'
import Control from './control'
import ElementBase from '../element-base'
import Point from '../point'

interface ControlPos {
  centerX: number
  centerY: number
  width: number
  height: number
}
/**
 * 在 继承 control.ts 来实现操作组件
 * 当用户点击焦点处于 controls 范围内，调用该control的getActionHandler
 * getActionHandler 返回最终生效的变化矩阵，通过rerenderElements传给上层
 */

class ControlGroup extends ElementBase{
  private defaultControls: {
    [x: string]: Control
  }
  private startPoint?: Point
  private activeControl: any
  private controlPos?: ControlPos
  private rerenderPoints: number
  private rerenderPointsMax: number
  public rerenderElements: Function

  constructor (pos: ControlPos) {
    super()
    this.type = 'control-group'
    this.defaultControls = createControls(pos)
    this.controlPos = pos
    this.finish = true
    /**
     * this.rerenderElements 作用
     * 可以根据 drawing 来判断点的变化是否足以触发一次重新渲染
     * 暂时以 rerenderPoints 的数量来判断 > rerenderPointsMax就触发一次
     */
    this.rerenderElements = () => {}
    this.rerenderPoints = 0
    this.rerenderPointsMax = 10
  }

  // 添加control
  addControl (name: string, control: Control): boolean {
    if(!this.defaultControls[name]) {
      this.defaultControls[name] = control
      return true
    } else {
      return false
    }
  }

  // 删除control
  deleteControl (name: string): boolean {
    if (this.defaultControls[name]) {
      delete this.defaultControls[name]
      return true
    } else {
      return false
    }
  }

  drawBegin(event: PointerEvent): any {
    this.pointList = []
    let curPoint = this._getPoint(event)
    this._addPoint(curPoint)
    this.startPoint = curPoint
    return this.checkPointInControls(curPoint)
  }
  
  drawing (event: PointerEvent): any {
    // this.finish = false
    let curPoint = this._getPoint(event)
    this._addPoint(curPoint)
    /**
     * 判断点的移动是否足以触发一次 ctxtemp 渲染
     * 如果是的话，调用 getMatrixObj 然后将结果往上冒
     */
    this.rerenderPoints++
    if (this.rerenderPoints > this.rerenderPointsMax) {
      this.rerenderPoints = 0
      const res = this.getMatrixObj()
      if (res) {
        this.rerenderElements(res)
      }
    }
  }

  // get matrix obj
  getMatrixObj ():any {
    /**
     * render时计算 移动/缩放/旋转 等结果
     */
    if (this.activeControl) {
      if (!this.startPoint) return null
      const end = this.pointList[this.pointList.length - 1]
      const matrix = this.activeControl.getActionHandler()(this.startPoint, end, this.controlPos)
      this.startPoint = end
      return matrix
    } else {
      return null
    }
  }

  // render
  _render (ctx: CanvasRenderingContext2D):any {
    // if (this.finish) return
    for (let i = 0; i < Object.keys(this.defaultControls).length; i++) {
      let key = Object.keys(this.defaultControls)[i]
      this.defaultControls[key]._render(ctx)
    }
  }

  // 获取点是否在控制面板中
  checkPointInControls (point: Point): boolean {
    for (let i = 0; i < Object.keys(this.defaultControls).length; i++) {
      let key = Object.keys(this.defaultControls)[i]
      if (this.defaultControls[key].checkPointInControl(point, this.transformMatrix)) {
        this.activeControl = this.defaultControls[key]
        return true
      }
    }
    this.activeControl = null
    return false
  }
}

export default ControlGroup
