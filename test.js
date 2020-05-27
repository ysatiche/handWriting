const testjson = [{
	"needImgDisplay": true,
	"title": "串讲资料",
	"type": "lessonInfo",
	"videoList": [{
		"name": "peiqi-shell/page/44484e6e-f9e6-42be-be64-8f1321e0e3e9/13-调试案例-需求说明.mp4",
		"res": {
			"aborted": false,
			"data": {
				"data": [],
				"type": "Buffer"
			},
			"headers": {
				"content-length": "0",
				"etag": "\"CF7AFDC47DC817A1D499F83DC080C640\"",
				"x-oss-request-id": "5EA6775F9EB8073037CD109F"
			},
			"keepAliveSocket": false,
			"remoteAddress": "",
			"remotePort": "",
			"requestUrls": ["http://jfshimages.oss-cn-beijing.aliyuncs.com/peiqi-shell/page/44484e6e-f9e6-42be-be64-8f1321e0e3e9/13-%E8%B0%83%E8%AF%95%E6%A1%88%E4%BE%8B-%E9%9C%80%E6%B1%82%E8%AF%B4%E6%98%8E.mp4"],
			"rt": 470,
			"size": 0,
			"status": 200,
			"statusCode": 200,
			"timing": null
		},
		"time": 125.759,
		"url": "http://jfshimages.oss-cn-beijing.aliyuncs.com/peiqi-shell/page/44484e6e-f9e6-42be-be64-8f1321e0e3e9/13-%E8%B0%83%E8%AF%95%E6%A1%88%E4%BE%8B-%E9%9C%80%E6%B1%82%E8%AF%B4%E6%98%8E.mp4",
		"videoName": "13-调试案例-需求说明"
	}, {}]
}, {
	"needImgDisplay": true,
	"title": "教学实录",
	"type": "teachingVideo",
	"videoList": [{}]
}]
function filterVideoByType (type) {
    return testjson.filter(v => {
      return v.type === type
    })
  }

const lesssonInfoArr = filterVideoByType('lessonInfo')

// console.log(Object.keys(lesssonInfoArr[0].videoList[0]) > 0)

// console.log(Object.keys(lesssonInfoArr[0].videoList[0]))

// let arr = [1,2,3]
// const tmp = arr.map(item => {
//     if (item < 2) {
//         return item
//     }
//     return 2 * item
// })

// console.log(tmp)
let arr = [1,2,3]

class Test {
  constructor (arr) {
    this.arr = arr
  }

  getArr () {
    return this.arr
  }
  updateArr () {
    this.arr.pop()
  }
}

// const test = new Test(arr)
// arr.push(4)
// console.log(test.getArr())
// test.updateArr()
// console.log(arr)

// let a = 5
// console.log(a^2)

const str = ' ERASER ELEMENT ID 1 TO ELEMENT ID 4 ID 5 '

// console.log(str.split('TO')[1].split('ID'))

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function trim(str) {
	if (str == null) {
	  return "";
	}
	return str.replace(/^\s*(.*?)[\s\n]*$/g,'$1');   
}

console.log(trim(' ') === '')

// console.log(uuidv4())
