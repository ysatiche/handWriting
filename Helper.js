"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var point_1 = require("./elements/point");
var Helper = /** @class */ (function () {
    function Helper() {
        this.PiBy180 = Math.PI / 180;
        this.PiBy2 = Math.PI / 2;
    }
    /**
     * 数学相关函数
     */
    /*
     弧度 转 角度
   */
    Helper.prototype.radiansToDegrees = function (radians) {
        return radians / this.PiBy180;
    };
    Helper.prototype.cos = function (radians) {
        if (radians === 0) {
            return 1;
        }
        if (radians < 0) {
            radians = -radians;
        }
        var angleSlice = radians / this.PiBy2;
        switch (angleSlice) {
            case 1:
            case 3:
                return 0;
            case 2:
                return -1;
        }
        return Math.cos(radians);
    };
    Helper.prototype.sin = function (radians) {
        var PiBy2 = Math.PI / 2;
        if (radians === 0) {
            return 0;
        }
        var angleSlice = radians / PiBy2;
        var sign = 1;
        if (radians < 0) {
            sign = -1;
        }
        switch (angleSlice) {
            case 1:
                return sign;
            case 2:
                return 0;
            case 3:
                return -sign;
        }
        return Math.sin(radians);
    };
    /*
      判断两个方框是否相交
    */
    Helper.prototype.isRectOverlap = function (r1, r2) {
        if (!r1 || !r2)
            return false;
        return !(((r1.right < r2.left) || (r1.bottom < r2.top)) || ((r2.right < r1.left) || (r2.bottom < r1.top)));
    };
    /**
     * 获取两个外方框到并集
     */
    Helper.prototype.getOuterTogether = function (r1, r2) {
        return {
            left: r1.left < r2.left ? r1.left : r2.left,
            right: r1.right < r2.right ? r2.right : r1.right,
            top: r1.top < r2.top ? r1.top : r2.top,
            bottom: r1.bottom < r2.bottom ? r2.bottom : r1.bottom
        };
    };
    /*
      判断点是否在方框里
    */
    Helper.prototype.isPointInRect = function (point, r) {
        return ((point.x >= r.left) && (point.x <= r.right) && (point.y >= r.top) && (point.y <= r.bottom));
    };
    /**
     * 判断点是否在圆中
     */
    Helper.prototype.isPointInCircle = function (point, centerX, centerY, radius) {
        return Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2) < Math.pow(radius, 2);
    };
    /*
      旋转矩阵
    */
    Helper.prototype.calcRotateMatrix = function (radians) {
        if (radians === void 0) { radians = 0; }
        var cos = this.cos(radians);
        var sin = this.sin(radians);
        return [cos, sin, -sin, cos, 0, 0];
    };
    /*
      平移矩阵
    */
    Helper.prototype.calcTranslateMatrix = function (x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        return [1, 0, 0, 1, x, y];
    };
    /*
      缩放矩阵
    */
    Helper.prototype.calcScaleMatrix = function (scaleX, scaleY) {
        if (scaleX === void 0) { scaleX = 1; }
        if (scaleY === void 0) { scaleY = 1; }
        return [scaleX, 0, 0, scaleY, 0, 0];
    };
    /*
      矩阵叠加 a * b
    */
    Helper.prototype.multiplyTransformMatrices = function (a, b) {
        return [
            a[0] * b[0] + a[2] * b[1],
            a[1] * b[0] + a[3] * b[1],
            a[0] * b[2] + a[2] * b[3],
            a[1] * b[2] + a[3] * b[3],
            a[0] * b[4] + a[2] * b[5] + a[4],
            a[1] * b[4] + a[3] * b[5] + a[5]
        ];
    };
    /*
      获取矩阵变换后的点坐标
    */
    Helper.prototype.transformPoint = function (p, t, ignoreOffset) {
        if (ignoreOffset) {
            return new point_1["default"](t[0] * p.x + t[2] * p.y, t[1] * p.x + t[3] * p.y);
        }
        return new point_1["default"](t[0] * p.x + t[2] * p.y + t[4], t[1] * p.x + t[3] * p.y + t[5]);
    };
    Helper.prototype.invertTransform = function (t) {
        var a = 1 / (t[0] * t[3] - t[1] * t[2]), r = [a * t[3], -a * t[1], -a * t[2], a * t[0]], o = this.transformPoint(new point_1["default"](t[4], t[5]), r, true);
        r[4] = -o.x;
        r[5] = -o.y;
        return r;
    };
    /**
    * 逻辑相关函数
    */
    /**
     * 动态加载模块 node环境
     */
    // async loadModules (): Promise<any> {
    //   let patcher: any = {}
    //   const absolutePath = __dirname + '\\plugins\\'
    //   let pathList = fs.readdirSync(absolutePath)
    //   for (const dir of pathList) {
    //     if (this.judgeIsDirectory(dir)) {
    //       const fileList = fs.readdirSync(absolutePath + dir)
    //       for (const filename of fileList) {
    //         if (!/\index.ts$/.test(filename)) continue
    //         let _load = await this.loadModule(absolutePath + dir + '\\index')
    //         if (_load) {
    //           patcher[dir] = _load
    //         }
    //       }
    //     }
    //   }
    //   return Promise.resolve(patcher)
    // }
    /**
     * 动态加载模块 浏览器环境
     * @param { modulesNameArr } 模块名字 加载位置  __dirname + '\\plugins\\' + ${name} + '\\index
     */
    Helper.prototype.loadModulesInBrowser = function (modulesNameArr) {
        return __awaiter(this, void 0, void 0, function () {
            var patcher, _i, modulesNameArr_1, name_1, _load;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        patcher = {};
                        _i = 0, modulesNameArr_1 = modulesNameArr;
                        _a.label = 1;
                    case 1:
                        if (!(_i < modulesNameArr_1.length)) return [3 /*break*/, 4];
                        name_1 = modulesNameArr_1[_i];
                        return [4 /*yield*/, this.loadModuleInBrowser(name_1)];
                    case 2:
                        _load = _a.sent();
                        if (_load) {
                            patcher[name_1] = _load;
                        }
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, Promise.resolve(patcher)];
                }
            });
        });
    };
    Helper.prototype.loadModuleInBrowser = function (dir) {
        return new Promise(function (resolve) {
            // 必须在 import ()中这么写，不然将路径提出去做变量会出问题
            Promise.resolve().then(function () { return require('./plugins/' + dir + '/index'); }).then(function (m) {
                resolve(m);
            })["catch"](function (e) {
                resolve(false);
            });
        });
    };
    /**
     * 判断是否为文件夹
     */
    Helper.prototype.judgeIsDirectory = function (filepath) {
        return filepath.indexOf('.') < 0;
        // windows系统涉及到权限问题，先不用下面方式
        // const stat = fs.statSync(filepath)
        // return stat.isDirectory()
    };
    /**
     * await 加载一个模块 node
     * @param dir 模块路径
     */
    Helper.prototype.loadModule = function (dir) {
        return new Promise(function (resolve) {
            Promise.resolve().then(function () { return require(dir); }).then(function (m) {
                resolve(m);
            })["catch"](function (e) {
                resolve(false);
            });
        });
    };
    // 画圆
    Helper.prototype.renderCircleControl = function (ctx, centerX, centerY, radius, styleOverride) {
        if (styleOverride.color) {
            ctx.strokeStyle = styleOverride.color;
        }
        if (styleOverride.dashed) {
            ctx.setLineDash([6, 6]);
        }
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        switch (styleOverride.methodName) {
            case 'stroke':
                ctx.stroke();
                break;
            case 'fill':
                ctx.fill();
                break;
            default:
                ctx.stroke();
        }
    };
    // 画方
    Helper.prototype.renderSquareControl = function (ctx, centerX, centerY, width, height, styleOverride) {
        if (styleOverride.color) {
            ctx.strokeStyle = styleOverride.color;
        }
        if (styleOverride.dashed) {
            ctx.setLineDash([6, 6]);
        }
        ctx.lineWidth = 1;
        ctx.beginPath();
        var left = centerX - width / 2;
        var top = centerY - height / 2;
        switch (styleOverride.methodName) {
            case 'stroke':
                ctx.strokeRect(left, top, width, height);
                break;
            case 'fill':
                ctx.fillRect(left, top, width, height);
                break;
            default:
                ctx.strokeRect(left, top, width, height);
        }
    };
    // 获取点元素的缩略信息
    Helper.prototype.getElementBaseInfo = function (eles) {
        if (eles.length === 0)
            return [];
        var arr = [];
        if (eles.length > 0) {
            eles.forEach(function (ele) {
                arr.push({
                    type: ele.getType(),
                    rectContainer: ele.getRectContainer(),
                    pointsLen: ele.getPointList().length
                });
            });
        }
        return arr;
    };
    Helper.prototype.uuidv4 = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    Helper.prototype.findIdsInElementsArray = function (id, arr) {
        var idx = -1;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].getUuid() === id) {
                idx = i;
                break;
            }
        }
        return idx;
    };
    Helper.prototype.getPenOuterZone = function (pointList) {
        if (pointList === void 0) { pointList = []; }
        if (pointList.length < 1) {
            return {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            };
        }
        var left = pointList[0].x;
        var right = pointList[0].x;
        var top = pointList[0].y;
        var bottom = pointList[0].y;
        for (var i = 1; i < pointList.length; i++) {
            if (pointList[i].x < left) {
                left = pointList[i].x;
            }
            if (pointList[i].x > right) {
                right = pointList[i].x;
            }
            if (pointList[i].y < top) {
                top = pointList[i].y;
            }
            if (pointList[i].y > bottom) {
                bottom = pointList[i].y;
            }
        }
        // if (top <= bottom || left <= right) {
        //   return null
        // }
        return {
            left: left,
            right: right,
            top: top,
            bottom: bottom
        };
    };
    return Helper;
}());
exports["default"] = Helper;
