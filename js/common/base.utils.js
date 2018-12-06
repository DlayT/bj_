/**
 * 拨打电话
 */
function dialPhone(phone) {
	if(plus.os.name == 'Android') {
		var Intent = plus.android.importClass("android.content.Intent");
		var Uri = plus.android.importClass("android.net.Uri");
		var main = plus.android.runtimeMainActivity();
		var uri = Uri.parse("tel:" + phone);
		var call = new Intent("android.intent.action.CALL", uri);
		main.startActivity(call);
	} else {
		var UIAPP = plus.ios.importClass("UIApplication");
		var NSURL = plus.ios.importClass("NSURL");
		var app = UIAPP.sharedApplication();
		app.openURL(NSURL.URLWithString("tel://" + phone));
	}
}

//压缩图片转成base64
function getBase64Image(img) {
	var canvas = document.createElement("canvas");
	var width = img.width;
	var height = img.height;
	if(width > height) {
		if(width > 100) {
			height = Math.round(height *= 100 / width);
			width = 100;
		}
	} else {
		if(height > 100) {
			width = Math.round(width *= 100 / height);
		}
		height = 100;
	}
	canvas.width = width;
	canvas.height = height;
	var ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0, width, height);

	var dataUrl = canvas.toDataURL('image/jpeg', 0.8);
	console.log(dataUrl);
	return dataUrl;
}

//拍照
function getImages(complete) {
	var mobileCamera = plus.camera.getCamera();
	mobileCamera.captureImage(function(e) {
		plus.io.resolveLocalFileSystemURL(e, function(entry) {
			var path = entry.toLocalURL() + '?version=' + new Date().getTime();
			if(complete) {
				complete(path);
			}
		}, function(err) {
			console.log("读取拍照文件错误");
		});
	}, function(e) {
		console.log("er", err);
	}, function() {
		filename: '_doc/head.png';
	});
}

//从本地相册选择
function galleryImages(complete) {
	console.log("你选择了从相册选择");
	plus.gallery.pick(function(a) {
		plus.io.resolveLocalFileSystemURL(a, function(entry) {
			plus.io.resolveLocalFileSystemURL('_doc/', function(root) {
				root.getFile('head.png', {}, function(file) {
					//文件已经存在
					file.remove(function() {
						console.log("文件移除成功");
						entry.copyTo(root, 'head.png', function(e) {
							var path = e.fullPath + '?version=' + new Date().getTime();
							if(complete) {
								complete(path);
							}
						}, function(err) {
							console.log("copy image fail: ", err);
						});
					}, function(err) {
						console.log("删除图片失败：（" + JSON.stringify(err) + ")");
					});
				}, function(err) {
					//打开文件失败
					entry.copyTo(root, 'head.png', function(e) {
						var path = e.fullPath + '?version=' + new Date().getTime();
						if(complete) {
							complete(path);
						}
					}, function(err) {

						console.log("上传图片失败：（" + JSON.stringify(err) + ")");
					});
				});
			}, function(e) {
				console.log("读取文件夹失败：（" + JSON.stringify(err) + ")");
			});
		});
	}, function(err) {
		console.log("读取拍照文件失败: ", err);
	}, {
		filter: 'image'
	});
};

//web 本地上传图片
function readURL(input,session) {

	if(input.files && input.files[0]) {
		var reader = new FileReader();
		reader.onload = function(e) {
			$('#avator').attr('src', e.target.result);
			uploadHeadImg(e.target.result, session.token(), session);
		}
		//		console.log(reader.readAsDataURL(input.files[0]));
		//		return reader.readAsDataURL(input.files[0]);
		reader.readAsDataURL(input.files[0]);
	}

}

function formObject() {
	var obj = {};
	var t = $('form').serializeArray();
	$.each(t, function() {
		obj[this.name] = this.value;
	});
	return obj;
}

function checkAndroidUpdate(session) {
	if(mui.os.ios) {
		return;
	}
	plus.runtime.getProperty(plus.runtime.appid, function(inf) {
		var param = {
			'token': session.token(),
			'version': inf.version
		}
		wflog(param);
		bjpost('/Common/checkUpdate.html', param, function(responseData) {
			wflog(responseData);
			if(responseData.update == 1) { //服务端有新版本了
				mui.confirm('最新版本是：' + responseData.version + ',是否更新', '发现最新版本', ['是'], function(z) {
					if(z.index == 0) {
						mui.toast('正在下载最新版本');
						var dtask = plus.downloader.createDownload(responseData.android_url, {}, function(d, status) {
							if(status == 200) { // 下载成功
								var path = d.filename;
								plus.runtime.install(path); // 安装下载的apk文件
							} else { //下载失败
								alert("Download failed: " + status);
							}
						});
						dtask.start();
					} else {
						//退出程序
						return;
					}
				});
			}
		})
	})
}

