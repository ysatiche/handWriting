"use strict";
exports.__esModule = true;
var point_1 = require("../elements/point");
/*
 * 几何图形绘制
 */
var OriginShape = /** @class */ (function () {
    function OriginShape() {
    }
    OriginShape.prototype.isPointInFace = function (point) {
        return -1;
    };
    OriginShape.prototype.insidePolygon = function (point, vs) {
        // ray-casting algorithm based on
        // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
        var x = point.x;
        var y = point.y;
        var inside = false;
        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            var xi = vs[i].x;
            var yi = vs[i].y;
            var xj = vs[j].x;
            var yj = vs[j].y;
            var intersect = (yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
            if (intersect)
                inside = !inside;
        }
        return inside;
    };
    OriginShape.prototype.insideEllipse = function (point, origin, radiusA, radiusB) {
        var p = Math.pow(point.x - origin.x, 2) / Math.pow(radiusA, 2) +
            Math.pow(point.y - origin.y, 2) / Math.pow(radiusB, 2);
        return p <= 1;
    };
    OriginShape.prototype.insideCircle = function (point, origin, radius) {
        return Math.pow(point.x - origin.x, 2) + Math.pow(point.y - origin.y, 2) <= radius * radius;
    };
    OriginShape.prototype.getStartEnd = function (start, end) {
        var minX = Math.min(start.x, end.x);
        var minY = Math.min(start.y, end.y);
        var maxX = Math.max(start.x, end.x);
        var maxY = Math.max(start.y, end.y);
        return {
            start: { x: minX, y: minY },
            end: { x: maxX, y: maxY }
        };
    };
    /**
     *  通用的获取点的方法
     *  _circle 获取半圆的点
     *  _getLinePointsArr 获取直线的点
     *  _axis 获取坐标系的轴的点
     */
    OriginShape.prototype._circle = function (center, a, b, semiCircle) {
        var pointsArr = [];
        var baseCircleLen = 5;
        var r = a > b ? a : b;
        // let centerPoint = { x: center.x / ratioX, y: center.y / ratioY }
        // 上半圆，暂定 count = this.baseCircleLen * r
        var count = baseCircleLen * r;
        var step = Math.PI / count;
        var angle = 0;
        for (var i = 0; i < count; i++) {
            pointsArr.push(new point_1["default"](center.x + a * Math.cos(angle), center.y - b * Math.sin(angle)));
            angle += step;
        }
        if (semiCircle === 'up')
            return pointsArr;
        var arr = [];
        angle = 0;
        for (var i = 0; i < count; i++) {
            arr.push(new point_1["default"](center.x + a * Math.cos(angle), center.y + b * Math.sin(angle)));
            angle += step;
        }
        if (semiCircle === 'down')
            return arr;
        pointsArr.push.apply(pointsArr, arr);
        return pointsArr;
    };
    OriginShape.prototype._getLinePointsArr = function (start, end) {
        var baseLen = 2;
        var pointsArr = [];
        var xCalc = end.x - start.x;
        var yCalc = end.y - start.y;
        // let xyslope = yCalc !== 0 ? xCalc / yCalc : 0
        var arrLen = xCalc !== 0 ? Math.abs(xCalc) * baseLen : Math.abs(yCalc) * baseLen;
        pointsArr.push(start);
        for (var i = 0; i < arrLen; i++) {
            var prePoint = pointsArr[i];
            pointsArr.push(new point_1["default"](prePoint.x + xCalc / arrLen, prePoint.y + yCalc / arrLen));
        }
        return pointsArr;
    };
    return OriginShape;
}());
exports["default"] = OriginShape;
