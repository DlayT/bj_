//console.log('加载首页')
var currentDownHeight = 0;
var homeScroll = new MeScroll("home", {
	down: {
		auto: false,
		callback: homePulldownRefresh,
	},
});

//获取open_id
if (mui.os.wechat) {
	getOpenid();
}

function homePulldownRefresh() {
	require(['session'], function(session) {
		loadHomePageData(session);
	})
}

function loadHomePageData(session, complete) {
	isLogin = session.islogin();
	var param = {
		token: session.token()
	}
	bjcpost('/Index/index.html', param, function(responseData, error) {
		hideLoading();
		homeScroll.endSuccess();
		if(responseData) {
			var banners = responseData.bannerList;
			var categorys = responseData.cateList;
			initBanner(banners);
			initCateList(categorys);
			initCards(responseData.cardList);
			inithotplacelist(responseData.venueList);
		}

		if(complete) {
			complete();
		}
	})
}

if(!mui.os.plus) {
	require(['session'], function(session) {
		showLoading();
		loadHomePageData(session);
	})
}

function jumpToHomeweb(v) {
	var item = JSON.parse(v);
	pushToUrlController(item.imgurl, item.title);
}

$('#searchView').on('click', function() {
	mui.openWindow('home.search.html', 'id', {});
});

function initBanner(banners) {
	var slider_items = new Array();
	$.each(banners, function(index, value) {
		var item = {
			imgpath: createImgPath(value.thumb),
			imgurl: value.url,
			title: value.title,
		};
		slider_items.push(item);
	});

	var slider = template('tmp_slider', {
		'result': slider_items
	});
	$("#slider").html(slider);
	var slider = mui("#slider");
	slider.slider({
		interval: 5000
	});
}

function initCards(cards) {
	if(cards.length == 0) {
		return;
	}
	var items = new Array();
	$.each(cards, function(index, value) {
		var item = {
			id: value.id,
			imgpath: createImgPath(value.thumb),
			name: value.name,
			original_price: value.original_price, //原价
			price: value.price, //年卡价格
			member_price: value.member_price, //会员价
			is_buy: value.is_buy
		};
		items.push(item);
	});
	var cards = template('tmp_cards', {
		'result': items
	});
	$("#cards").html(cards);
}

/**
 * 类型，0-原生，1-网页
 * @param {Object} categorys
 */
function initCateList(categorys) {
	var module = template('tmp_category', {
		'result': categorys
	});
	$("#module").html(module);
}

function inithotplacelist(places) {
	var slider_items = new Array();
	$.each(places, function(index, value) {
		var item = {
			venueId: value.id,
			imgpath: createImgPath(value.thumb),
			title: value.name,
			price: value.price,
			original_price: value.original_price,
			member_price: value.member_price,
			cate_id: value.cate_id,
			address: value.address,
			cost: value.cost,
			num: value.num,
			start_time: value.start_time,
			end_time: value.end_time,
			address: value.address,
			coordinate: value.coordinate,
			reminder_quantity: value.reminder_quantity,
			is_buy: value.is_buy //有没有预约这个场馆
		};
		slider_items.push(item);
	});

	var hotplacelist = template('tmp_hotplacelist', {
		'result': slider_items
	});
	$("#hotplacelist").html(hotplacelist);
}

function inithotactivitylist(activities) {
	var slider_items = new Array();
	$.each(activities, function(index, value) {
		var item = {
			venueId: value.id,
			imgpath: createImgPath(value.thumb),
			title: value.name,
			price: value.price,
			original_price: value.original_price,
			member_price: value.member_price,
			cate_id: value.cate_id,
			address: value.address,
			cost: value.cost,
			num: value.num,
			need_receiving: value.need_receiving,
			reward_integral: value.reward_integral,
			status: value.status,
		};
		slider_items.push(item);
	});
	var hotactivitylist = template('tmp_hotactivitylist', {
		'result': slider_items
	});
	$("#hotactivitylist").html(hotactivitylist);
}

window.addEventListener('bj_logout', function(event) {
	var signal = event.detail;
	require(['session'], function(session) {
		loadHomePageData(session);
	})
})

window.addEventListener('bj_signal_useinfochanged', function(event) {
	require(['session'], function(session) {
		loadHomePageData(session);
	})
})



//mui(".mui-table-view").on('tap', '.mui-table-view-cell', function() {
//	var id = this.getAttribute("id");
//	var title = $(this).find('span').eq(0).html();
//	mui.openWindow({
//		url: 'sub.activity.html',
//		id: 'sub.activity.html',
//		styles: { // 窗口参数 参考5+规范中的WebviewStyle,也就是说WebviewStyle下的参数都可以在此设置
//			titleNView: { // 窗口的标题栏控件
//				autoBackButton: true,
//				titleText: title, // 标题栏文字,当不设置此属性时，默认加载当前页面的标题，并自动更新页面的标题
//				titleColor: "#000000", // 字体颜色,颜色值格式为"#RRGGBB",默认值为"#000000"
//				titleSize: "17px", // 字体大小,默认17px
//				backgroundColor: "#ffffff", // 控件背景颜色,颜色值格式为"#RRGGBB",默认值为"#F7F7F7"
//			}
//		}
//	});
//});

//mui.back = function() {
//	plus.webview.close('id', 'slide-out-right');
//}

/**
 * ，0-原生  ，1-网页 2、
 * @param {Object} cate
 */
