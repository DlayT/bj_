var card_detail_view = null; //详情页webview
var titleNView = { // 窗口的标题栏控件
	autoBackButton: true,
	titleText: '年卡详情', // 标题栏文字,当不设置此属性时，默认加载当前页面的标题，并自动更新页面的标题
	titleColor: "#ffffff", // 字体颜色,颜色值格式为"#RRGGBB",默认值为"#000000"
	titleSize: "17px", // 字体大小,默认17px
	backgroundColor: "#009BFD", // 控件背景颜色,颜色值格式为"#RRGGBB",默认值为"#F7F7F7"
}

mui.plusReady(function() {
	card_detail_view = mui.preload({
		url: '../activity/card.detail.html',
		id: 'card.detail.html',
		styles: {
			"render": "always",
			"popGesture": "hide",
			"bounce": "vertical",
			"bounceBackground": "#efeff4",
			"titleNView": titleNView
		}
	});
})

//预加载详情页

//console.log(card_detail_view)

function pushToDetail(item) {
	mui.fire(card_detail_view, 'get_detail', {
		title: '详情',
		id: '123'
	});

	//更改详情页原生导航条信息
	card_detail_view.setStyle({
		"titleNView": titleNView
	});
	setTimeout(function() {
		card_detail_view.show("slide-in-right", 300);
	}, 150);
}

var card_detail_view = null; //详情页webview
var titleNView = { // 窗口的标题栏控件
	autoBackButton: true,
	titleText: '年卡详情', // 标题栏文字,当不设置此属性时，默认加载当前页面的标题，并自动更新页面的标题
	titleColor: "#ffffff", // 字体颜色,颜色值格式为"#RRGGBB",默认值为"#000000"
	titleSize: "17px", // 字体大小,默认17px
	backgroundColor: "#009BFD", // 控件背景颜色,颜色值格式为"#RRGGBB",默认值为"#F7F7F7"
}

mui.plusReady(function() {
	card_detail_view = mui.preload({
		url: '../activity/card.detail.html',
		id: 'card.detail.html',
		styles: {
			"render": "always",
			"popGesture": "hide",
			"bounce": "vertical",
			"bounceBackground": "#efeff4",
			"titleNView": titleNView
		}
	});
})

function initCards(cards) {
	var items = new Array();
	$.each(cards, function(index, value) {
		var item = {
			card_id: value.card_id,
			imgpath: createImgPath(value.thumb),
			name: value.name,
			instr: value.instr,
			original_price: value.original_price, //原价
			price: value.price, //年卡价格
			member_price: value.member_price, //会员价
		};
		items.push(item);
	});
	var mycards = template('tmp_cards', {
		'result': items
	});
	$("#mycards").html(mycards);
	hideLoading();
}

//预加载详情页
function loadPageData(session) {
	var param = {
		'token': session.token(),
	};
	wflog(param)
	bjcpost('/User/userCardList.html',param, function(cards) {
		if( cards && cards.length == 0) {
			showEmpty();
			return;
		}
		initCards(cards);
	})
}

require(['session'], function(session) {
	showLoading();
	loadPageData(session)
})

function pushToDetail(item) {
	mui.fire(card_detail_view, 'get_detail', {
		title: '详情',
		id: '123'
	});

	//更改详情页原生导航条信息
	card_detail_view.setStyle({
		"titleNView": titleNView
	});
	setTimeout(function() {
		card_detail_view.show("slide-in-right", 300);
	}, 150);
}

mui(".mui-table-view").on('tap', '.mui-table-view-cell', function() {
	console.log('我被点击了');

	//获取id
	var id = this.getAttribute("id");

	pushToDetail();
})

function jumpToCardDetail(id) {
	mui.openWindow({
		url: '../card/carddetail.html?id='+id,
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
}