// declare var require: any
import ElementBase from './elements/element-base'
import Pen from './elements/pen/index'
import Eraser from './elements/eraser/index'
import ChoosePen from './elements/choose-pen/index'
import Helper from './libs/Helper'
import ControlGroup from './elements/control/control-group'
import Point from './elements/point'
import OperatorRecorder from './libs/operator-recorder'

interface PluginMap {
  [x: string]: ElementBase
}

const basicType: Array<string> = ['elementBase', 'pen']

class HandWritting {
  private eles: Array<ElementBase>
  private elesActive: Array<ElementBase>
  private animationFrame: number
  private preRender: number
  private isRendering: boolean
  private canv: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private canvTemp: HTMLCanvasElement
  private ctxTemp: CanvasRenderingContext2D
  private status: string
  private touches: Array<any>
  private enableRender: boolean
  private historyIndex: number
  private helper: Helper
  private scale: number
  private gpuEnable: boolean
  private pluginsMap: any
  public onStartWriting: Function
  public onWriting: Function
  public onEndWriting: Function
  private controlGroupShow: boolean
  private baseLineCount: number
  private controlGroup: any
  private operatorRecorder: any

  constructor (canvasid: string, canvastemp: string) {
    this.eles = [] // 当前页显示的画布元素集合
    this.elesActive = [] // 当前激活的元素
    this.animationFrame = 0
    this.preRender = 0 // 画笔上一次渲染时间
    this.isRendering = false // 当前帧是否正在渲染
    this.touches = [] // 当前存在的触点
    this.status = 'pen' // 最终状态
    this.helper = new Helper()
    this.enableRender = false
    this.scale = 1 // 缩放
    this.controlGroupShow = false // 是否显示control
    this.historyIndex = -1 // 当前页撤销回退坐标
    this.gpuEnable = false // gpu是否满足要求
    this.baseLineCount = 5 // 橡皮擦作用到直线后，将直线划成几个小直线，这个表示小直线拥有的最小点的数量
    this.helper.loadModulesInBrowser(['magic-pen']).then((modules) => {
      this.pluginsMap = modules
    })
    this.controlGroup = null
    this.operatorRecorder = new OperatorRecorder(this.eles, this.elesActive)

    /* 主画布 */
    this.canv = <HTMLCanvasElement> document.getElementById(canvasid)
    this.ctx = <CanvasRenderingContext2D> this.canv.getContext('2d')
    this.ctx.imageSmoothingEnabled = false
    this.canv.addEventListener('pointerdown', this.drawBegin.bind(this))
    this.canv.addEventListener('pointermove', this.drawing.bind(this))
    this.canv.addEventListener('pointerup', this.drawEnd.bind(this))
    this.canv.addEventListener('pointerleave', this.drawEnd.bind(this))

    /* 临时画布 */
    this.canvTemp = <HTMLCanvasElement> document.getElementById(canvastemp)
    this.ctxTemp = <CanvasRenderingContext2D> this.canvTemp.getContext('2d')
    this.ctxTemp.imageSmoothingEnabled = false

    /* 对外事件函数 */
    this.onStartWriting = () => {} // 下笔开始回调
    this.onWriting = () => {} // 笔记过程中
    this.onEndWriting = () => {} // 笔记结束回调

    /* 开启画布渲染 */
    this.startRender()
  }

  startRender () {
    this.animationFrame = requestAnimationFrame(this.startRender.bind(this))
    let now = Date.now()
    let delta = now - this.preRender
    let interval = 1000 / 30
    if (!this.isRendering && delta > interval) {
      this.preRender = now - (delta % interval)
      this.isRendering = true
      this.render()
      this.isRendering = false
    }
  }
  stopRender () {
    if (this.animationFrame) {
      window.cancelAnimationFrame(this.animationFrame)
    }
  }

