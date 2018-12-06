var order_sn;
var adult_num;
//consle.log('111');
//mui.plusReady(function() {
$(function() {
	
    showLoading();
	var web = JSON.parse(sessionStorage.getItem('refundContent'));
	document.getElementById("venue_name").innerHTML = web.name;
	if(web.type == 1) {
		document.getElementById("childNum").innerHTML = web.child_quantity;
		document.getElementById("adultNum").innerHTML = web.adult_quantity;
		document.getElementById("total").innerHTML = web.total;
	} else {
		document.getElementById("childNum").innerHTML = 0;
		document.getElementById("adultNum").innerHTML = web.num;
		document.getElementById("total").innerHTML = web.total;
	}
    hideLoading();
	require(['session'], function(session) {
		$('body').on('tap', '.app-footer-bluebar', function(event) {
			var mark = $('#textarea').val(); //退款原因
			if(web.type == 1) {
				applyRefundAll(session, web.order_sn, mark);
			} else {
				applyRefundPart(session, web.order_sn, web.num, mark);
			}

		});
	});

});

function applyRefundAll(session, order_sn, mark) {
	if(mark.length == 0) {
		mui.toast('请输入退款原因');
		return;
	}

	var param = {
		token: session.token(),
		orderSn: order_sn,
		refundNote: mark
	};

	bjcpost('/Order/orderRefund.html', param, function(responseData, error) {
		if(!error) {
			pushToWebController('/app/refund.apply.success.html', '退款成功');
		} else {
			mui.toast(error);
		}
	});
}

function applyRefundPart(session, order_sn, adultnum, mark) {
	if(mark.length == 0) {
		mui.toast('请输入退款原因');
		return;
	}

	var param = {
		token: session.token(),
		orderSn: order_sn,
		num: adultnum,
		refundNote: mark
	};
	bjcpost('/Order/orderRefundPart.html', param, function(responseData, error) {
		if(!error) {
			pushToWebController('/app/refund.apply.success.html', '退款成功');
		} else {
			mui.toast(error);
		}
	});
}