function showEmpty() {
	var html = '<div class="mui-content mui-fullscreen app-view-center" style="background: white;z-index: 10000;" id="empty">\
				  	<div class="" style="text-align: center;">\
				  		<img class="app-view-empty" src="../../img/empty_default.png"/>\
				  		<div id="" style="text-align: center;color: #E8E8E8;margin-top: 15px;">\
				  			更多惊喜,敬请期待\
				  		</div>\
				  	</div>\
				</div>';
	$('body').append(html);
}

function hideEmpty() {
	$('#empty').remove();
}

function getCurrentDate() {
	//获取当前时间

	var today = new Date();
	var year = today.getFullYear();
	var month = today.getMonth() + 1;
	var day = today.getDate();
	//	var hours = today.getHours();
	//	var minutes = today.getMinutes();
	//	var seconds = today.getSeconds();
	var timeString = year + "年" + month + "月" + day + "日";
	return timeString;
}

function showLoading() {
	var html = '<div class="mui-content mui-fullscreen app-view-center" style="background: white;z-index: 1000;" id="loadview">\
		  			<span class="mui-icon mui-spinner"></span>\
				</div>';
	$('body').append(html);
}

function hideLoading() {
	$(".mui-content").removeClass('mui-hidden');
	$(".mui-box-content").removeClass('mui-hidden');
	$('#loadview').remove();
}

function isJson(obj) {
	if(isArray(obj)) {
		return isJson(obj[0]);
	}
	var isjson = typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
	return isjson;
}

function isArray(arr) {
	if(!arr) {
		return false;
	}
	return typeof arr == "object" && arr.constructor == Array;
}

/**
 * 获取对象的类型
 * @param {Object} o
 */
function getType(o) {
	var _t;
	return((_t = typeof(o)) == "object" ? o == null && "null" || Object.prototype.toString.call(o).slice(8, -1) : _t).toLowerCase();
}

/**
 * 好看的json 显示形式
 * @param {Object} obj
 */
function prettyJson(obj) {
	return JSON.stringify(obj, undefined, 2);
}

/**
 * //专门用来输出对象
 * @param {Object} arguments
 */
function wflog(arguments) {
	if(isJson(arguments)) {
		console.log('\n' + prettyJson(arguments));
	} else {
		console.log('\n' + arguments);
	}
}

/**
 * 生成指定位数的随机数
 * @param {Object} n
 */
function random(n) {
	//初始化参数
	var rnd = "";
	for(var i = 0; i < n; i++) {
		rnd += Math.floor(Math.random() * 10);
	}
	return rnd;
}

//生成指定范围随机数
function random_qj(n, m) {
	var c = m - n + 1;
	return Math.floor(Math.random() * c + n);
}

//生成字符串
function randomString(len) {　　
	len = len || 32;　　
	var $chars = '0123456789abcdef'; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/ 　　
	var maxPos = $chars.length;　　
	var str = '';　　
	for(i = 0; i < len; i++) {　　　　
		str += $chars.charAt(Math.floor(Math.random() * maxPos));　　
	}　　
	return str;
}

/**
 * 获取用户的设备类型
 */
function device_type() {
	if(mui.os.plus) {
		return mui.os.ios ? '3' : '4';
	} else {
		return '5';
	}
}

function device_uuid() {
	if(mui.os.plus) {
		return plus.device.uuid;
	} else {
		return "WEB20170619163500" + random(6);
	}
}

function hud_show(msg, style, gif_path) {
	//默认宽高
	var param = {
		width: '70px',
		height: '70px',
	};

	mui.extend(param, style);
	//如果使用gif
	if(!isNull(gif_path)) {
		param.loading = {
			icon: gif_path
		};
	}
	return show_loading(msg, param);
}

function show_loading(msg, param) {
	if(mui.os.plus) {
		return plus.nativeUI.showWaiting(msg, param);
	}
}

