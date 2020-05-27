import Control from './control'
import Point from '../point'
import Helper from '../../libs/Helper'

const helper = new Helper()

// interface Options {
//   position: {
//     x: number
//     y: number
//   }
//   [x: string]: any
// }

// control actions

interface MatrixObj {
  actionName: string
  matrix: any
  [x: string]: any
}

interface ControlPos {
  centerX: number
  centerY: number
  width: number
  height: number
}

/**
 * 平移时需要获取的参数
 * @param { Point } start 移动的起始点 
 * @param { Point } end 移动的终点 
 */
function handleMove (start: Point, end: Point, controlPos?: any): MatrixObj {
  let translatePos = {x: end.x - start.x, y: end.y - start.y}
  return translate(translatePos)
}

/**
 * 操作
 */
function translate (translate: {x: number, y: number}) {
  let translateMatrix = helper.calcTranslateMatrix(translate.x, translate.y)
  return {
    actionName: 'translate',
    matrix: translateMatrix
  }
}

/**
 * 缩放时需要获取的参数
 * @param { Point } start 移动的起始点 
 * @param { Point } end 移动的终点 
 */
function handleScaleLeftTop (start: Point, end: Point, controlPos: ControlPos): MatrixObj {
  let left = controlPos.centerX - controlPos.width / 2
  let top = controlPos.centerY - controlPos.height / 2
  let finalLeft = left + (end.x - start.x)
  // let finalTop = top + (end.y - start.y)
  let width = controlPos.width - (end.x - start.x)
  let height = controlPos.height - (end.y - start.y)
  let w = width - height
  if (Math.abs(w) < 20) {
    width = height
    finalLeft += w
  }
  // let origin = new Point(left + controlPos.width, top + controlPos.height) // 变换的参考点
  let scaleObj = { scaleX: width / controlPos.width, scaleY: height / controlPos.height } // 缩放比例
  const res =  scale(scaleObj, new Point(left + controlPos.width, top + controlPos.height))
  return res
}

/**
 * 右上角缩放点
 */
function handleScaleRightTop (start: Point, end: Point, controlPos: ControlPos): MatrixObj {
  let left = controlPos.centerX - controlPos.width / 2
  let top = controlPos.centerY - controlPos.height / 2 + (end.y - start.y)
  let width = controlPos.width + (end.x - start.x)
  let height = controlPos.height - (end.y - start.y)
  let w = width - height
  if (Math.abs(w) < 20) {
    width = height
  }
  // let origin = new Point(left + controlPos.width, top + controlPos.height) // 变换的参考点
  let scaleObj = { scaleX: width / controlPos.width, scaleY: height / controlPos.height } // 缩放比例
  const res =  scale(scaleObj, new Point(left, controlPos.centerY + controlPos.height / 2))
  return res
}

/**
 * 左下角缩放点
 */
function handleScaleLeftBottom (start: Point, end: Point, controlPos: ControlPos): MatrixObj {
  let left = controlPos.centerX - controlPos.width / 2
  let top = controlPos.centerY - controlPos.height / 2
  let width = controlPos.width - (end.x - start.x)
  let height = controlPos.height + (end.y - start.y)
  // let origin = new Point(left + controlPos.width, top + controlPos.height) // 变换的参考点
  let scaleObj = { scaleX: width / controlPos.width, scaleY: height / controlPos.height } // 缩放比例
  const res =  scale(scaleObj, new Point(left + controlPos.width, top))
  return res
}

/**
 * 右下角缩放点
 */
function handleScaleRightBottom (start: Point, end: Point, controlPos: ControlPos): MatrixObj {
  let left = controlPos.centerX - controlPos.width / 2
  let top = controlPos.centerY - controlPos.height / 2
  let width = controlPos.width + (end.x - start.x)
  let height = controlPos.height + (end.y - start.y)
  // let origin = new Point(left + controlPos.width, top + controlPos.height) // 变换的参考点
  let scaleObj = { scaleX: width / controlPos.width, scaleY: height / controlPos.height } // 缩放比例
  const res =  scale(scaleObj, new Point(left, top))
  return res
}

/**
 * 缩放时需要获取的参数 正上方
 * @param { Point } start 移动的起始点 
 * @param { Point } end 移动的终点 
 */
function handleScaleTop (start: Point, end: Point, controlPos: ControlPos): MatrixObj {
  let left = controlPos.centerX - controlPos.width / 2
  let top = controlPos.centerY - controlPos.height / 2 + (end.y - start.y)
  let width = controlPos.width
  let height = controlPos.height - (end.y - start.y)
  let w = width - height
  if (Math.abs(w) < 20) {
    height = width
  }
  let scaleObj = { scaleX: 1, scaleY: height / controlPos.height } // 缩放比例
  const res =  scale(scaleObj, new Point(left, top + controlPos.height))
  return res
}

