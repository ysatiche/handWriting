"use strict";
exports.__esModule = true;
var Helper_1 = require("./Helper");
var OperatorRecorder = /** @class */ (function () {
    function OperatorRecorder(eles, elesActive) {
        this.eles = eles;
        this.elesActive = elesActive;
        this.deleteEles = []; // 暂时丢弃的画布元素
        this.operatorArr = []; // 历史操作记录
        this.historyIdx = -1; // handleAddOperator下标
        this.helper = new Helper_1["default"]();
    }
    /**
     * 判断添加进来的操作语句是否合法
     */
    OperatorRecorder.prototype.checkOperatorLegal = function (str) {
        return true;
    };
    /**
     * 去除字符串前后空格
     * @param str
     */
    OperatorRecorder.prototype.trim = function (str) {
        if (!str)
            return '';
        return str.replace(/^\s*(.*?)[\s\n]*$/g, '$1');
    };
    /**
     * 对添加元素的反操作
     * @param { string } str 添加元素的语句 eg. ADD ID 1
     * @returns { boolean } 是否成功
     */
    OperatorRecorder.prototype.handleAddOperator = function (str) {
        var delIdArr = this.trim(str).split(' ');
        var delId = delIdArr[delIdArr.length - 1];
        this.delElementById(delId);
    };
    /**
     * 对删除元素的反操作
     * @param { string } str 添加元素的语句 eg. DEL ID 1
     * @returns { boolean } 是否成功
     */
    OperatorRecorder.prototype.handleDelOperator = function (str) {
        var delIdArr = this.trim(str).split(' ');
        var delId = delIdArr[delIdArr.length - 1];
        this.addDeletedEle(delId);
    };
    /**
     * 对橡皮擦除元素的 revoke
     * eg. ERASER ID 1 TO ID 4 ID 5 && ERASER ID 6 TO ID 4 ID 7
     */
    OperatorRecorder.prototype.handleEraserOperator = function (str, op) {
        console.warn("[handleEraserOperator] [op] " + op + " [str] " + str + " [deleteEles] " + JSON.stringify(this.helper.getElementBaseInfo(this.deleteEles)));
        var strOpts = str.split('&&');
        for (var esIdx = 0; esIdx < strOpts.length; esIdx++) {
            var arr = this.trim(strOpts[esIdx]).split('TO');
            var eraserId = this.trim(arr[0].split('ID')[1]);
            var geneIdArr = arr[1].split('ID');
            // geneIdArr 会出现 ['', ' 4 ', ' 5 ']
            console.warn("[handleEraserOperator][eraserId] " + eraserId + " [geneIdArr] " + JSON.stringify(geneIdArr));
            if (op === 'revoke') {
                var idx = this.helper.findIdsInElementsArray(eraserId, this.deleteEles);
                if (idx > -1) {
                    this.eles.push(this.deleteEles[idx]);
                    for (var i = 0; i < geneIdArr.length; i++) {
                        var geId = this.helper.findIdsInElementsArray(this.trim(geneIdArr[i]), this.eles);
                        if (geId > -1) {
                            this.deleteEles.push(this.eles[geId]);
                            this.eles.splice(geId, 1);
                        }
                    }
                }
            }
            else if (op === 'recovery') {
            }
        }
    };
    /**
     * 删除某id的元素
     */
    OperatorRecorder.prototype.delElementById = function (id) {
        var idx = this.helper.findIdsInElementsArray(id, this.eles);
        if (idx > -1) {
            this.deleteEles.push(this.eles[idx]);
            this.eles.splice(idx, 1);
        }
        idx = this.helper.findIdsInElementsArray(id, this.elesActive);
        if (idx > -1) {
            this.elesActive.splice(idx, 1);
        }
    };
    /**
     * 从 deleteEles 中添加已被删除的元素
     */
    OperatorRecorder.prototype.addDeletedEle = function (id) {
        var idx = this.helper.findIdsInElementsArray(id, this.deleteEles);
        if (idx > -1) {
            var ele = this.deleteEles.splice(idx, 1);
            this.eles.push(ele[0]);
        }
    };
    /**
     * 撤销
     * 从this.operatorArr pop出一个操作
     */
    OperatorRecorder.prototype.revoke = function () {
        console.warn("[revoke] [this.historyIdx] " + this.historyIdx + " [this.operatorArr] " + JSON.stringify(this.operatorArr));
        var status = false;
        if (this.historyIdx > -1 && this.operatorArr[this.historyIdx]) {
            var opStr = this.operatorArr[this.historyIdx];
            opStr = typeof opStr === 'undefined' ? '' : opStr;
            var op = this.trim(opStr).split(' ')[0];
            switch (op) {
                case 'ADD':
                    this.handleAddOperator(opStr);
                    break;
                case 'DEL':
                    this.handleDelOperator(opStr);
                    break;
                case 'ERASER':
                    this.handleEraserOperator(opStr, 'revoke');
                    break;
                default:
                    break;
            }
            this.historyIdx--;
            status = true;
        }
        return {
            status: status,
            historyStatus: this.getHistoryStatus()
        };
    };
    /**
     * 恢复
     */
    OperatorRecorder.prototype.recovery = function () {
        console.warn("[recovery] [this.historyIdx] " + this.historyIdx + " [this.operatorArr] " + JSON.stringify(this.operatorArr));
        var status = false;
        if (this.historyIdx < this.operatorArr.length - 1 && this.operatorArr[this.historyIdx + 1]) {
            var opStr = this.operatorArr[this.historyIdx + 1];
            opStr = typeof opStr === 'undefined' ? '' : opStr;
            var op = this.trim(opStr).split(' ')[0];
            switch (op) {
                case 'ADD':
                    this.handleDelOperator(opStr);
                    break;
                case 'DEL':
                    this.handleDelOperator(opStr);
                    break;
                default:
                    break;
            }
            this.historyIdx++;
            status = true;
        }
        return {
            status: status,
            historyStatus: this.getHistoryStatus()
        };
    };
    /**
     * 获取 revoke recovery的状态
     */
    OperatorRecorder.prototype.getHistoryStatus = function () {
        var revokeStatus = true;
        if (this.historyIdx < 0) {
            revokeStatus = false;
        }
        var recoveryStatus = true;
        if (this.historyIdx >= this.operatorArr.length - 1) {
            recoveryStatus = false;
        }
        return {
            revokeStatus: revokeStatus,
            recoveryStatus: recoveryStatus
        };
    };
    /**
     * 添加一个操作记录
     * 判断 str 是否合法
     */
    OperatorRecorder.prototype.addOperator = function (str, arr) {
        var _a;
        if (this.checkOperatorLegal(str)) {
            this.operatorArr.push(str);
            this.historyIdx++;
            if (arr && arr.length > 0) {
                (_a = this.deleteEles).push.apply(_a, arr);
            }
            return true;
        }
        else {
            return false;
        }
    };
    return OperatorRecorder;
}());
exports["default"] = OperatorRecorder;