  render () {
    // 判断是否需要render
    // 鼠标在屏幕里移动，直接就会触发 drawing (暂不知道原因)
    // 所以根据 enableRender 来确定是否触发渲染
    if (this.elesActive.length === 0 || !this.enableRender) {
      return
    }
    // console.warn(`[render] [this.elesActive.length] ${this.elesActive.length} [this.controlGroupShow] ${this.controlGroupShow} [this.status] ${this.status}`)
    /**
     * 如果有control存在，则先获取变化矩阵
     * 换成不是每一次render就调用，而是自发的从 control-group 冒出事件来触发重新渲染
     */
    if (this.status === 'choose-pen' && this.controlGroupShow) {
      return
    }
    for (let ele of this.elesActive) {
      const curType = ele.getType()
      if (curType === 'choose-pen' || (!this.judgeTypeIsInBasicType(curType) && ele.getCtxconfig().renderCtx === 'ctxTemp')) {
        ele.render(this.ctxTemp)
        continue
      }
      ele.render(this.ctx)
    }
  }

  /**
   * 重新渲染圈选elesactive元素
   */
  rerenderElements (matrixObj: any) {
    if (matrixObj) {
      for (let ele of this.elesActive) {
        ele.updateMatrix(matrixObj)
      }
    }
    this.renderActiveEles()
  }

  // 判断当前类型是不是在基本类型中
  judgeTypeIsInBasicType (type: string) {
    return (basicType.indexOf(type) >= 0)
  }

  drawBegin (event: PointerEvent) {
    this.enableRender = true
    console.warn(`[drawBegin] [this.controlGroupShow] ${this.controlGroupShow} [this.status] ${this.status} [this.controlGroup] ${this.controlGroup}[this.elesActive] ${this.elesActive.length}`)
    // 判断是否处于 control 面板中
    if (this.controlGroupShow && this.status === 'choose-pen') {
      /**
       * 当点击位置不在 control 范围时，释放圈选元素
       * 从画布中删除 control, 暂时情况是 最后元素是 control 元素
       * 将元素从 elesActive 弹出，放入 eles
       * 重新渲染 eles 清楚ctxtemp画布内容
       */
      if (!(this.controlGroup && this.controlGroup.drawBegin(event))) {
        this.controlGroupShow = false
        this.controlGroup = null
        this.elesActive.forEach((ele) => {
          console.warn(`[drawEnd] [this.elesActive add to this.eles] ${ele.getType()}`)
          if (ele.getType() !== 'control-group' && ele.getType() !== 'choose-pen') {
            this.eles.push(ele)
          }
        })
        this.renderByData()
        this.clear(this.ctxTemp, this.canvTemp)
        this.elesActive = []
      } else {
        /**
         * 若是点击位置还在在 control 范围时，暂不做任何处理
         * 仍然通过 this.controlGroup 获取点位置来得到变化矩阵
         */
      }
      return
    }
    let ele: ElementBase = new ElementBase()
    // console.log(`[drawBegin] ${this.status} [this.this.elesActive] ${this.elesActive}`)
    switch (this.status) {
      case 'pen':
        ele = new Pen()
        break
      case 'eraser':
        ele = new Eraser()
        break
      case 'choose-pen':
        ele = new ChoosePen()
        break
      default:
        break
    }
    if (this.pluginsMap[this.status]) {
      ele = new this.pluginsMap[this.status].default()
    }
    this.addElement(ele, event.pointerId)
    ele.drawBegin(event)
  }

  revoke (): any { // 撤销
    const res = this.operatorRecorder.revoke()
    console.warn(`[revoke][res] ${JSON.stringify(res)}`)
    if (res.status) {
      this.renderByData()
    }
  }
  recovery (): any { // 恢复
    const res = this.operatorRecorder.recovery()
    console.warn(`[recovery][res] ${JSON.stringify(res)}`)
    if (res.status) {
      this.renderByData()
    }
  }

