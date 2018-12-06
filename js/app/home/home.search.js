//点击开始搜索
function searchHotKeyword(keyword) {
	console.log(keyword);
	bjpost('/Venue/venueList.html', {
		keyword: keyword
	}, function(place) {
		wflog(place)
		initvenuelist(place);
		//		var html = template('tmp_hotplacelist', {
		//			'result': place
		//		});
		//		$(".mui-content").html(html);
	})
}

function initvenuelist(places) {
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
	$(".mui-content").html(hotplacelist);
}

function getHotKeyword() {
	bjpost('/Search/keywordList.html', {}, function(keywords) {
		var html = template('tmp_hotkeywords', {
			'result': keywords
		});
		$(".mui-content").html(html);
	})
}

/**
 * 点击热词
 * @param {Object} keyword
 */
function clickHotKeyword(keyword) {
	//	plus.nativeUI.showWaiting('搜索中...');	
	searchHotKeyword(keyword.word);
}

mui.ready(function() {
	getHotKeyword();
})

var search = document.getElementById('search');
document.querySelector('form').addEventListener('submit', function(e) {
	e.preventDefault(); // 阻止默认事件
	console.log("go");
});

document.getElementById('search').addEventListener('keydown', function(e) {
	if(e.keyCode == 13) {
		document.activeElement.blur(); //关闭键盘
		searchHotKeyword(search.value);
	}
})

$('#searchBtn').on('click', function() {
	searchHotKeyword(search.value);
});

//暂时不用
//通过监听输入框input事件，可以监听到输入框变化。
search.addEventListener('input', function() {})

//##### 语音识别完成事件
//语音识别完成事件
document.getElementById("search").addEventListener('recognized', function(e) {
	searchHotKeyword(search.value);
});

/**
 * 场馆介绍
 */
function venueDetail(venue) {
	wflog(venue);
	mui.openWindow({
		url: '../vunue/vunueinfo.html',
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