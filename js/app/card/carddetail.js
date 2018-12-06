//mui.plusReady(function() {
//	var web = plus.webview.currentWebview();
//	var cardId = web.cardId;
//	require(['session'], function(session) {
//		var param =  {
//			'token': session.token(),
//			'cardId': cardId
//		}
//		wflog(param);
//		bjpost('/Card/cardDetail.html',param, function(responseData) {
//			var venues = responseData.cateList;
//			initVenueDetail(venues);
//		}, function(error) {
//			mui.toast(error);
//		})
//
//	})
//	$('#cardIntro').on('click', function() {
//		pushToExtrasController('card-intro.html', '此卡说明', {
//			'cardId': cardId
//		});
//	})
//});
(function() {
	var card = getQueryString();
	require(['session'], function(session) {
		var param = {
			'token': session.token(),
			'cardId': card.id
		}
		wflog(param);
		bjpost('/Card/cardDetail.html', param, function(responseData) {
			var venues = responseData.cateList;
			initVenueDetail(venues);
		}, function(error) {
			mui.toast(error);
		})

	})
	$('#cardIntro').on('click', function() {
		pushToExtrasController('/card/card-intro.html?id='+card.id, '此卡说明', {
			'cardId': card.id
		});
	})
})();
/**
 * 年卡说明
 */
function jumpToweb() {
	pushToUrlController('../app/cardintro.html', '此卡说明');
}

function initVenueDetail(venue) {
	var items = new Array();
	$.each(venue, function(index, value) {
		var childitems = new Array();
		$.each(venue[index].venueList, function(index, value2) {
			var childitem = {
				cardid: value2.card_id,
				venueId: value2.id,
				cate_id: value2.cate_id,
				title: value2.name,
				imgpath: createImgPath(value2.thumb),
				quota: value2.quota,
				reservation_day: value2.reservation_day,
				content: value2.content,
				address: value2.address,
				coordinate: value2.coordinate,
				original_price: value2.original_price,
				price: value2.price,
				member_price: value2.member_price,
				num: value2.num,
				cost: value2.cost,
				type: value2.type,
				open_type: value2.open_type,
				start_time: value2.start_time,
				end_time: value2.end_time,
				status: value2.status,
				note: value2.note,
				is_del: value2.is_del,
				add_time: value2.add_time //有没有预约这个场馆
			};
			childitems.push(childitem);
		});

		var item = {
			cate_id: value.cate_id, //id
			cate_name: value.cate_name, //名称
			venueList: childitems,
		};
		items.push(item);
	});

	var cards = template('tmp_venues', {
		'result': items
	});
	$("#venues").html(cards);
}

/**
 * 场馆介绍
 */
function venueDetail(venue) {
	wflog(venue);
	console.log(venue);
//	var cards = getQueryString();
//	var result = JSON.stringify(venue);
//	//	console.log(result);
//	sessionStorage.setItem('introduce', result);
//	return false;
	mui.openWindow({
		url: '../vunue/vunueinfo.html?id='+venue.venueId,
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