  renderByData (): void {
    console.warn(`[renderByData] [this.eles] ${JSON.stringify(this.helper.getElementBaseInfo(this.eles))}`)
    this.clear(this.ctx, this.canv)
    if (this.eles.length < 1) return
    for (let i = 0; i < this.eles.length; i++) {
      let ele = this.eles[i]
      if (!ele || ele.getType() === 'choose-pen') continue
      ele.rerender(this.ctx)
    }
  }

  /**
   * 圈选后移动等，将 activeEles 重新渲染
   * 移到临时画布上
   */
  renderActiveEles (): void {
    console.warn(`[renderActiveEles] [this.elesActive.length] ${JSON.stringify(this.helper.getElementBaseInfo(this.elesActive))}`)
    if (this.elesActive.length < 1) return
    this.clear(this.ctxTemp, this.canvTemp)
    for (let i = 0; i < this.elesActive.length; i++) {
      let ele = this.elesActive[i]
      if (!ele || !ele.isFinish() || ele.getType() === 'choose-pen') continue
      ele.rerender(this.ctxTemp)
    }
  }

  clear (ctx: CanvasRenderingContext2D, canv: HTMLCanvasElement): void {
    ctx.clearRect(0, 0, canv.width / this.scale, canv.height / this.scale)
  }

  addElement (ele: any, pointerId?: number, config?: object) { // 为当前页添加一个笔记元素
    // 撤销后重新绘制元素
    this.eles.push(ele)
    // 添加到历史记录
    if (ele.getUuid()) {
      this.operatorRecorder.addOperator(`ADD ID ${ele.getUuid()}`)
    }
    ele.setEleId(pointerId ? pointerId : 1)
    if (config) {
      ele.setConfig(config)
    }
    this.elesActive.push(ele)
  }

  popElement (indexs:Array<number> = []) { // 去除当前页最后一个元素或者传入的元素（长按选中时会用到、几何图形删除)
    console.warn(`[popElement] [indexs] ${JSON.stringify(indexs)}`)
    if (indexs.length > 0) {
      for (let index of indexs) {
        this.eles.splice(index, 1)
      }
    } else {
      this.eles.pop()
    }
  }

  drawing (event: PointerEvent) {
    if (!this.enableRender) return
    // console.warn(`[this.controlGroupShow] ${this.controlGroupShow} [this.elesActive.length] ${this.elesActive.length}`)
    if (this.controlGroupShow) {
      this.controlGroup.drawing(event)
      return
    }
    for (let ele of this.elesActive) {
      if (ele.getID() === event.pointerId) {
        ele.drawing(event)
      }
    }
  }

  /**
   * choose-pen drawend 处理
   */
  choosePenDrawend (activeEle: ElementBase): any {
    // in control
    let drawEndData:any = {}
    if (this.controlGroupShow) {

    } else {
      drawEndData = this.handleChoosePen(activeEle)
      /**
       * 如果圈选到笔记
       * 将圈选到的笔记放入 ctxtemp 中,同时将 control放入 ctxtemp
       * 然后同时重新渲染 ctx ctxtemp
       */
      this.elesActive = []
      if (drawEndData.choosedElesArr.length > 0) {
        drawEndData.choosedElesArr.forEach((index: number) => {
          let obj: ElementBase = this.eles[index]
          this.elesActive.push(obj)
          this.popElement([index])
        })
        const { centerX, centerY, width, height } = drawEndData.choosedElesOuter
        this.controlGroup = new ControlGroup({ centerX, centerY, width, height })
        this.controlGroup.rerenderElements = (data:any) => {
          this.rerenderElements(data)
        }
        this.elesActive.push(this.controlGroup)
        this.controlGroupShow = true
        this.renderByData()
        this.renderActiveEles()
      } else {
        /**
         * 如果没有圈选笔记 且 不在 control 下
         * 将圈选笔记的轨迹清楚掉 此时只有ctxtemp画布上有圈选笔记
         */
        this.clear(this.ctxTemp, this.canvTemp)
      }
    }
    return drawEndData
  }