function toActivityList(cate) {
//	wflog(cate);
//	return;
	if(cate.type == 0) {
		pushToController('/home/activityreview.html', '活动回顾');
	} else if(cate.type == 2) { //跳转到金鹰小记者
		pushToExtrasController('/activity/activity.xjz.index.html', cate.name, {
			haveNew: cate.have_new
		});
		return;
	} else {
		if(cate.url.length == 0) { //没有设置url 只可能是秒杀 或者是抢购
			if(cate.id == 3) {//秒杀
				if(isLogin) {
					pushToExtrasController('/home/seckill.html', '秒杀', {
						haveNew: cate.have_new
					});
				} else {
					pushToWebController('/login/login.html', '登录');
				}

			} else {
				if(isLogin) {
					pushToWebController('/home/panicbuying.html', '特价抢购');
				} else {
					pushToWebController('/login/login.html', '登录');
				}

			}
		} else {
			pushToUrlController(cate.url, cate.name);
		}

	}
}

/**
 * 场馆介绍
 */
var isLogin;

function venueDetail(venue) {
	var venueinfo_url = bj_webpath + '/vunue/vunueinfo.html?id=' + venue.venueId;
	mui.openWindow({
		url: venueinfo_url,
		id: 'vunueinfo.html',
		styles: { // 窗口参数 参考5+规范中的WebviewStyle,也就是说WebviewStyle下的参数都可以在此设置
			titleNView: { // 窗口的标题栏控件
				autoBackButton: true,
				titleText: '场馆介绍', // 标题栏文字,当不设置此属性时，默认加载当前页面的标题，并自动更新页面的标题
				titleColor: "#ffffff", // 字体颜色,颜色值格式为"#RRGGBB",默认值为"#000000"
				titleSize: "17px", // 字体大小,默认17px
				backgroundColor: "#009BFD", // 控件背景颜色,颜色值格式为"#RRGGBB",默认值为"#F7F7F7"
			}
		},
		extras: venue
	});
}

mui("#hotplacelist").on('tap', '.mui-table-view-cell', function() {
	var venue = JSON.parse(this.getAttribute("id"));
	venueDetail(venue);
});

////语音识别完成事件
//document.getElementById("search").addEventListener('recognized', function(e) {
//	console.log(e.detail.value);
//});

var nativeWebview, imm, InputMethodManager;
var initNativeObjects = function() {
	if(mui.os.android) {
		var main = plus.android.runtimeMainActivity();
		var Context = plus.android.importClass("android.content.Context");
		InputMethodManager = plus.android.importClass("android.view.inputmethod.InputMethodManager");
		imm = main.getSystemService(Context.INPUT_METHOD_SERVICE);
	} else {
		nativeWebview = plus.webview.currentWebview().nativeInstanceObject();
	}
};
var showSoftInput = function() {
	if(mui.os.android) {
		imm.toggleSoftInput(0, InputMethodManager.SHOW_FORCED);
	} else {
		nativeWebview.plusCallMethod({
			"setKeyboardDisplayRequiresUserAction": false
		});
	}
	setTimeout(function() {
		var inputElem = document.querySelector('input');
		inputElem.focus();
		inputElem.parentNode.classList.add('mui-active'); //第一个是search，加上激活样式
	}, 200);
};

//
//require(['session'], function(session) {
//	document.getElementById("myMessage").addEventListener('tap', function() {
//		if(session.islogin()) {
//			mui.openWindow({
//				url: '../user/user.message.html',
//				id: 'user.message.html',
//				styles: { // 窗口参数 参考5+规范中的WebviewStyle,也就是说WebviewStyle下的参数都可以在此设置
//					titleNView: { // 窗口的标题栏控件
//						autoBackButton: true,
//						titleText: '我的消息', // 标题栏文字,当不设置此属性时，默认加载当前页面的标题，并自动更新页面的标题
//						titleColor: "#ffffff", // 字体颜色,颜色值格式为"#RRGGBB",默认值为"#000000"
//						titleSize: "17px", // 字体大小,默认17px
//						backgroundColor: "#009BFD", // 控件背景颜色,颜色值格式为"#RRGGBB",默认值为"#F7F7F7"
//						progress: { // 标题栏控件的进度条样式
//							color: "#00FF00", // 进度条颜色,默认值为"#00FF00"  
//							height: "1px" // 进度条高度,默认值为"2px"         
//						},
//						splitLine: { // 标题栏控件的底部分割线，类似borderBottom
//							color: "#CCCCCC", // 分割线颜色,默认值为"#CCCCCC"  
//							height: "1px" // 分割线高度,默认值为"2px"
//						}
//					}
//				}
//			});
//		} else {
//			mui.openWindow({
//				url: '../login/login.html',
//				id: 'login.html',
//				styles: { // 窗口参数 参考5+规范中的WebviewStyle,也就是说WebviewStyle下的参数都可以在此设置
//					titleNView: { // 窗口的标题栏控件
//						autoBackButton: true,
//						titleText: '登录', // 标题栏文字,当不设置此属性时，默认加载当前页面的标题，并自动更新页面的标题
//						titleColor: "#ffffff", // 字体颜色,颜色值格式为"#RRGGBB",默认值为"#000000"
//						titleSize: "17px", // 字体大小,默认17px
//						backgroundColor: "#009BFD", // 控件背景颜色,颜色值格式为"#RRGGBB",默认值为"#F7F7F7"
//					}
//				}
//			});
//		}
//	})
//})