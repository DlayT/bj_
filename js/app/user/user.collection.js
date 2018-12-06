//console.log('我的收藏');
 
/**
 * 加载收藏的数据
 */
function loadData(page) {
	require(['session'], function(session) {
		var param = {
			token: session.token(),
			type: 2,
		};
//		wflog(param);

		bjpost('/User/favoriteList.html', param, function(responseData) {
			var items = new Array();
			$.each(responseData, function(index, value) {
				var item = {
					imgpath: createImgPath(value.icon),
					title: value.name,
				};
				items.push(item);
			});
			var html = template('tmp_collect', {
				'result': items
			});
			$("#list").html(html);
		}, function(error) {
			wflog(error);
		});
	})
}

function add_collect() {
	require(['session'], function(session) {
		var param = {
			token: session.token(),
			type: 2,
			targetId: 1
		};

		wflog(param);
		bjpost('/User/favoriteAdd.html', param, function(responseData) {
			console.log(responseData)
		}, function(error) {
			wflog(error);
		})
	})

}

loadData();

var webview_detail = null; //详情页webview
var titleNView = { //详情页原生导航配置
	autoBackButton: true,
	titleText: '详情', // 标题栏文字,当不设置此属性时，默认加载当前页面的标题，并自动更新页面的标题
	titleColor: "#ffffff", // 字体颜色,颜色值格式为"#RRGGBB",默认值为"#000000"
	titleSize: "17px", // 字体大小,默认17px
	backgroundColor: "#009BFD", // 控件背景颜色,颜色值格式为"#RRGGBB",默认值为"#F7F7F7"
}

//mui初始化，配置下拉刷新
mui.init({
	pullRefresh: {
		container: '#list',
		down: {
			style: 'circle',
			offset: '0px',
			auto: true,
			callback: pulldownRefresh
		},
		up: {
			contentrefresh: '正在加载...',
			callback: pullupRefresh
		}
	}
});

/**
 *  下拉刷新获取最新列表 
 */
function pulldownRefresh() {

	if(window.plus && plus.networkinfo.getCurrentType() === plus.networkinfo.CONNECTION_NONE) {
		plus.nativeUI.toast('似乎已断开与互联网的连接', {
			verticalAlign: 'top'
		});
		return;
	}

	var param = {};
	bjpost('path', param, function(responseData) {
		mui('#list').pullRefresh().endPulldownToRefresh();
	}, function(error) {
		mui('#list').pullRefresh().endPulldownToRefresh();
	})
}

/**
 * 上拉加载拉取历史列表 
 */
function pullupRefresh() {
	//请求历史列表信息流
	var param = {};
	bjpost('path', param, function(responseData) {

		mui('#list').pullRefresh().endPullupToRefresh();
	}, function(error) {
		mui('#list').pullRefresh().endPullupToRefresh();
	})
}

mui.plusReady(function() {
	//预加载详情页
	webview_detail = mui.preload({
		url: 'detail.html',
		id: 'news_detail',
		styles: {
			"render": "always",
			"popGesture": "hide",
			"bounce": "vertical",
			"bounceBackground": "#efeff4",
			"titleNView": titleNView
		}
	});
});

/**
 * 打开详情
 * 
 * @param {Object} item 当前点击的新闻对象
 */
function open_detail(item) {
	//触发子窗口变更新闻详情
	mui.fire(webview_detail, 'get_detail', {
		guid: item.guid,
	});

	//更改详情页原生导航条信息
	titleNView.titleText = item.title;
	webview_detail.setStyle({
		"titleNView": titleNView
	});
	setTimeout(function() {
		webview_detail.show("slide-in-right", 300);
	}, 150);
}