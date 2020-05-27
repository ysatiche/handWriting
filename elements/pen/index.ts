import ElementBase from '../element-base'
import Point from '../point'

class Pen extends ElementBase {
  constructor (pointList?: Array<Point>) {
    super(pointList)
    this.type = 'pen'
  }
}

export default Pen

