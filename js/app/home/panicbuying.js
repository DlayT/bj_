 mui.ready(function () {
   	require(['session'], function(session) {
		var param = {
			token: session.token()
		}
		wflog(param);
		bjpost('/Promotion/specialSaleList.html', param, function(responseData) {
			initPanicBuyings(responseData);
		}, function(error) {
			mui.toast(error);
		});
	});

	mui('#panicbuyingview').on('tap', '.activity-content-img', function() {
		var panicbuyingDetail = JSON.parse($(this).parents('.mui-table-view-cell').attr('id'));
		var path = Bee.UrlUtils.objToUrl('/home/panicbuying-detail.html',panicbuyingDetail);
		pushToExtrasController(path, '抢购');
	});

	mui('#panicbuyingview').on('tap', '.buyBtn', function() {
		var panic = JSON.parse($(this).parents('.mui-table-view-cell').attr('id'));
		pushToExtrasController('/home/panicbuyingorder.html', '填写订单', panic);
	});
   })

function initPanicBuyings(panicbuyings) {
	var items = new Array();
	$.each(panicbuyings, function(index, value) {
		var item = {
			panicbuyingId: value.id,
			imgpath: createImgPath(value.thumb),
			title: value.title,
			goods_id: value.goods_id,
			goods_type: value.goods_type,
			price: value.price, //优惠价
			goods_num: value.goods_num,
			buy_limit: value.buy_limit,
			start_time: value.start_time,
			end_time: value.end_time,
			is_end: value.is_end,
			prom_type: value.prom_type,
			status: value.status,
			goods_price: value.goods_price //原价
		};
		items.push(item);
	});
	var panicbuyinglist = template('tmp_panicbuyinglist', {
		'result': items
	});
	$("#panicbuyingview").html(panicbuyinglist);
}