  /**
   * 橡皮擦 drawend 后的处理
   */
  eraserDrawend (activeEle: ElementBase): any {
    let opstr = '' // 历史操作记录
    let delEle = [] // 被删除的元素
    for (let i = 0; i < this.eles.length; i++) {
      let tmpEle = this.eles[i]
      let tmpArr: Array<ElementBase> = []
      if (tmpEle.getType() === 'pen' && this.helper.isRectOverlap(tmpEle.getRectContainer(), activeEle.getRectContainer())) {
        const tmpElePointList = tmpEle.getPointList()
        let addPointsArr: Array<Point> = []
        for (let j = 0; j < tmpElePointList.length; j++) {
          if (activeEle.isPointInEraserArea(tmpElePointList[j]) || j === tmpElePointList.length - 1) {
            /**
             * 当此时点在橡皮擦范围内时
             * 若 addPointsArr.length > 0 说明此前有被添加的点
             * 所以将这些点 组成一条直线，然后将 addPointsArr = []
             */
            if (addPointsArr.length > 0) {
              if (addPointsArr.length > this.baseLineCount) {
                tmpArr.push(new Pen(addPointsArr))
              }
              addPointsArr = []
            }
          } else {
            /**
             * 当此时点不在橡皮擦范围内时
             * 将该点添加到 addPointsArr 中
             */
            addPointsArr.push(tmpElePointList[j])
          }
        }
      }
      /**
       * 如果tmpArr.length>0 将该条直线划成几条小直线
       * 同时调用 operatorRecorder 进行记录
       */
      if (tmpArr.length > 0) {
        let ids = ''
        tmpArr.forEach((tmp) => {
          ids += ` ID ${tmp.getUuid()}`
        })
        opstr = opstr.length > 0 ? opstr + `&& ERASER ID ${this.eles[i].getUuid()} TO ${ids}` : `ERASER ID ${this.eles[i].getUuid()} TO ${ids}`
        const delItem = this.eles.splice(i, 1, ...tmpArr)
        delEle.push(...delItem)
      }
    }
    console.warn(`[eraserDrawend] [operatorRecorder.addOperator] ${opstr} [delEle.length] ${delEle.length}`)
    this.operatorRecorder.addOperator(opstr, delEle)
    this.eles.pop()
    this.elesActive = []
    this.renderByData()
    return {
      type: 'eraser'
    }
  }

  /**
   * drawend
   * TODO 代码太多 能不能用 策略模式 进行削减
   * 接口定义(ctx, eles)
   */
  drawEnd (event: PointerEvent) {
    console.warn(`[DrawEnd] [this.elesActive] ${JSON.stringify(this.helper.getElementBaseInfo(this.elesActive))} [status] ${this.status} [controlGroupShow] ${this.controlGroupShow}`)
    if (this.elesActive.length < 1) return
    const type = this.status
    const activeEle = this.elesActive[0]
    this.enableRender = false
    let drawEndData:any = {}
    // 若是在基本类型中
    if (this.judgeTypeIsInBasicType(type)) {
      if (this.elesActive.length > 0) {
        for (let ele of this.elesActive) {
          if (ele.getID() === event.pointerId) {
            ele.drawEnd(event)
          }
        }
        this.elesActive = []
      }
    }
    /**
     * 若是在橡皮擦下
     * drawend 后遍历所有的 this.eles 拆分被橡皮擦作用的直线
     * TODO isPointInEraserArea 这个是继承类中的方法，不被支持，必须在 ElementBase中 定义
     */
    if (type === 'eraser') {
      drawEndData = this.eraserDrawend(activeEle)
    }
    // 若是在 choose-pen 下
    if (type === 'choose-pen') {
      drawEndData = this.choosePenDrawend(activeEle)
    }
    // 如果是插件
    if (this.pluginsMap[type]) {
      drawEndData = activeEle.drawEnd(event)
      // 如果配置成插件绘制后要删去
      if (!activeEle.getCtxconfig().saveCtx) {
        if (activeEle.getCtxconfig().renderCtx === 'ctxTemp') {
          this.clear(this.ctxTemp, this.canvTemp)
        }
        this.popElement()
      }
      this.elesActive = []
    }
    console.warn(`[drawend] [drawEndData] ${JSON.stringify(drawEndData)}`)
    this.onEndWriting(drawEndData)
  }