function scale (scale: { scaleX:  number, scaleY: number}, origin: Point): MatrixObj {
  let originMatrixBefore = helper.calcTranslateMatrix(origin.x, origin.y)
  let originMatrixAfter = helper.calcTranslateMatrix(-origin.x, -origin.y)
  let scaleMatrix = helper.calcScaleMatrix(scale.scaleX, scale.scaleY)
  scaleMatrix = helper.multiplyTransformMatrices(originMatrixBefore, scaleMatrix)
  scaleMatrix = helper.multiplyTransformMatrices(scaleMatrix, originMatrixAfter)
  return {
    actionName: 'scale',
    matrix: scaleMatrix,
    info: {
      scale: scale
    }
  }
}

function handleAngle (start: Point, end: Point, controlPos: ControlPos):MatrixObj {
  let center = new Point(controlPos.centerX, controlPos.centerY)
  let startAngle = getAngle(start, center)
  let endAngle = getAngle(end, center)
  let angleIncrement = startAngle - endAngle
  return angle(angleIncrement, center)
}

function getAngle (p: Point, center: Point): number { // 获取任一点与中心点构成的水平角度
  // 以中心点为圆点的参考坐标系，重新计算p点的坐标
  let x = p.x - center.x
  let y = center.y - p.y
  return Math.atan2(y, x)
}

function  angle (angle: number, origin: Point): MatrixObj {
  let originMatrixBefore = helper.calcTranslateMatrix(origin.x, origin.y)
  let originMatrixAfter = helper.calcTranslateMatrix(-origin.x, -origin.y)
  let angleMatrix = helper.calcRotateMatrix(angle)
  angleMatrix = helper.multiplyTransformMatrices(originMatrixBefore, angleMatrix)
  angleMatrix = helper.multiplyTransformMatrices(angleMatrix, originMatrixAfter)
  return {
    actionName: 'angle',
    matrix: angleMatrix
  }
  // this.transformMatrix = this.helper.multiplyTransformMatrices(angleMatrix, this.transformMatrix)
}


export default function (pos: ControlPos): {[x: string]: Control} {
  return {
    // 中间矩形平移功能
    'mc': new Control({
      position: {
        x: 0,
        y: 0
      },
      centerPos: pos,
      actionName: 'translate',
      styleOverride: {
        cornerStyle: 'square'
      },
      name: 'mc',
      actionHandler: handleMove
    }),
    // 左上角缩放
    'lt': new Control({
      position: {
        x: -0.5,
        y: -0.5
      },
      centerPos: pos,
      actionName: 'scale',
      styleOverride: {
        cornerStyle: 'circle'
      },
      name: 'lt',
      actionHandler: handleScaleLeftTop
    }),
    // 右上角缩放点
    'rt': new Control({
      position: {
        x: 0.5,
        y: -0.5
      },
      centerPos: pos,
      actionName: 'scale',
      styleOverride: {
        cornerStyle: 'circle'
      },
      name: 'rt',
      actionHandler: handleScaleRightTop
    }),
    // 左下角缩放点
    'lb': new Control({
      position: {
        x: -0.5,
        y: 0.5
      },
      centerPos: pos,
      actionName: 'scale',
      styleOverride: {
        cornerStyle: 'circle'
      },
      name: 'lb',
      actionHandler: handleScaleLeftBottom
    }),
    // 右下角缩放点
    'rb': new Control({
      position: {
        x: 0.5,
        y: 0.5
      },
      centerPos: pos,
      actionName: 'scale',
      styleOverride: {
        cornerStyle: 'circle'
      },
      name: 'rb',
      actionHandler: handleScaleRightBottom
    }),
    // 上方缩放点
    // 'tc': new Control({
    //   position: {
    //     x: 0,
    //     y: -0.5
    //   },
    //   centerPos: pos,
    //   actionName: 'scale',
    //   styleOverride: {
    //     cornerStyle: 'circle'
    //   },
    //   name: 'tc',
    //   actionHandler: handleScaleTop
    // }),
    // 中心正上方 旋转
    'ct': new Control({
      position: {
        x: 0,
        y: -0.5
      },
      offset: {
        offsetX: 0,
        offsetY: -40
      },
      centerPos: pos,
      actionName: 'rotate',
      styleOverride: {
        cornerStyle: 'circle'
      },
      name: 'ct',
      actionHandler: handleAngle
    }),
  }
}
