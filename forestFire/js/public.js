//项目统一路径

var layerLayer = null;
var layerElement = null;
var layerTable = null;
var loadinglayer; //loading覆盖层
var tableNumber = 14;

var contourPath = 'http://139.9.243.34:8082/contour/';

$(function() {
	layui.use(['layer', 'element', 'table'], function() {
		layerLayer = layui.layer;
		layerElement = layui.element;
		layerTable = layui.table;

		if((typeof init) === 'function') {
			init();
		}
	})
});

//开始加载
function startLoad() {
	loadinglayer = layerLayer.load(0, {
		shade: [0.5, '#000'] //0.1透明度的白色背景
	});
}
//结束加载
function endLoad(idx) {
	layerLayer.close(loadinglayer);
}

function $$(url, data, callBack, failback) {
	startLoad();
	var requestAjax = $.ajax({
		type: "get",
		url: "http://139.9.243.34:8081/fireIndexCalculate/" + url,
		data: data,
		dataType: 'json',
		timeout: 60000,
		success: function(result) {
			endLoad(loadinglayer);
			if(result.code) {
				callBack(result.data);
			} else {
				layerLayer.msg('请求失败', {
					icon: 5
				});
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			endLoad(loadinglayer);
			if(textStatus == 'timeout') { //超时,status还有success,error等值的情况
				requestAjax.abort();　
				timeoutErrorBack();　
			} else {
				if(!failback) {
					errorBack(error);
				} else {
					failback();
				}
			}　
		}
	});
}

/****
 * 时间戳转时间
 */
function formatDateTime(inputTime) {
	var date = inputTime ? new Date(inputTime) : new Date();
	var y = date.getFullYear();
	var m = date.getMonth() + 1;
	m = m < 10 ? ('0' + m) : m;
	var d = date.getDate();
	d = d < 10 ? ('0' + d) : d;
	var h = date.getHours();
	h = h < 10 ? ('0' + h) : h;
	var minute = date.getMinutes();
	var second = date.getSeconds();
	minute = minute < 10 ? ('0' + minute) : minute;
	second = second < 10 ? ('0' + second) : second;
	return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
}
//请求出错
function errorBack() {
	layerLayer.msg('网络出错！', {
		icon: 5
	});
}
//请求超时
function timeoutErrorBack() {
	layerLayer.msg('请求超时！', {
		icon: 5
	});
}

//获取当前url中参数
function getvl(name) {
	var reg = new RegExp("(^|\\?|&)" + name + "=([^&]*)(\\s|&|$)", "i");
	var url = encodeURI(parent.location.href); //location.href
	if(reg.test(url)) {
		var title = RegExp.$2.replace(/\+/g, " ");
		var uriToStr = decodeURI(decodeURI(title));
		return uriToStr;
	}
	return "";
}
//select动态添加option
function _addOption(id, data) {
	$("#" + id).html('');
	for(var i = 0; i < data.length; i++) {
		var html = '';
		if(i == 0) {
			//html = "<option value='" + data[i]['value'] + "' selected=''>" + data[i]['label'] + "</option>";
			html = "<option value='" + data[i]['value'] + "'>" + data[i]['label'] + "</option>";
		} else {
			html = "<option value='" + data[i]['value'] + "'>" + data[i]['label'] + "</option>";
		}
		$("#" + id).append(html);
	}
	layerForm.render();
}
/**
 * 得到当前时间
 * 
 * **/
function getCurrentTime() {
	var myDate = new Date();
	myDate.setHours(myDate.getHours());
	var month = (myDate.getMonth() + 1);
	var date = myDate.getDate();
	var hour = myDate.getHours();
	if(month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if(date >= 1 && date <= 9) {
		date = "0" + date;
	}
	if(hour <= 9) {
		hour = "0" + hour;
	}
	var timestr = myDate.getFullYear() + month + date + hour + '0000';
	return timestr;
}

function getContourPath() {
	var myDate = new Date();
	myDate.setHours(myDate.getHours());
	var month = (myDate.getMonth() + 1);
	var date = myDate.getDate();
	var hour = myDate.getHours();
	if(month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if(date >= 1 && date <= 9) {
		date = "0" + date;
	}
	if(hour <= 9) {
		hour = "0" + hour;
	}
	var timestr = contourPath + myDate.getFullYear() + '/' + month + '/' + date + '/';
	return timestr;
}

//判断是否在面内
function IsWithIn(point, list) { //list-点序列
	var x = point.x;
	var y = point.y;
	var isum, icount, index;
	var dLon1 = 0,
		dLon2 = 0,
		dLat1 = 0,
		dLat2 = 0,
		dLon;
	if(list.Count < 3) {
		return false;
	}
	isum = 0;
	icount = list.length;
	for(index = 0; index < icount - 1; index++) {
		if(index == icount - 1) {
			dLon1 = list[index][0];
			dLat1 = list[index][1];
			dLon2 = list[0][0];
			dLat2 = list[0][1];
		} else {
			dLon1 = list[index][0];
			dLat1 = list[index][1];
			dLon2 = list[index + 1][0];
			dLat2 = list[index + 1][1];
		}
		if(((y >= dLat1) && (y < dLat2)) || ((y >= dLat2) && (y < dLat1))) {
			if(Math.abs(dLat1 - dLat2) > 0) {
				dLon = dLon1 - ((dLon1 - dLon2) * (dLat1 - y)) / (dLat1 - dLat2);
				if(dLon < x)
					isum++;
			}
		}
	}
	if((isum % 2) != 0) {
		return true;
	} else {
		return false;
	}
}

function isPoneAvailable(value) {
	var myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
	return myreg.test(value);
}

//提取身份证号码
function getIDcard(str) {
	var reg = /[0-9,X,x]/;
	var num = 0;
	var IDarr = "";
	var arr = str.split("");
	for(var i = 0; i < arr.length; i++) {
		var item = arr[i];
		if(reg.test(item)) {
			num++;
			IDarr += "" + item;
			if(num == 18) {
				return IDarr.toString();
			}
		} else {
			num = 0;
			IDarr = "";
		}
	}
	return IDarr;
}
//提取手机号码
function getPhone(str) {
	var reg = /[0-9,X,x]/;
	var num = 0;
	var IDarr = "";
	var arr = str.split("");
	for(var i = 0; i < arr.length; i++) {
		var item = arr[i];
		if(reg.test(item)) {
			num++;
			IDarr += "" + item;
			if(num == 11) {
				return IDarr.toString();
			}
		} else {
			num = 0;
			IDarr = "";
		}
	}
	return IDarr;
}