function gif_loading(msg, gifpath) {
	return hud_show(msg, {
		width: (isNull(msg) ? '80px' : '95px'),
		height: (isNull(msg) ? '80px' : '95px'),
	}, gifpath)
}

function gif_loading_nomsg(gifpath) {
	return hud_show(msg, {
		width: '80px',
		height: '80px',
	}, gifpath)
}

function hud_close(hud) {
	if(hud) {
		hud.close();
	} else {
		plus.nativeUI.closeWaiting();
	}
}

//工具js 主要是一些特殊的工具方法、、
String.prototype.iStartsWith = function(str) {
	return this.substr(0, str.length) == str;
}

function androidMarket(pname) {
	plus.runtime.openURL("market://details?id=" + pname);
}

function iosAppstore(url) {
	plus.runtime.openURL("itms-apps://" + url);
}

function openSysMap(address, coordinates) {
	wflog(coordinates);
	plus.geolocation.getCurrentPosition(function(position) {
		var codns = position.coords;
		var lat = codns.latitude; //获取到当前位置的纬度；
		var longt = codns.longitude; //获取到当前位置的经度
		var ptObj1 = new plus.maps.Point(longt, lat);
		var ptObj2 = new plus.maps.Point(coordinates[0], coordinates[1]);
		plus.maps.openSysMap(ptObj2, address, ptObj1);
	}, function(e) {
		mui.toast(e.message);
	}, {
		geocode: false
	});
}

// 打开百度地图
function openBMap(address, coordinates) {
	var url = '';
	if(mui.os.android) {
		//      url = 'bdapp://map/direction?region=我的位置&origin='+coordinates[1]+','+coordinates[0]+'&destination='+address+'&mode=driving&src=andr.baidu.openAPIdemo';
		url = 'http://api.map.baidu.com/marker?location=' + coordinates[1] + ',' + coordinates[0] + '&title=' + address + '&content=' + address + '&output=html&src=webapp.baidu.openAPIdemo';
	}
	if(mui.os.ios) {
		//     url = 'baidumap://map/navi?location='+coordinates[1]+','+coordinates[0]+'&type=BLK&src=ios.baidu.openAPIdemo';
		url = 'http://api.map.baidu.com/marker?location=' + coordinates[1] + ',' + coordinates[0] + '&title=' + address + '&content=' + address + '&output=html&src=webapp.baidu.openAPIdemo';
	}
	window.location.href = url;
}

//百度坐标转高德（传入经度、纬度）
function bd_decrypt(bd_lng, bd_lat) {
	var X_PI = Math.PI * 3000.0 / 180.0;
	var x = bd_lng - 0.0065;
	var y = bd_lat - 0.006;
	var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI);
	var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI);
	var gg_lng = z * Math.cos(theta);
	var gg_lat = z * Math.sin(theta);
	return {
		lng: gg_lng,
		lat: gg_lat
	}
}
//高德坐标转百度（传入经度、纬度）
function bd_encrypt(gg_lng, gg_lat) {
	var X_PI = Math.PI * 3000.0 / 180.0;
	var x = gg_lng,
		y = gg_lat;
	var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * X_PI);
	var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * X_PI);
	var bd_lng = z * Math.cos(theta) + 0.0065;
	var bd_lat = z * Math.sin(theta) + 0.006;
	return {
		bd_lat: bd_lat,
		bd_lng: bd_lng
	};
}

/**
 * 打开高德地图
 */
function openAMap(address, coordinates) {
	var bd_decrypt_coordinates = bd_decrypt(coordinates[0], coordinates[1]);
	var url = '';
	if(mui.os.android) {
		//      url = 'https://uri.amap.com/navigation?from=,,我的位置&to='+bd_decrypt_coordinates.lng+','+bd_decrypt_coordinates.lat+','+address+'&mode=car&policy=1&src=mypage&coordinate=gaode&callnative=0'
		url = 'https://uri.amap.com/marker?position=' + bd_decrypt_coordinates.lng + ',' + bd_decrypt_coordinates.lat + '&name=' + address + '&src=mypage&coordinate=gaode&callnative=0';
	}
	if(mui.os.ios) {
		//      url = 'https://uri.amap.com/navigation?from=,,我的位置&to='+bd_decrypt_coordinates.lng+','+bd_decrypt_coordinates.lat+','+address+'&mode=car&policy=1&src=mypage&coordinate=gaode&callnative=0'
		url = 'https://uri.amap.com/marker?position=' + bd_decrypt_coordinates.lng + ',' + bd_decrypt_coordinates.lat + '&name=' + address + '&src=mypage&coordinate=gaode&callnative=0';
	}
	window.location.href = url;
}

