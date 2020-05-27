"use strict";
exports.__esModule = true;
var HandWritting_1 = require("./HandWritting");
// import MagicPen from './plugins/magic-pen'
var Helper_1 = require("./libs/Helper");
var helper = new Helper_1["default"]();
var handWritting = new HandWritting_1["default"]('canvasId', 'canvasTmpId');
/**
 * 创建控制按钮
 */
function createControlBtn(name, callback) {
    var div = document.createElement("button");
    div.style.width = '100px';
    div.style.height = '30px';
    div.setAttribute('id', name);
    div.innerText = name;
    div.addEventListener('click', function () {
        callback && callback();
    });
    return div;
}
/**
 * 控制条，默认置为下方
 */
function createControlBar() {
    var div = document.createElement("div");
    div.style.width = '100%';
    div.style.height = '50px';
    div.style.zIndex = '100';
    div.style.bottom = '0px';
    div.style.left = '0px';
    div.style.position = 'fixed';
    div.style.display = 'flex';
    div.style.justifyContent = 'space-between';
    return div;
}
/**
 * 创建所有控制元素
 */
function createControl() {
    // 创建下方控制条
    var controlBar = createControlBar();
    document.getElementsByTagName('body')[0].appendChild(controlBar);
    // 设置为笔
    controlBar.appendChild(createControlBtn('pen', function () { handWritting.setStatus('pen'); }));
    // 设置为橡皮
    controlBar.appendChild(createControlBtn('eraser', function () { handWritting.setStatus('eraser'); }));
    // 设置为选择
    controlBar.appendChild(createControlBtn('choose-pen', function () { handWritting.setStatus('choose-pen'); }));
    // 设置为revoke
    controlBar.appendChild(createControlBtn('revoke', function () { handWritting.revoke(); }));
    // recovery
    controlBar.appendChild(createControlBtn('recovery', function () { handWritting.recovery(); }));
}
createControl();
