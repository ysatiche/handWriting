class Point {
  public x: number
  public y: number
  public pressure: any

  constructor (x: number, y: number, pressure?: any) {
    this.x = x // x坐标
    this.y = y // y坐标
    this.pressure = pressure
  }
}

export default Point