function backToPage(pageid) {
	var wvs = plus.webview.all(); //所有窗口对象
	var launch = plus.webview.getLaunchWebview(); //首页窗口对象
	var self = plus.webview.currentWebview(); //当前窗口对象
	for(var i = 0, len = wvs.length; i < len; i++) {
		// 首页以及当前窗口对象，不关闭；
		if(wvs[i].id === launch.id ||
			wvs[i].id === self.id ||
			wvs[i].id.iStartsWith('project') ||
			wvs[i].id == pageid) {
			continue;
		} else {
			wvs[i].close('none'); //关闭中间的窗口对象，为防止闪屏，不使用动画效果；
		}
	}

	self.close('slide-out-right');
}

function dismissToPage(pageid) {
	var wvs = plus.webview.all(); //所有窗口对象
	var launch = plus.webview.getLaunchWebview(); //首页窗口对象
	var self = plus.webview.currentWebview(); //当前窗口对象
	for(var i = 0, len = wvs.length; i < len; i++) {
		// 首页以及当前窗口对象，不关闭；
		if(wvs[i].id === launch.id ||
			wvs[i].id === self.id ||
			wvs[i].id.iStartsWith('project') ||
			wvs[i].id == pageid) {
			continue;
		} else {
			wvs[i].close('none'); //关闭中间的窗口对象，为防止闪屏，不使用动画效果；
		}
	}
	self.close('slide-out-bottom');
}

/**
 * 
 * 当用户新发生改变的时候 需要执行这个函数
 * @param {Object} oper登录信号发生改变的上一级界面
 */
function handleUserInfoChangedSignal(oper) {
	console.log('handleUserInfoChangedSignal');
	var wvs = plus.webview.all(); //所有窗口对象
	var launch = plus.webview.getLaunchWebview(); //首页窗口对象
	var self = plus.webview.currentWebview(); //当前窗口对象
	for(var i = 0, len = wvs.length; i < len; i++) {
		if(wvs[i].id === launch.id || wvs[i].id === self.id) {
			continue;
		} else {
			console.log(wvs[i].id);
			mui.fire(wvs[i], 'bj_signal_useinfochanged');
		}
	}
}

function backToHomePage() {
	var wvs = plus.webview.all(); //所有窗口对象
	var launch = plus.webview.getLaunchWebview(); //首页窗口对象
	var self = plus.webview.currentWebview(); //当前窗口对象
	for(var i = 0, len = wvs.length; i < len; i++) {
		//console.log(wvs[i].id);
		wflog(wvs[i])
		// 首页以及当前窗口对象，不关闭；
		if((wvs[i].id) && (wvs[i].id === launch.id || wvs[i].id === self.id || wvs[i].id.iStartsWith('project'))) {
			continue;
		} else {
			wvs[i].close('none'); //关闭中间的窗口对象，为防止闪屏，不使用动画效果；
		}
	}
	// 此时，窗口对象只剩下首页以及当前窗口，直接关闭当前窗口即可；

	mui.fire(launch, 'back_to_homepage', {

	});
	self.close('slide-out-right');
}

function pushToWebController(path, title, autoShow, waitingtitle) {
	var components = path.split('/');
	var id = components[components.length - 1];
	mui.openWindow({
		url: bj_webpath + path,
		id: id,
		styles: { // 窗口参数 参考5+规范中的WebviewStyle,也就是说WebviewStyle下的参数都可以在此设置
			titleNView: { // 窗口的标题栏控件
				autoBackButton: true,
				titleText: title, // 标题栏文字,当不设置此属性时，默认加载当前页面的标题，并自动更新页面的标题
				titleColor: "#ffffff", // 字体颜色,颜色值格式为"#RRGGBB",默认值为"#000000"
				titleSize: "17px", // 字体大小,默认17px
				backgroundColor: "#009BFD", // 控件背景颜色,颜色值格式为"#RRGGBB",默认值为"#F7F7F7"
			}
		},
		waiting: {
			autoShow: false, //自动显示等待框，默认为true
			title: '', //等待对话框上显示的提示内容
		}
	});
}

