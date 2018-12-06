var refundContent = {};
var price;
var total;

(function() {
	//	var web = plus.webview.currentWebview();
	var web = JSON.parse(sessionStorage.getItem('order_msg'));
	$('#venue_name').html(web.name);
	if(web.package_id > 0) {
		$('#refundPartView').hide();
	}
	// 设置退款最大数量
	$('.mui-numbox').attr('data-numbox-max', web.quantity-1);
	require(['session'], function(session) {

		loadPageData(session, web.order_sn);

		$('body').on('tap', '.refund-all', function() {
			refundContent.name = web.name;
			refundContent.type = 1;
			refundContent.total = total;
			//注册session
			sessionStorage.setItem('refundContent', JSON.stringify(refundContent));
			pushToExtrasController('/order/order.refund.index.html', '申请退款', refundContent);
		});

		$('body').on('tap', '.refund-part', function() {
			refundContent.name = web.name;
			refundContent.type = 2;
			var adult = document.getElementById("adult_num").value;
			refundContent.num = adult;
			refundContent.total = Math.round(parseFloat(price * 100 * adult)) / 100;
			//注册session
			sessionStorage.setItem('refundContent', JSON.stringify(refundContent));
			pushToExtrasController('/order/order.refund.index.html', '申请退款', refundContent);
		});

	});

})();

function loadPageData(session, order_sn) {
	var param = {
		token: session.token(),
		orderSn: order_sn
	};
	showLoading();
	bjcpost('/Order/orderRefundInfo.html', param, function(order, error) {
		if(order) {
			if(order.adult_quantity == 0) {
				$('#refundPartView').hide();
			}
			//设置拆单可退最多陪同人数
			mui('.mui-numbox').numbox().setOption('max', order.adult_quantity - 1);
			//计算陪同人单价
			price = order.total / order.adult_quantity;
			refundContent = order;
			total = order.total;
			var html = template('tmp_orderinfo', {
				'result': order
			});
			$('.refund-apply-orderinfo').html(html);
			if(order.info) {
				mui.alert(order.info);
			}
		} else {
		    $("#refundPart").attr('disabled', true).css({'background-color': '#AAA','border': '#AAA solid 1px'});
			mui.alert(error);
		}
		hideLoading();
	});
}