import Point from '../elements/point'
/*
 * 几何图形绘制
 */
class OriginShape {
  constructor () {
  }

  isPointInFace (point: Point):number  {
    return -1
  }

  insidePolygon (point: Point, vs: Array<Point>): boolean {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point.x
    var y = point.y

    var inside = false
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      var xi = vs[i].x
      var yi = vs[i].y
      var xj = vs[j].x
      var yj = vs[j].y

      var intersect =
            (yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
      if (intersect) inside = !inside
    }

    return inside
  }

  insideEllipse (point: Point, origin: Point, radiusA: number, radiusB: number): boolean {
    const p =
        Math.pow(point.x - origin.x, 2) / Math.pow(radiusA, 2) +
        Math.pow(point.y - origin.y, 2) / Math.pow(radiusB, 2)
    return p <= 1
  }

  insideCircle (point: Point, origin: Point, radius: number): boolean {
    return Math.pow(point.x - origin.x, 2) + Math.pow(point.y - origin.y, 2) <= radius * radius
  }

  getStartEnd (start: Point, end: Point):any {
    const minX = Math.min(start.x, end.x)
    const minY = Math.min(start.y, end.y)
    const maxX = Math.max(start.x, end.x)
    const maxY = Math.max(start.y, end.y)

    return {
      start: { x: minX, y: minY },
      end: { x: maxX, y: maxY }
    }
  }
  /**
   *  通用的获取点的方法
   *  _circle 获取半圆的点
   *  _getLinePointsArr 获取直线的点
   *  _axis 获取坐标系的轴的点
   */
  _circle (center: Point, a: number, b:number, semiCircle: string): Array<Point> {
    let pointsArr = []
    let baseCircleLen = 5
    let r = a > b ? a : b
    // let centerPoint = { x: center.x / ratioX, y: center.y / ratioY }
    // 上半圆，暂定 count = this.baseCircleLen * r
    let count = baseCircleLen * r
    let step = Math.PI / count
    let angle = 0
    for (let i = 0; i < count; i++) {
      pointsArr.push(new Point(
        center.x + a * Math.cos(angle),
        center.y - b * Math.sin(angle)
      ))
      angle += step
    }
    if (semiCircle === 'up') return pointsArr
    let arr = []
    angle = 0
    for (let i = 0; i < count; i++) {
      arr.push(new Point(
        center.x + a * Math.cos(angle),
        center.y + b * Math.sin(angle)
      ))
      angle += step
    }
    if (semiCircle === 'down') return arr
    pointsArr.push(...arr)
    return pointsArr
  }

  _getLinePointsArr (start: Point, end: Point):Array<Point> {
    let baseLen = 2
    let pointsArr = []
    let xCalc = end.x - start.x
    let yCalc = end.y - start.y
    // let xyslope = yCalc !== 0 ? xCalc / yCalc : 0
    let arrLen = xCalc !== 0 ? Math.abs(xCalc) * baseLen : Math.abs(yCalc) * baseLen
    pointsArr.push(start)
    for (let i = 0; i < arrLen; i++) {
      let prePoint:any = pointsArr[i]
      pointsArr.push(new Point(prePoint.x + xCalc / arrLen, prePoint.y + yCalc / arrLen)
      )
    }
    return pointsArr
  }

  // _axis (start:Point, end:Point, direction: string) {
  //   let lineWidth = 4
  //   let p1 = {}
  //   let p2 = {}
  //   let p3 = {}
  //   let p4 = {}
  //   let p5 = {}
  //   if (direction === 'x') {
  //     p1 = {
  //       x: start.x,
  //       y: (end.y + start.y) / 2
  //     }
  //     if (end.x < start.x) {
  //       p2 = {
  //         x: end.x + 15,
  //         y: (end.y + start.y) / 2
  //       }
  //       p5 = {
  //         x: p2.x - 15,
  //         y: p2.y
  //       }
  //     } else {
  //       p2 = {
  //         x: end.x - 15,
  //         y: (end.y + start.y) / 2
  //       }
  //       p5 = {
  //         x: p2.x + 15,
  //         y: p2.y
  //       }
  //     }
  //     p3 = {
  //       x: p2.x,
  //       y: p2.y - 10 - lineWidth / 2
  //     }
  //     p4 = {
  //       x: p2.x,
  //       y: p2.y + 10 + lineWidth / 2
  //     }
  //   } else if (direction === 'y') {
  //     if (end.y < start.y) {
  //       p1 = {
  //         x: (end.x + start.x) / 2,
  //         y: start.y
  //       }
  //       p2 = {
  //         x: (end.x + start.x) / 2,
  //         y: end.y + 15
  //       }
  //     } else {
  //       p1 = {
  //         x: (end.x + start.x) / 2,
  //         y: end.y
  //       }
  //       p2 = {
  //         x: (end.x + start.x) / 2,
  //         y: start.y + 15
  //       }
  //     }
  //     p3 = {
  //       x: p2.x - 10 - lineWidth / 2,
  //       y: p2.y
  //     }
  //     p4 = {
  //       x: p2.x + 10 + lineWidth / 2,
  //       y: p2.y
  //     }
  //     p5 = {
  //       x: p2.x,
  //       y: p2.y - 15
  //     }
  //   }
  //   let pointsArr = []
  //   let arr = this._getLinePointsArr({ x: p1.x, y: p1.y }, { x: p2.x, y: p2.y })
  //   pointsArr.push(...arr)
  //   arr = this._getLinePointsArr({ x: p3.x, y: p3.y }, { x: p4.x, y: p4.y })
  //   pointsArr.push(...arr)
  //   arr = this._getLinePointsArr({ x: p4.x, y: p4.y }, { x: p5.x, y: p5.y })
  //   pointsArr.push(...arr)
  //   arr = this._getLinePointsArr({ x: p5.x, y: p5.y }, { x: p3.x, y: p3.y })
  //   pointsArr.push(...arr)
  //   return pointsArr
  // }
}
export default OriginShape
