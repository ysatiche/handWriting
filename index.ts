import HandWritting from './HandWritting'
// import MagicPen from './plugins/magic-pen'
import Helper from './libs/Helper'
const helper = new Helper()

let handWritting = new HandWritting('canvasId', 'canvasTmpId')

/**
 * 创建控制按钮
 */
function createControlBtn(name:string, callback: Function): HTMLElement {
  let div = document.createElement("button")
  div.style.width ='100px'
  div.style.height = '30px'
  div.setAttribute('id', name)
  div.innerText = name
  div.addEventListener('click', () => {
    callback && callback()
  })
  return div
}

/**
 * 控制条，默认置为下方
 */
function createControlBar():HTMLElement {
  let div = document.createElement("div")
  div.style.width ='100%'
  div.style.height = '50px'
  div.style.zIndex = '100'
  div.style.bottom = '0px'
  div.style.left = '0px'
  div.style.position = 'fixed'
  div.style.display = 'flex'
  div.style.justifyContent = 'space-between'
  return div
}

/**
 * 创建所有控制元素
 */
function createControl(): void {
  // 创建下方控制条
  let controlBar = createControlBar()
  document.getElementsByTagName('body')[0].appendChild(controlBar)
  // 设置为笔
  controlBar.appendChild(createControlBtn('pen', () => {handWritting.setStatus('pen')}))
  // 设置为橡皮
  controlBar.appendChild(createControlBtn('eraser', () => {handWritting.setStatus('eraser')}))
  // 设置为选择
  controlBar.appendChild(createControlBtn('choose-pen', () => {handWritting.setStatus('choose-pen')}))
  // 设置为revoke
  controlBar.appendChild(createControlBtn('revoke', () => {handWritting.revoke()}))
  // recovery
  controlBar.appendChild(createControlBtn('recovery', () => {handWritting.recovery()}))
}

createControl()

