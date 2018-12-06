var isDevelopmentEnv = true; //设置是不是测试环境
var bjversion = '1.5.4'; //设置是不是测试环境
var x_apidomain = 'http://jk.wufangedu.com';
var x_imgdomain = 'http://image.wufangedu.com'; //湖南正式

var bj_apidomain = 'https://wxpay.xiaoxiangxjz.com/api/v6'; //正式服务器
//var bj_apidomain = 'https://wxpay.xiaoxiangxjz.com/api/v3'; //正式服务器
//var bj_apidomain_test = 'https://bjpaytest.xiaoxiangxjz.com/api/v3'; //临时测试服务器本地
//var bj_apidomain_test = 'http://192.168.0.203/y_baiji/public/index.php/api/v4'; //临时邹正波器本地
var bj_apidomain_test = 'https://bjpaytest.xiaoxiangxjz.com/api/v6'; //临时测试服务器本地
//var bj_apidomain_test = 'http://bjpaytest.xiaoxiangxjz.com:12381/api/v6'; //临时测试服务器本地

var bj_imgdomain = 'http://jk.wufangedu.com'; //因为叶老师说的服务端一定返回绝对地址 这里可能就会用不到
//
var bj_webpath = '/bjweb/project';
var bj_web_root = '/bjweb';
//返回码
if(typeof BJResponseCode == "undefined") {
	var BJResponseCode = {};
	BJResponseCode.Success = 1;
	BJResponseCode.TokenInvalid = 2;
	BJResponseCode.ParamError = 8002;
	BJResponseCode.DataInvalid = 9003;
	BJResponseCode.NORelateUser = 9004;
	BJResponseCode.PasswordError = 9001;
}

if (mui.os.wechat) {
	getOpenid();
}

function bjresponse(code, msg, data) {
	var response = new Object();
	response.code = code;
	if(code == BJResponseCode.Success) {
		if(data) {
			//判断是不是包含list的属性
			var islist = data.hasOwnProperty('list');
			if(islist) {
				response.data = data.list;
			} else {
				response.data = data;
			}
			response.err = null;
		}

	} else {
		if(code == BJResponseCode.TokenInvalid) {
			require(['session'], function(session) {
				session.handleLoginOut();
			})
		}
		response.data = null;
		response.err = msg;
	}
	return response;
}

function onRequestDidFinished(result, completeBlock, errorblock) {
	var response = bjresponse(result.code, result.msg, result.data, errorblock);
	if(response.err) {
		if(!errorblock) {
			//			mui.toast(response.err)
		} else {
			errorblock(response.err)
		}
	} else {
		completeBlock(response.data);
	}
}

function onCompleteRequestDidFinished(result, completeBlock) {
	var response = bjresponse(result.code, result.msg, result.data);
	if(response.err) {
		completeBlock(null, response.err);
	} else {
		completeBlock(response.data, null);
	}
}

function createImgPath(path) {
	if(path == null || path.length == 0) {
		return '';
	}
	var httpStart = path.iStartsWith('http');
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
	var httpStart = path.iStartsWith('http');
	if(httpStart) {
		urlpath = path;
	} else {
		var apidomain = bj_apidomain;
		if(isDevelopmentEnv) {
			apidomain = bj_apidomain_test;
		}

		if(path.iStartsWith('/')) {
			urlpath = apidomain + path;
		} else {
			urlpath = apidomain + '/' + path;
		}
	}
	return urlpath;
}

/**
 * @param {Object} path 发起http请求的相对路径
 * @param {Object} param http请求的参数
 * @param {Object} completeBlock 请求完成的响应代码
 * @param {Object} errorblock 请求失败的响应代码 这里注意默认不要设置 
 * @param {Object} errorblock 发生错误时会自动toast错误,如果自己设置所有错误的处理都是自己处理,包括弹窗
 */
function bjget(path, param, completeBlock, errorblock) {
	var requestUrlStr = handleApiUrlPath(path);
	//用ajax 可以打印更多错误信息
	mui.ajax(requestUrlStr, {
		data: param,
		dataType: 'json',
		type: 'get',
		xhrFields: {
            withCredentials: true  //解决跨域session不一致问题
        },
		crossDomain: true,
		timeout: 30000,
		headers: {},
		success: function(result) {
			onRequestDidFinished(result, completeBlock, errorblock);
		},
		error: function(xhr, type, errorThrown) {
			if(!errorblock) {
				mui.toast(xhr.statusText);
			} else {

				errorblock(xhr.statusText);
			}
		}
	});
}

function bjpost(path, param, completeBlock, errorblock) {
	param.device_type = 'web';
	var requestUrlStr = handleApiUrlPath(path);
	$.ajax(requestUrlStr, {
		data: param,
		dataType: 'json',
		type: 'post',
		xhrFields: {
            withCredentials: true  //解决跨域session不一致问题
        },
		crossDomain: true,
		timeout: 30000,
		headers: {},
		success: function(result) {
			onRequestDidFinished(result, completeBlock, errorblock);
		},
		error: function(xhr, type, errorThrown) {
			if(!errorblock) {
				if(mui.os.plus) {
					plus.nativeUI.closeWaiting();
				}
				//				mui.toast(xhr.statusText);
			} else {
				errorblock(xhr.statusText)
			}
		}
	});
}

function bjcpost(path, param, completeBlock) {
	param.device_type = 'web';
	var requestUrlStr = handleApiUrlPath(path);
	$.ajax(requestUrlStr, {
		data: param,
		dataType: 'json',
		type: 'post',
		xhrFields: {
            withCredentials: true  //解决跨域session不一致问题
        },
		crossDomain: true,
		timeout: 30000,
		headers: {},
		success: function(result) {
			onCompleteRequestDidFinished(result, completeBlock);
		},
		error: function(xhr, type, errorThrown) {
			if(completeBlock) {
				completeBlock(null, xhr.statusText);
			} else {
				mui.toast('请求超时');
			}
		}
	});
}

String.prototype.iStartsWith = function(str) {
	return this.substr(0, str.length) == str;
}