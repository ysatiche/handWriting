import ElementBase from './element-base'
// import smallCoin from './json/smallCoin.json'
// import bodymovin from 'bodymovin'

class MagicPen extends ElementBase {
  constructor () {
    super()
    this.type = 'magic-pen'
    this.ctxConfig = {
      renderCtx: 'ctxTemp',
      saveCtx: false
    }
  }

  // 封装一个播放bodymovin格式的动画
  // playBodyMovinRed (animationDataRed: any, elementId: string):any {
  //   let paramsRed = {
  //     container: document.getElementById(elementId),
  //     renderer: 'svg',
  //     loop: false,
  //     autoplay: false,
  //     animationData: animationDataRed
  //   }
  //   return bodymovin.loadAnimation(paramsRed)
  // }

  drawEnd (event: PointerEvent): any {
    super.drawEnd(event)
    // this.animRed = this.playBodyMovinRed(tempCoin, 'bodymovinRed')
    /**
     * 在drawend里添加播放动效
     * 可以采用之前的做法，添加 div 
     * 不过要在播放后将div清楚掉
     * 也可以在 onEndWriting 的回调函数里调用
     */
    return {
      type: this.type,
      data: {
        resType: 'star'
      }
    }
  }
}

export default MagicPen