function pushToLocalUrlController(weburl, title, extras) {
	extras.weburl = weburl;
	extras.title = title;
	var components = weburl.split('/');
	var id = components[components.length - 1];
	console.log('assas======asa');

	if(mui.os.android) {
		console.log('assasasa');
		mui.openWindow({
			url: '../app/bjlocalwebview_android.html',
			id: components,
			styles: { // 窗口参数 参考5+规范中的WebviewStyle,也就是说WebviewStyle下的参数都可以在此设置

			},
			extras: extras
		});
	} else {
		mui.openWindow({
			url: '../app/bjlocalwebview.html',
			id: components,
			styles: { // 窗口参数 参考5+规范中的WebviewStyle,也就是说WebviewStyle下的参数都可以在此设置

			},
			extras: extras
		});
	}

}

function pushToUrlController(weburl, title) {
	wflog(weburl);
	window.location.href = weburl;
	return false;
	var components = weburl.split('/');
	var id = components[components.length - 1];
	if(mui.os.android) {
		mui.openWindow({
			url: '../app/bjwebview_android.html',
			id: id,
			styles: { // 窗口参数 参考5+规范中的WebviewStyle,也就是说WebviewStyle下的参数都可以在此设置

			},
			extras: {
				weburl: weburl,
				title: title
			}
		});
	} else {
		mui.openWindow({
			url: '../app/bjwebview.html',
			id: id,
			styles: { // 窗口参数 参考5+规范中的WebviewStyle,也就是说WebviewStyle下的参数都可以在此设置

			},
			extras: {
				weburl: weburl,
				title: title
			}
		});
	}
}

/**
 * @param {Object} path
 * @param {Object} title
 * @param {Object} extras
 * @param {Object} animationType
 * @param {Object} autoShow
 * @param {Object} waitingtitle
 * @param {Object} viewAutoShow
 * @param {Object} createNew
 */
function pushToController(path, title, extras, animationType, autoShow, waitingtitle, viewAutoShow, createNew) {
	if(!path) {
		return;
	}
	title = title || '未设置标题';
	extras = extras || {};
	animationType = animationType || 'slide-in-right';
	autoShow = autoShow || false;
	waitingtitle = waitingtitle || '正在加载..';
	viewAutoShow = viewAutoShow || true;
	createNew = createNew || false;
	var components = path.split('/');
	var id = components[components.length - 1];
	mui.openWindow({
		url: bj_webpath + path,
		id: id,
		styles: {
			titleNView: { // 窗口的标题栏控件
				autoBackButton: true,
				titleText: title, // 标题栏文字,当不设置此属性时，默认加载当前页面的标题，并自动更新页面的标题
				titleColor: "#ffffff", // 字体颜色,颜色值格式为"#RRGGBB",默认值为"#000000"
				titleSize: "18px", // 字体大小,默认17px
				backgroundColor: "#009BFD", // 控件背景颜色,颜色值格式为"#RRGGBB",默认值为"#F7F7F7"
			}
		},
		extras: extras,
		createNew: false, //是否重复创建同样id的webview，默认为false:不重复创建，直接显示
		show: {
			autoShow: viewAutoShow, //页面loaded事件发生后自动显示，默认为true
			aniShow: animationType, //页面显示动画，默认为”slide-in-right“；
		},
		waiting: {
			autoShow: autoShow, //自动显示等待框，默认为true
			title: waitingtitle, //等待对话框上显示的提示内容
		}
	})
}
//function pushToHUDController(path, title, extras = {}, waitingtitle = '正在加载...') {

function pushToHUDController(path, title, extras, waitingtitle) {
	if(!path) {
		return;
	}
	title = title || '未设置标题';
	extras = extras || {};
	waitingtitle = waitingtitle || '正在加载...';

	pushToController(path, title, extras, 'slide-in-right', true, waitingtitle);
}

//function presentToController(path, title, extras) {

function presentToController(path, title, extras) {
	if(!path) {
		return;
	}
	title = title || '未设置标题';
	extras = extras || {};
	pushToController(path, title, extras, 'slide-in-bottom', false);
}

//function pushToExtrasController(path, title, extras = {}) {