  // 设置status
  setStatus (status: string) {
    this.status = status
  }

  handleChoosePen (ele: ElementBase): any {
    const pointListLen = ele.getPointList().length
    console.warn(`[handleChoosePen] [pointlistlen] ${pointListLen} [this.eles] ${JSON.stringify(this.helper.getElementBaseInfo(this.eles))}`)
    if (pointListLen < 1) return
    let choosedElesArr: Array<number> = [] // 获取圈选元素在eles中的下标
    let chooseWay = 'drawChoose' // 'drawChoose' 圈选 'clickChoose' 点选
    // 点选
    if (pointListLen === 1) {
      this.clear(this.ctxTemp, this.canvTemp)
      let clickPoint = ele.getPointList()[0]
      let baseRect = 20
      this.ctxTemp.beginPath()
      this.ctxTemp.moveTo(clickPoint.x - baseRect / 2, clickPoint.y - baseRect / 2)
      this.ctxTemp.lineTo(clickPoint.x - baseRect / 2, clickPoint.y + baseRect / 2)
      this.ctxTemp.lineTo(clickPoint.x + baseRect / 2, clickPoint.y + baseRect / 2)
      this.ctxTemp.lineTo(clickPoint.x + baseRect / 2, clickPoint.y - baseRect / 2)
      chooseWay = 'clickChoose'
    }
    for (let i = this.eles.length - 1; i >= 0; i--) {
      // 点选时只选择最上面的一个
      if (chooseWay === 'clickChoose' && choosedElesArr.length > 0) {
        break
      }
      let tmpEle = this.eles[i]
      if (!tmpEle) continue
      // 当检测元素是画笔或者几何图形时
      const tmpType = tmpEle.getType()
      if (tmpType === 'pen') {
        console.warn(`[handleChoosePen] [ele] ${JSON.stringify(this.helper.getElementBaseInfo([tmpEle]))}`)
        let scale = this.gpuEnable ? this.scale * 2 : this.scale
        if (tmpEle.judgeIsPointInPath(this.ctxTemp, ele.getRectContainer(), scale)) {
          choosedElesArr.push(i)
        }
      }
    }
    let choosedElesOuter: any = {}
    if (choosedElesArr.length > 0) {
      let totalContainer = this.eles[choosedElesArr[0]].getRectContainer()
      choosedElesArr.forEach((index: number) => {
        this.elesActive.push(this.eles[index])
        totalContainer = this.helper.getOuterTogether(totalContainer, this.eles[index].getRectContainer())
      })
      /**
       * 获取圈选元素的外框
       * 为了防止外框太过靠近元素，设置有个固定 padding
       */
      const padding = 8
      let centerX = (totalContainer.left + totalContainer.right) / 2
      let centerY = (totalContainer.top + totalContainer.bottom) / 2
      let width = totalContainer.right - totalContainer.left + 2 * padding
      let height = totalContainer.bottom - totalContainer.top + 2 * padding
      choosedElesOuter = { centerX, centerY, width, height }
    }
    // console.warn(`[handleChoosePen] [choosedElesOuter] ${JSON.stringify(choosedElesOuter)}`)
    return { choosedElesArr, choosedElesOuter }
  }

  /**
   * 添加 自定义 control 类
   * 该自定义control 类需要继承 control.ts 
   */
  addControl (control: any) {
    if (this.controlGroup) {
      this.controlGroup.addControl(control)
    }
  }

  // plugins api
  loadPlugin (name: string, module: any) {
    if (!this.pluginsMap[name]) {
      this.pluginsMap[name] = module
    }
  }
}
export default HandWritting
