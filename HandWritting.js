"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
// declare var require: any
var element_base_1 = require("./elements/element-base");
var index_1 = require("./elements/pen/index");
var index_2 = require("./elements/eraser/index");
var index_3 = require("./elements/choose-pen/index");
var Helper_1 = require("./libs/Helper");
var control_group_1 = require("./elements/control/control-group");
var operator_recorder_1 = require("./libs/operator-recorder");
var basicType = ['elementBase', 'pen'];
var HandWritting = /** @class */ (function () {
    function HandWritting(canvasid, canvastemp) {
        var _this = this;
        this.eles = []; // 当前页显示的画布元素集合
        this.elesActive = []; // 当前激活的元素
        this.animationFrame = 0;
        this.preRender = 0; // 画笔上一次渲染时间
        this.isRendering = false; // 当前帧是否正在渲染
        this.touches = []; // 当前存在的触点
        this.status = 'pen'; // 最终状态
        this.helper = new Helper_1["default"]();
        this.enableRender = false;
        this.scale = 1; // 缩放
        this.controlGroupShow = false; // 是否显示control
        this.historyIndex = -1; // 当前页撤销回退坐标
        this.gpuEnable = false; // gpu是否满足要求
        this.baseLineCount = 5; // 橡皮擦作用到直线后，将直线划成几个小直线，这个表示小直线拥有的最小点的数量
        this.helper.loadModulesInBrowser(['magic-pen']).then(function (modules) {
            _this.pluginsMap = modules;
        });
        this.controlGroup = null;
        this.operatorRecorder = new operator_recorder_1["default"](this.eles, this.elesActive);
        /* 主画布 */
        this.canv = document.getElementById(canvasid);
        this.ctx = this.canv.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.canv.addEventListener('pointerdown', this.drawBegin.bind(this));
        this.canv.addEventListener('pointermove', this.drawing.bind(this));
        this.canv.addEventListener('pointerup', this.drawEnd.bind(this));
        this.canv.addEventListener('pointerleave', this.drawEnd.bind(this));
        /* 临时画布 */
        this.canvTemp = document.getElementById(canvastemp);
        this.ctxTemp = this.canvTemp.getContext('2d');
        this.ctxTemp.imageSmoothingEnabled = false;
        /* 对外事件函数 */
        this.onStartWriting = function () { }; // 下笔开始回调
        this.onWriting = function () { }; // 笔记过程中
        this.onEndWriting = function () { }; // 笔记结束回调
        /* 开启画布渲染 */
        this.startRender();
    }
    HandWritting.prototype.startRender = function () {
        this.animationFrame = requestAnimationFrame(this.startRender.bind(this));
        var now = Date.now();
        var delta = now - this.preRender;
        var interval = 1000 / 30;
        if (!this.isRendering && delta > interval) {
            this.preRender = now - (delta % interval);
            this.isRendering = true;
            this.render();
            this.isRendering = false;
        }
    };
    HandWritting.prototype.stopRender = function () {
        if (this.animationFrame) {
            window.cancelAnimationFrame(this.animationFrame);
        }
    };
    HandWritting.prototype.render = function () {
        // 判断是否需要render
        // 鼠标在屏幕里移动，直接就会触发 drawing (暂不知道原因)
        // 所以根据 enableRender 来确定是否触发渲染
        if (this.elesActive.length === 0 || !this.enableRender) {
            return;
        }
        // console.warn(`[render] [this.elesActive.length] ${this.elesActive.length} [this.controlGroupShow] ${this.controlGroupShow} [this.status] ${this.status}`)
        /**
         * 如果有control存在，则先获取变化矩阵
         * 换成不是每一次render就调用，而是自发的从 control-group 冒出事件来触发重新渲染
         */
        if (this.status === 'choose-pen' && this.controlGroupShow) {
            return;
        }
        for (var _i = 0, _a = this.elesActive; _i < _a.length; _i++) {
            var ele = _a[_i];
            var curType = ele.getType();
            if (curType === 'choose-pen' || (!this.judgeTypeIsInBasicType(curType) && ele.getCtxconfig().renderCtx === 'ctxTemp')) {
                ele.render(this.ctxTemp);
                continue;
            }
            ele.render(this.ctx);
        }
    };
    /**
     * 重新渲染圈选elesactive元素
     */
    HandWritting.prototype.rerenderElements = function (matrixObj) {
        if (matrixObj) {
            for (var _i = 0, _a = this.elesActive; _i < _a.length; _i++) {
                var ele = _a[_i];
                ele.updateMatrix(matrixObj);
            }
        }
        this.renderActiveEles();
    };
    // 判断当前类型是不是在基本类型中
    HandWritting.prototype.judgeTypeIsInBasicType = function (type) {
        return (basicType.indexOf(type) >= 0);
    };
    HandWritting.prototype.drawBegin = function (event) {
        var _this = this;
        this.enableRender = true;
        console.warn("[drawBegin] [this.controlGroupShow] " + this.controlGroupShow + " [this.status] " + this.status + " [this.controlGroup] " + this.controlGroup + "[this.elesActive] " + this.elesActive.length);
        // 判断是否处于 control 面板中
        if (this.controlGroupShow && this.status === 'choose-pen') {
            /**
             * 当点击位置不在 control 范围时，释放圈选元素
             * 从画布中删除 control, 暂时情况是 最后元素是 control 元素
             * 将元素从 elesActive 弹出，放入 eles
             * 重新渲染 eles 清楚ctxtemp画布内容
             */
            if (!(this.controlGroup && this.controlGroup.drawBegin(event))) {
                this.controlGroupShow = false;
                this.controlGroup = null;
                this.elesActive.forEach(function (ele) {
                    console.warn("[drawEnd] [this.elesActive add to this.eles] " + ele.getType());
                    if (ele.getType() !== 'control-group' && ele.getType() !== 'choose-pen') {
                        _this.eles.push(ele);
                    }
                });
                this.renderByData();
                this.clear(this.ctxTemp, this.canvTemp);
                this.elesActive = [];
            }
            else {
                /**
                 * 若是点击位置还在在 control 范围时，暂不做任何处理
                 * 仍然通过 this.controlGroup 获取点位置来得到变化矩阵
                 */
            }
            return;
        }
        var ele = new element_base_1["default"]();
        // console.log(`[drawBegin] ${this.status} [this.this.elesActive] ${this.elesActive}`)
        switch (this.status) {
            case 'pen':
                ele = new index_1["default"]();
                break;
            case 'eraser':
                ele = new index_2["default"]();
                break;
            case 'choose-pen':
                ele = new index_3["default"]();
                break;
            default:
                break;
        }
        if (this.pluginsMap[this.status]) {
            ele = new this.pluginsMap[this.status]["default"]();
        }
        this.addElement(ele, event.pointerId);
        ele.drawBegin(event);
    };
    HandWritting.prototype.revoke = function () {
        var res = this.operatorRecorder.revoke();
        console.warn("[revoke][res] " + JSON.stringify(res));
        if (res.status) {
            this.renderByData();
        }
    };
    HandWritting.prototype.recovery = function () {
        var res = this.operatorRecorder.recovery();
        console.warn("[recovery][res] " + JSON.stringify(res));
        if (res.status) {
            this.renderByData();
        }
    };
    HandWritting.prototype.renderByData = function () {
        console.warn("[renderByData] [this.eles] " + JSON.stringify(this.helper.getElementBaseInfo(this.eles)));
        this.clear(this.ctx, this.canv);
        if (this.eles.length < 1)
            return;
        for (var i = 0; i < this.eles.length; i++) {
            var ele = this.eles[i];
            if (!ele || ele.getType() === 'choose-pen')
                continue;
            ele.rerender(this.ctx);
        }
    };
    /**
     * 圈选后移动等，将 activeEles 重新渲染
     * 移到临时画布上
     */
    HandWritting.prototype.renderActiveEles = function () {
        console.warn("[renderActiveEles] [this.elesActive.length] " + JSON.stringify(this.helper.getElementBaseInfo(this.elesActive)));
        if (this.elesActive.length < 1)
            return;
        this.clear(this.ctxTemp, this.canvTemp);
        for (var i = 0; i < this.elesActive.length; i++) {
            var ele = this.elesActive[i];
            if (!ele || !ele.isFinish() || ele.getType() === 'choose-pen')
                continue;
            ele.rerender(this.ctxTemp);
        }
    };
    HandWritting.prototype.clear = function (ctx, canv) {
        ctx.clearRect(0, 0, canv.width / this.scale, canv.height / this.scale);
    };
    HandWritting.prototype.addElement = function (ele, pointerId, config) {
        // 撤销后重新绘制元素
        this.eles.push(ele);
        // 添加到历史记录
        if (ele.getUuid()) {
            this.operatorRecorder.addOperator("ADD ID " + ele.getUuid());
        }
        ele.setEleId(pointerId ? pointerId : 1);
        if (config) {
            ele.setConfig(config);
        }
        this.elesActive.push(ele);
    };
    HandWritting.prototype.popElement = function (indexs) {
        if (indexs === void 0) { indexs = []; }
        console.warn("[popElement] [indexs] " + JSON.stringify(indexs));
        if (indexs.length > 0) {
            for (var _i = 0, indexs_1 = indexs; _i < indexs_1.length; _i++) {
                var index = indexs_1[_i];
                this.eles.splice(index, 1);
            }
        }
        else {
            this.eles.pop();
        }
    };
    HandWritting.prototype.drawing = function (event) {
        if (!this.enableRender)
            return;
        // console.warn(`[this.controlGroupShow] ${this.controlGroupShow} [this.elesActive.length] ${this.elesActive.length}`)
        if (this.controlGroupShow) {
            this.controlGroup.drawing(event);
            return;
        }
        for (var _i = 0, _a = this.elesActive; _i < _a.length; _i++) {
            var ele = _a[_i];
            if (ele.getID() === event.pointerId) {
                ele.drawing(event);
            }
        }
    };
    /**
     * choose-pen drawend 处理
     */
    HandWritting.prototype.choosePenDrawend = function (activeEle) {
        var _this = this;
        // in control
        var drawEndData = {};
        if (this.controlGroupShow) {
        }
        else {
            drawEndData = this.handleChoosePen(activeEle);
            /**
             * 如果圈选到笔记
             * 将圈选到的笔记放入 ctxtemp 中,同时将 control放入 ctxtemp
             * 然后同时重新渲染 ctx ctxtemp
             */
            this.elesActive = [];
            if (drawEndData.choosedElesArr.length > 0) {
                drawEndData.choosedElesArr.forEach(function (index) {
                    var obj = _this.eles[index];
                    _this.elesActive.push(obj);
                    _this.popElement([index]);
                });
                var _a = drawEndData.choosedElesOuter, centerX = _a.centerX, centerY = _a.centerY, width = _a.width, height = _a.height;
                this.controlGroup = new control_group_1["default"]({ centerX: centerX, centerY: centerY, width: width, height: height });
                this.controlGroup.rerenderElements = function (data) {
                    _this.rerenderElements(data);
                };
                this.elesActive.push(this.controlGroup);
                this.controlGroupShow = true;
                this.renderByData();
                this.renderActiveEles();
            }
            else {
                /**
                 * 如果没有圈选笔记 且 不在 control 下
                 * 将圈选笔记的轨迹清楚掉 此时只有ctxtemp画布上有圈选笔记
                 */
                this.clear(this.ctxTemp, this.canvTemp);
            }
        }
        return drawEndData;
    };
    /**
     * 橡皮擦 drawend 后的处理
     */
    HandWritting.prototype.eraserDrawend = function (activeEle) {
        var opstr = ''; // 历史操作记录
        var delEle = []; // 被删除的元素
        var _loop_1 = function (i) {
            var _a;
            var tmpEle = this_1.eles[i];
            var tmpArr = [];
            if (tmpEle.getType() === 'pen' && this_1.helper.isRectOverlap(tmpEle.getRectContainer(), activeEle.getRectContainer())) {
                var tmpElePointList = tmpEle.getPointList();
                var addPointsArr = [];
                for (var j = 0; j < tmpElePointList.length; j++) {
                    if (activeEle.isPointInEraserArea(tmpElePointList[j]) || j === tmpElePointList.length - 1) {
                        /**
                         * 当此时点在橡皮擦范围内时
                         * 若 addPointsArr.length > 0 说明此前有被添加的点
                         * 所以将这些点 组成一条直线，然后将 addPointsArr = []
                         */
                        if (addPointsArr.length > 0) {
                            if (addPointsArr.length > this_1.baseLineCount) {
                                tmpArr.push(new index_1["default"](addPointsArr));
                            }
                            addPointsArr = [];
                        }
                    }
                    else {
                        /**
                         * 当此时点不在橡皮擦范围内时
                         * 将该点添加到 addPointsArr 中
                         */
                        addPointsArr.push(tmpElePointList[j]);
                    }
                }
            }
            /**
             * 如果tmpArr.length>0 将该条直线划成几条小直线
             * 同时调用 operatorRecorder 进行记录
             */
            if (tmpArr.length > 0) {
                var ids_1 = '';
                tmpArr.forEach(function (tmp) {
                    ids_1 += " ID " + tmp.getUuid();
                });
                opstr = opstr.length > 0 ? opstr + ("&& ERASER ID " + this_1.eles[i].getUuid() + " TO " + ids_1) : "ERASER ID " + this_1.eles[i].getUuid() + " TO " + ids_1;
                var delItem = (_a = this_1.eles).splice.apply(_a, __spreadArrays([i, 1], tmpArr));
                delEle.push.apply(delEle, delItem);
            }
        };
        var this_1 = this;
        for (var i = 0; i < this.eles.length; i++) {
            _loop_1(i);
        }
        console.warn("[eraserDrawend] [operatorRecorder.addOperator] " + opstr + " [delEle.length] " + delEle.length);
        this.operatorRecorder.addOperator(opstr, delEle);
        this.eles.pop();
        this.elesActive = [];
        this.renderByData();
        return {
            type: 'eraser'
        };
    };
    /**
     * drawend
     * TODO 代码太多 能不能用 策略模式 进行削减
     * 接口定义(ctx, eles)
     */
    HandWritting.prototype.drawEnd = function (event) {
        console.warn("[DrawEnd] [this.elesActive] " + JSON.stringify(this.helper.getElementBaseInfo(this.elesActive)) + " [status] " + this.status + " [controlGroupShow] " + this.controlGroupShow);
        if (this.elesActive.length < 1)
            return;
        var type = this.status;
        var activeEle = this.elesActive[0];
        this.enableRender = false;
        var drawEndData = {};
        // 若是在基本类型中
        if (this.judgeTypeIsInBasicType(type)) {
            if (this.elesActive.length > 0) {
                for (var _i = 0, _a = this.elesActive; _i < _a.length; _i++) {
                    var ele = _a[_i];
                    if (ele.getID() === event.pointerId) {
                        ele.drawEnd(event);
                    }
                }
                this.elesActive = [];
            }
        }
        /**
         * 若是在橡皮擦下
         * drawend 后遍历所有的 this.eles 拆分被橡皮擦作用的直线
         * TODO isPointInEraserArea 这个是继承类中的方法，不被支持，必须在 ElementBase中 定义
         */
        if (type === 'eraser') {
            drawEndData = this.eraserDrawend(activeEle);
        }
        // 若是在 choose-pen 下
        if (type === 'choose-pen') {
            drawEndData = this.choosePenDrawend(activeEle);
        }
        // 如果是插件
        if (this.pluginsMap[type]) {
            drawEndData = activeEle.drawEnd(event);
            // 如果配置成插件绘制后要删去
            if (!activeEle.getCtxconfig().saveCtx) {
                if (activeEle.getCtxconfig().renderCtx === 'ctxTemp') {
                    this.clear(this.ctxTemp, this.canvTemp);
                }
                this.popElement();
            }
            this.elesActive = [];
        }
        console.warn("[drawend] [drawEndData] " + JSON.stringify(drawEndData));
        this.onEndWriting(drawEndData);
    };
    // 设置status
    HandWritting.prototype.setStatus = function (status) {
        this.status = status;
    };
    HandWritting.prototype.handleChoosePen = function (ele) {
        var _this = this;
        var pointListLen = ele.getPointList().length;
        console.warn("[handleChoosePen] [pointlistlen] " + pointListLen + " [this.eles] " + JSON.stringify(this.helper.getElementBaseInfo(this.eles)));
        if (pointListLen < 1)
            return;
        var choosedElesArr = []; // 获取圈选元素在eles中的下标
        var chooseWay = 'drawChoose'; // 'drawChoose' 圈选 'clickChoose' 点选
        // 点选
        if (pointListLen === 1) {
            this.clear(this.ctxTemp, this.canvTemp);
            var clickPoint = ele.getPointList()[0];
            var baseRect = 20;
            this.ctxTemp.beginPath();
            this.ctxTemp.moveTo(clickPoint.x - baseRect / 2, clickPoint.y - baseRect / 2);
            this.ctxTemp.lineTo(clickPoint.x - baseRect / 2, clickPoint.y + baseRect / 2);
            this.ctxTemp.lineTo(clickPoint.x + baseRect / 2, clickPoint.y + baseRect / 2);
            this.ctxTemp.lineTo(clickPoint.x + baseRect / 2, clickPoint.y - baseRect / 2);
            chooseWay = 'clickChoose';
        }
        for (var i = this.eles.length - 1; i >= 0; i--) {
            // 点选时只选择最上面的一个
            if (chooseWay === 'clickChoose' && choosedElesArr.length > 0) {
                break;
            }
            var tmpEle = this.eles[i];
            if (!tmpEle)
                continue;
            // 当检测元素是画笔或者几何图形时
            var tmpType = tmpEle.getType();
            if (tmpType === 'pen') {
                console.warn("[handleChoosePen] [ele] " + JSON.stringify(this.helper.getElementBaseInfo([tmpEle])));
                var scale = this.gpuEnable ? this.scale * 2 : this.scale;
                if (tmpEle.judgeIsPointInPath(this.ctxTemp, ele.getRectContainer(), scale)) {
                    choosedElesArr.push(i);
                }
            }
        }
        var choosedElesOuter = {};
        if (choosedElesArr.length > 0) {
            var totalContainer_1 = this.eles[choosedElesArr[0]].getRectContainer();
            choosedElesArr.forEach(function (index) {
                _this.elesActive.push(_this.eles[index]);
                totalContainer_1 = _this.helper.getOuterTogether(totalContainer_1, _this.eles[index].getRectContainer());
            });
            /**
             * 获取圈选元素的外框
             * 为了防止外框太过靠近元素，设置有个固定 padding
             */
            var padding = 8;
            var centerX = (totalContainer_1.left + totalContainer_1.right) / 2;
            var centerY = (totalContainer_1.top + totalContainer_1.bottom) / 2;
            var width = totalContainer_1.right - totalContainer_1.left + 2 * padding;
            var height = totalContainer_1.bottom - totalContainer_1.top + 2 * padding;
            choosedElesOuter = { centerX: centerX, centerY: centerY, width: width, height: height };
        }
        // console.warn(`[handleChoosePen] [choosedElesOuter] ${JSON.stringify(choosedElesOuter)}`)
        return { choosedElesArr: choosedElesArr, choosedElesOuter: choosedElesOuter };
    };
    /**
     * 添加 自定义 control 类
     * 该自定义control 类需要继承 control.ts
     */
    HandWritting.prototype.addControl = function (control) {
        if (this.controlGroup) {
            this.controlGroup.addControl(control);
        }
    };
    // plugins api
    HandWritting.prototype.loadPlugin = function (name, module) {
        if (!this.pluginsMap[name]) {
            this.pluginsMap[name] = module;
        }
    };
    return HandWritting;
}());
exports["default"] = HandWritting;
