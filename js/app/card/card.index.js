//定义路径常量
var CARDPATH='/project/';

var mescroll = new MeScroll("card", { //第一个参数"mescroll"对应上面布局结构div的id
	//如果您的下拉刷新是重置列表数据,那么down完全可以不用配置,具体用法参考第一个基础案例
	//解析: down.callback默认调用mescroll.resetUpScroll(),而resetUpScroll会将page.num=1,再触发up.callback
	down: {
		auto: false,
		callback: cardPulldownRefresh //下拉刷新的回调,别写成downCallback(),多了括号就自动执行方法了
	},
});
function cardPulldownRefresh() {
	//因为跳转需要web 需要用到plus 所以用这个
	require(['session'], function(session) {
		loadCardPageData(session);
	})
}

function jumpToweb(v) {
	var item = JSON.parse(v);
	pushToUrlController(item.imgurl, item.title);
}

function jumpToCardDetail(id, isBuy) {
	if(isBuy == 1) {
		//		console.log('已购');
		mui.openWindow({
			url:  CARDPATH+'card/carddetail.html?id'+id,
			id: 'carddetail.html',
			styles: { // 窗口参数 参考5+规范中的WebviewStyle,也就是说WebviewStyle下的参数都可以在此设置
				titleNView: { // 窗口的标题栏控件
					autoBackButton: true,
					titleText: '查看明细', // 标题栏文字,当不设置此属性时，默认加载当前页面的标题，并自动更新页面的标题
					titleColor: "#ffffff", // 字体颜色,颜色值格式为"#RRGGBB",默认值为"#000000"
					titleSize: "17px", // 字体大小,默认17px
					backgroundColor: "#009BFD", // 控件背景颜色,颜色值格式为"#RRGGBB",默认值为"#F7F7F7"
				}
			},
			extras: {
				cardId: id
			}
		});
	} else {
		//		console.log('未购');
		mui.openWindow({
			url: '../card/carddetail_nopay.html',
			id: 'carddetail_nopay.html',
			styles: { // 窗口参数 参考5+规范中的WebviewStyle,也就是说WebviewStyle下的参数都可以在此设置
				titleNView: { // 窗口的标题栏控件
					autoBackButton: true,
					titleText: '查看明细', // 标题栏文字,当不设置此属性时，默认加载当前页面的标题，并自动更新页面的标题
					titleColor: "#ffffff", // 字体颜色,颜色值格式为"#RRGGBB",默认值为"#000000"
					titleSize: "17px", // 字体大小,默认17px
					backgroundColor: "#009BFD", // 控件背景颜色,颜色值格式为"#RRGGBB",默认值为"#F7F7F7"
				}
			},
			extras: {
				cardId: id
			}
		});
	}

}

//百纪卡查看明细

mui('#cards,#card_cards').on('tap', '.mui-table-view-cell', function() {
	var id = $(this).attr('id');
	var card = JSON.parse(id);
	var cardinfo = {
		cardId: card.id
	}
	
	if(parseInt(card.is_buy) == 1) {
		pushToExtrasController('/card/carddetail.html?id='+cardinfo.cardId, '查看明细', cardinfo);
	} else {
		pushToExtrasController('/card/carddetail_nopay.html?id='+cardinfo.cardId, '查看明细', cardinfo);
	}
});

//百纪卡在线购卡
mui('#cards,#card_cards').on('tap', '.card-option-view-left', function() {
	var id = $(this).attr('id');
	var card = JSON.parse(id);
	var cardinfo = {
		cardId: card.id
	}

	require(['session'], function(session) {
		if(session.islogin()) {
    		if(parseInt(card.is_buy) == 1) {
    			pushToExtrasController('/card/carddetail.html?id='+cardinfo.cardId, '查看明细', cardinfo);
    		} else {
    			pushToExtrasController('/card/carddetail_nopay.html?id='+cardinfo.cardId, '查看明细', cardinfo);
    		}
		} else {
			pushToWebController('/login/login.html', '登录');
		}
	})

	var oEvent = event;
	oEvent.stopPropagation();
});
//百纪卡激活卡
mui('#cards,#card_cards').on('tap', '.card-option-view-right', function() {
	var id = $(this).attr('id');
	var card = JSON.parse(id);
	
	require(['session'], function(session) {
		if(session.islogin()) {
			pushToWebController('/user/user.bindcard.html', '登录');
		} else {
			pushToWebController('/login/login.html', '登录');
		}
	})

	var oEvent = event;
	oEvent.stopPropagation();
});
function createBanner(banners) {
	var slider_items = new Array();
	$.each(banners, function(index, value) {
		var item = {
			imgpath: createImgPath(value.thumb),
			imgurl: value.url,
		};
		slider_items.push(item);
	});
	var slider = template('tmp_card_slider', {
		'result': slider_items
	});
	$("#card_slider").html(slider);
	var slider = mui("#card_slider");
	slider.slider({
		interval: 5000
	});
}

//创建卡片
function createCards(cards) {
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
	var cards = template('tmp_card_cards', {
		'result': items
	});
	$("#card_cards").html(cards);
}

function loadCardPageData(session) {
	var param = {
		'token': session.token(),
	}
	bjpost('/Card/index.html', param, function(responseData) {
		var banners = responseData.bannerList;
		var cardList = responseData.cardList;
		createBanner(banners);
		createCards(cardList);
		mescroll.endSuccess();
	}, function(error) {
		mescroll.endSuccess();
		mui.toast(error)
	})
}

require(['session'], function(session) {
	loadCardPageData(session);
	$("#cardBtn").on('click', function() {
		if(!session.islogin()) { //如果没有登录
			presentToController('../login/login.html','登录');
		} else {
			pushToWebController('../user/user.card.html', '我的卡包');
		}
	})
})

window.addEventListener('bj_logout', function(event) {
	console.log('年卡页面接收事件1');
	var signal = event.detail;
	require(['session'], function(session) {
		loadCardPageData(session);
	})
})

window.addEventListener('bj_signal_useinfochanged', function(event) {
	console.log('年卡页面接收事件2');
	require(['session'], function(session) {
		loadHomePageData(session);
	})
})