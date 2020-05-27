import ElementBase from '../element-base'
import Point from '../point'

class ChoosePen extends ElementBase {
  constructor () {
    super()
    this.type = 'choose-pen'
  }

  _render (ctx: CanvasRenderingContext2D): boolean {
    ctx.save()
    ctx.strokeStyle = "rgba(25,65,0,1)"
    ctx.setLineDash([6, 6])
    return super._render(ctx)
  }
}

export default ChoosePen
