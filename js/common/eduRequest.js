console.log('http 网络模块')
var isDevelopmentEnv = false; //设置是不是测试环境

//var x_apidomain = 'http://jk.wufangedu.com';
var x_apidomain = 'http://192.168.0.88:8081/y_baiji/public/api/v1/';
var x_imgdomain = 'http://image.wufangedu.com'; //湖南正式

//返回码
if(typeof WFResponseCode == "undefined") {　　　　　　　　　　　
	var WFResponseCode = {};　　　　　　　　　　　
	WFResponseCode.Success = 0;　　　　　　　　　　　
	WFResponseCode.ParamError = 8002;　　　　　　　　　
	WFResponseCode.DataInvalid = 9003;
	WFResponseCode.NORelateUser = 9004;　
	WFResponseCode.PasswordError = 9001;　　　　
}


function eduresponse(code, msg, data, errorblock) {
	var response = new Object();
	response.code = code;
	if(code == WFResponseCode.Success) {
		response.data = data;
		response.err = null;
	} else {
		response.data = null;
		response.err = msg;
		if(!errorblock) {
			mui.toast(response.err)
		} else {
			console.log(errorblock);
			errorblock(response.err)
		}
	}
	return response;
}

function onEduRequestDidFinished(result, completeBlock, errorblock) {
	var response = eduresponse(result.responseCode, result.responseMessage, result.data, errorblock);
	if(response.err) {
		if(!errorblock) {
			errorblock(response.err)
		}
	} else {
		completeBlock(response.data);
	}
}

function createImgPath(path) {
	var httpStart = path.startsWith('http');
	if(httpStart) {
		urlpath = path;
	} else {
		if(path.iStartsWith('/')) {
			urlpath = x_imgdomain + path;
		} else {
			urlpath = x_imgdomain + '/' + path;
		}
	}
//	console.log('url = ' + urlpath);
	return urlpath;
}

function handleApiUrlPath(path) {
	var httpStart = path.startsWith('http');
	console.log('httpStart' + httpStart);
	if(httpStart) {
		urlpath = path;
	} else {
		if(path.startsWith('/')) {
			urlpath = x_apidomain + path;
		} else {
			urlpath = x_apidomain + '/' + path;
		}
	}
//	console.log('url = ' + urlpath);
	return urlpath;
}

/**
 * @param {Object} path 发起http请求的相对路径
 * @param {Object} param http请求的参数
 * @param {Object} completeBlock 请求完成的响应代码
 * @param {Object} errorblock 请求失败的响应代码 这里注意默认不要设置 
 * @param {Object} errorblock 发生错误时会自动toast错误,如果自己设置所有错误的处理都是自己处理,包括弹窗
 */
function eduget(path, param, completeBlock, errorblock) {
	var requestUrlStr = handleApiUrlPath(path);
	//用ajax 可以打印更多错误信息
	mui.ajax(requestUrlStr, {
		data: param,
		dataType: 'json',
		type: 'get',
		timeout: 10000,
		headers: {},
		success: function(result) {
			onEduRequestDidFinished(result, completeBlock, errorblock);
		},
		error: function(xhr, type, errorThrown) {
			errorblock(xhr.statusText)
		}
	});
}

function edupost(path, param, completeBlock, errorblock) {
	var requestUrlStr = handleApiUrlPath(path);
	mui.ajax(requestUrlStr, {
		data: param,
		dataType: 'json',
		type: 'post',
		timeout: 10000,
		headers: {},
		success: function(result) {
			onEduRequestDidFinished(result, completeBlock, errorblock);
		},
		error: function(xhr, type, errorThrown) {
			errorblock(xhr.statusText)
		}
	});
}