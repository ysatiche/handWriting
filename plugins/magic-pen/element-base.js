"use strict";
exports.__esModule = true;
var Point = /** @class */ (function () {
    function Point(x, y, pressure) {
        this.x = x; // x坐标
        this.y = y; // y坐标
        this.pressure = pressure;
    }
    return Point;
}());
var Helper = /** @class */ (function () {
    function Helper() {
    }
    /*
      判断两个方框是否相交
    */
    Helper.prototype.isRectOverlap = function (r1, r2) {
        if (!r1 || !r2)
            return false;
        return !(((r1.right < r2.left) || (r1.bottom < r2.top)) || ((r2.right < r1.left) || (r2.bottom < r1.top)));
    };
    /*
      判断点是否在方框里
    */
    Helper.prototype.isPointInRect = function (point, r) {
        return ((point.x >= r.left) && (point.x <= r.right) && (point.y >= r.top) && (point.y <= r.bottom));
    };
    /*
      获取矩阵变换后的点坐标
    */
    Helper.prototype.transformPoint = function (p, t, ignoreOffset) {
        if (ignoreOffset) {
            return new Point(t[0] * p.x + t[2] * p.y, t[1] * p.x + t[3] * p.y);
        }
        return new Point(t[0] * p.x + t[2] * p.y + t[4], t[1] * p.x + t[3] * p.y + t[5]);
    };
    return Helper;
}());
var ElementBase = /** @class */ (function () {
    function ElementBase() {
        // 绘制元素的ID号，用于查找到指定元素
        this.id = -1;
        this.pointList = [];
        // 元素配置
        this.config = {
            lineColor: '#000000',
            lineWidth: 1
        };
        this.type = 'elementBase';
        this.transformMatrix = [1, 0, 0, 1, 0, 0];
        this.finish = false;
        this.from = 0;
        this.helper = new Helper();
        this.ctxConfig = {
            renderCtx: 'ctx',
            saveCtx: true
        };
        this.rectContainer = {
            left: -1,
            right: -1,
            bottom: -1,
            top: -1
        };
    }
    ElementBase.prototype.getType = function () {
        return this.type;
    };
    ElementBase.prototype.getPointList = function () {
        return this.pointList;
    };
    ElementBase.prototype.getCtxconfig = function () {
        return this.ctxConfig;
    };
    ElementBase.prototype.drawBegin = function (event) {
        var curPoint = this._getPoint(event);
        this._addPoint(curPoint);
    };
    ElementBase.prototype.drawing = function (event) {
        var curPoint = this._getPoint(event);
        this._addPoint(curPoint);
    };
    ElementBase.prototype.drawEnd = function (event) {
        if (event) {
            var curPoint = this._getPoint(event);
            this._addPoint(curPoint);
        }
    };
    ElementBase.prototype.updateRectContainer = function (p) {
        if (this.rectContainer.left < 0) {
            this.rectContainer.left = p.x;
            this.rectContainer.right = p.x;
            this.rectContainer.top = p.y;
            this.rectContainer.bottom = p.y;
        }
        else {
            if (p.x < this.rectContainer.left) {
                this.rectContainer.left = p.x;
            }
            if (p.x > this.rectContainer.right) {
                this.rectContainer.right = p.x;
            }
            if (p.y < this.rectContainer.top) {
                this.rectContainer.top = p.y;
            }
            if (p.y > this.rectContainer.bottom) {
                this.rectContainer.bottom = p.y;
            }
        }
    };
    ElementBase.prototype.render = function (context) {
        this._beginRender(context);
        var result = this._render(context);
        this._endRender(context);
        return result;
    };
    ElementBase.prototype._beginRender = function (context) {
        context.save();
        context.transform(this.transformMatrix[0], this.transformMatrix[1], this.transformMatrix[2], this.transformMatrix[3], this.transformMatrix[4], this.transformMatrix[5]);
    };
    ElementBase.prototype.getRectContainer = function () {
        return this.rectContainer;
    };
    ElementBase.prototype._endRender = function (context) {
        context.restore();
        this.finish = true;
    };
    /**
     * 根据pointList生成路径或图形
     */
    ElementBase.prototype._render = function (ctx) {
        if (!this.pointList || this.pointList.length < 1)
            return this.finish;
        if (this.pointList.length === 1) {
            this._renderPoint(ctx);
        }
        else if (this.pointList.length > 1) {
            this._renderPath(ctx);
        }
        this.from = this.pointList.length - 1;
        return this.finish;
    };
    ElementBase.prototype.isFinish = function () {
        return this.finish;
    };
    /**
     * 绘制一个点
     * @param {Point} point 点
     */
    ElementBase.prototype._renderPoint = function (ctx) {
        ctx.fillStyle = this.config.lineColor;
        ctx.beginPath();
        ctx.arc(this.pointList[0].x, this.pointList[0].y, this.config.lineWidth / 2, 0, 2 * Math.PI, true);
        ctx.fill();
    };
    /**
     * 点选与圈选
     * @param {ctx} 当前所在画布
     * @param {chooseZoneInfo} 路径点的外框数据
     * @param {scale} 画布是否缩放
     */
    ElementBase.prototype.judgeIsPointInPath = function (ctx, chooseZoneInfo, scale) {
        var calcSteps = 6;
        var preDrawPoints = [];
        if (this.type === 'pen') { // 兼容笔记的内存优化方案
            var drawPoints = JSON.parse(JSON.stringify(this.pointList));
            for (var _i = 0, drawPoints_1 = drawPoints; _i < drawPoints_1.length; _i++) {
                var v = drawPoints_1[_i];
                preDrawPoints.push(this.helper.transformPoint(v, this.transformMatrix));
            }
        }
        else {
            for (var _a = 0, _b = this.pointList; _a < _b.length; _a++) {
                var v = _b[_a];
                preDrawPoints.push(this.helper.transformPoint(v, this.transformMatrix));
            }
        }
        var info = this.rectContainer;
        if (this.helper.isRectOverlap(chooseZoneInfo, info)) {
            for (var j = 0; j < this.pointList.length;) {
                var point = this.pointList[j];
                // 对旋转，移动，缩放的元素的点进行处理
                if (this.helper.isPointInRect(this.helper.transformPoint(point, this.transformMatrix), chooseZoneInfo) && ctx.isPointInPath(point.x * scale, point.y * scale)) {
                    return true;
                }
                j = j + calcSteps;
            }
        }
    };
    /**
     * 绘制一个路径
     * @param pointList 点的集合
     */
    ElementBase.prototype._renderPath = function (ctx) {
        ctx.strokeStyle = this.config.lineColor;
        ctx.lineWidth = this.config.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        var endIndex = this.pointList.length - 1;
        for (var i = this.from; i < endIndex; i++) {
            if (i === 0) {
                ctx.beginPath();
                ctx.moveTo(this.pointList[i].x, this.pointList[i].y);
            }
            else {
                this._renderLineTo(ctx, this.pointList[i]);
            }
        }
    };
    /**
     * 绘制一条直线
     */
    ElementBase.prototype._renderLineTo = function (ctx, p) {
        if (!p)
            return;
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
    };
    /**
     * 添加过滤之后的采样点
     * @param {Point} point 点
     * @returns {number} 如果成功添加采样点，返回过滤后采样点数组长度，否则返回-1
     */
    ElementBase.prototype._addPoint = function (point) {
        if (this._pointFilter(point)) {
            this.pointList.push(point);
            this.updateRectContainer(point);
            return this.pointList.length;
        }
        else {
            return -1;
        }
    };
    /**
     * 点过滤器
     * @param {Point} point 点
     * @returns {Boolean} 返回是否被过滤，true表示不过滤，false表示被过滤
     */
    ElementBase.prototype._pointFilter = function (point) {
        if (this.pointList.length === 0)
            return true;
        var lastPoint = this.pointList[this.pointList.length - 1];
        if (point.x === lastPoint.x && point.y === lastPoint.y) {
            return false;
        }
        else {
            return true;
        }
    };
    ElementBase.prototype._getPoint = function (event) {
        return new Point(event.offsetX, event.offsetY, event.pressure);
    };
    ElementBase.prototype.setEleId = function (id) {
        this.id = id;
    };
    ElementBase.prototype.getID = function () {
        return this.id;
    };
    ElementBase.prototype.setConfig = function (cfg) {
        this.config = cfg;
    };
    return ElementBase;
}());
exports["default"] = ElementBase;
