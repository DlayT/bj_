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

function initView(session, cardId) {
	showLoading();
	var param = {
		'token': session.token(),
		'cardId': cardId
	}
	bjcpost('/Card/cardDetail.html', param, function(responseData) {
		document.getElementById('card-price').innerHTML = '总价：<span style="color:#FC1520 ;">￥' + responseData.price + '元';
		var venues = responseData.cateList;
		initVenueDetail(venues);
		hideLoading();
	})
}
/**
 * 年卡说明
 */
function jumpToweb() {
	pushToUrlController('/app/cardintro.html', '此卡说明');
}

/**
 * 场馆介绍
 */
function venueDetail(venue) {
	//注册一个session   
//	var result=JSON.stringify(venue);
//	var cards = getQueryString();
////	console.log(result);
//	sessionStorage.setItem('introduce',result);
    pushToExtrasController('/vunue/venueinfo_2.html?id='+venue.venueId, '场馆详情', {
        'id': venue.venueId
    });
}

(function() {
	var web = getQueryString();
	var cardId = web.id;
	require(['session'], function(session) {
		initView(session, cardId);
		$('#payBtn').on('click', function() {
			if(!session.islogin()) { //如果没有登录
				presentToController('/login/login.html','登录');
				return false;
			} else {
				pushToExtrasController('/card/card.createorder.html?id='+cardId, '去买卡', {
					cardId: cardId
				});
			}
		})
	})
	$('#cardIntro').on('click', function() {
		pushToExtrasController('/card/card-intro.html?id='+cardId, '此卡说明', {
			'cardId': cardId
		});
	})
})();
//mui.plusReady(function() {
//	mui.currentWebview.show();
//	var web = plus.webview.currentWebview();
//	var cardId = web.cardId;
//	require(['session'], function(session) {
//		initView(session, cardId);
//		$('#payBtn').on('click', function() {
//			//			showCreateOrderView(cardId);
//			if(!session.islogin()) { //如果没有登录
//				presentToController('../login/login.html','登录');
//				return false;
//			} else {
//				pushToExtrasController('card.createorder.html', '去买卡', {
//					cardId: cardId
//				});
//			}
//		})
//
//	})
//	$('#cardIntro').on('click', function() {
//		pushToExtrasController('card-intro.html', '此卡说明', {
//			'cardId': cardId
//		});
//	})
//})