function pushToExtrasController(path, title, extras) {
	if(!path) {
		return;
	}
	title = title || '未设置标题';
	extras = extras || {};
	pushToController(path, title, extras, 'slide-in-right', false);
}
var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|17[0-9]{1}|(18[0-9]{1})|(19[0-9]{1}))+\d{8})$/;

function isMobile(phone) {
	return myreg.test(phone);
}

// 拼接url参数
function buildQueryString(baseUrl, obj) {
	baseUrl = baseUrl || '';
	return Bee.UrlUtils.objToUrl(baseUrl, obj);
}

// 获取url参数
function getQueryString(url) {
	url = url || window.location.href;
	return Bee.UrlUtils.parseQueryString(window.location.href);
}

// 获取openid
function getOpenid(queryScope, currentUrl) {
	var oauthUrl = 'https://wxpay.xiaoxiangxjz.com/OAuthWeixin.php';
	queryScope = queryScope || 'snsapi_base';
	currentUrl = currentUrl || encodeURIComponent(location.href);
	var queryString = getQueryString();
	if(!queryString.openid) {
		var openid = sessionStorage.getItem('openid');
		if(openid) {
			return openid;
		}
		location.replace(oauthUrl + '?&callBack=' + currentUrl + '&scope=' + queryScope);
	} else {
		sessionStorage.setItem('openid', queryString.openid);
		return queryString.openid;
	}
}
$(function() {
	mui.back = function() {
		if(location.href == document.referrer || !document.referrer) {
			window.location.replace(bj_web_root + '/index.html');
		}
		window.location.replace(document.referrer);
	}
})
/**
 * //去支付 1-微信，2-支付宝
 * @param {Object} session
 * @param {Object} order_sn
 * @param {Object} pays
 * @param {Object} msg
 * @param {Object} returnUrl
 * @param {Object} that
 */
function pay(session, order_sn, pays, msg, returnUrl, that) {
	msg = msg || '预约成功';
	returnUrl = returnUrl || location.origin + bj_web_root + '/index.html';
	that = that || document.getElementById('payBtn');
	var param = {
		'token': session.token(),
		'orderSn': order_sn,
		'payment': payCode,
		'openid': openid,
		'tradeType': 'JSAPI',
		'returnUrl': returnUrl
	};

	//type 0 一般出现的原因 场馆价格为0 无法吊起微信支付 直接内部支付通过
	//type 1 支付正常
	mui(that).button('loading');
	bjpost('/Order/orderPay.html', param, function(responseData) {
		sessionStorage.removeItem('calendar');
		//wflog(responseData);
		mui(that).button('reset');
		if(responseData.type == 0) {
			mui.toast(msg);
			mui.later(function() {
				window.location.href = returnUrl;
			}, 500);
		} else {
			if(selected_payway == 'cmbpay') {
				var jsonRequestData = document.getElementById("jsonRequestData");
				jsonRequestData.value = JSON.stringify(responseData.paystr.payJson);
				document.forms.myFrom.action = responseData.paystr.actionUrl;
				document.forms.myFrom.submit();
			} else {
				// 微信支付
				responseData.paystr = $.parseJSON(responseData.paystr);
				if(typeof WeixinJSBridge == "undefined") {
					if(document.addEventListener) {
						document.addEventListener('WeixinJSBridgeReady', function() {
							onBridgeReady(responseData.paystr, msg, returnUrl);
						}, false);
					} else if(document.attachEvent) {
						document.attachEvent('WeixinJSBridgeReady', function() {
							onBridgeReady(responseData.paystr, msg, returnUrl);
						});
						document.attachEvent('onWeixinJSBridgeReady', function() {
							onBridgeReady(responseData.paystr, msg, returnUrl);
						});
					}
				} else {
					onBridgeReady(responseData.paystr, msg, returnUrl);
				}
			}
		}
	}, function(error) {
		mui.toast(error);
		mui(that).button('reset');
	})
}
// 调起微信支付
function onBridgeReady(paystr, msg, returnUrl) {
	WeixinJSBridge.invoke('getBrandWCPayRequest', paystr, function(res) {
		if(res.err_msg == "get_brand_wcpay_request:ok") {
			// 使用以上方式判断前端返回,微信团队郑重提示：
			//res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
			mui.toast(msg);
			mui.later(function() {
				window.location.href = returnUrl;
			}, 500);
		} else {
			mui.toast('支付失败');
		}
	});
}