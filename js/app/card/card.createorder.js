var orderinfo = null;
var selected_card = null;
var selected_payway = 'wxpay';
var payCode = 1;
var need_reload = false;
var openid = getOpenid();

/**
 * 模拟付钱买卡
 * @param {Object} session
 * @param {Object} order_sn
 */
function visualPay(session, order_sn) {
	var param = {
		token: session.token(),
		orderSn: order_sn
	};
	bjpost('/Order/orderPaid.html', param, function(responseData) {
		mui.toast('购买年卡成功');
		need_reload = true;
		mui.back();
	}, function(error) {
		need_reload = true;
		mui.toast(error);
		mui.back();
	})
}

function checkoutOrderInfo(session, cardId) {
	var param = {
		'token': session.token(),
		'cardId': cardId
	};
	showLoading();
	bjpost('/Card/cardInfo.html', param, function(responseData) {
		document.getElementById("cardPic").src = createImgPath(responseData.thumb);
		document.getElementById("cardName").innerHTML = responseData.name;
		if(session.true_name()) {
			document.getElementById("stuName").innerHTML = '学生：' + session.true_name();
		}
		document.getElementById("cardPrice").innerHTML = '价格：' + responseData.price;
		document.getElementById("ordertotalprice").innerHTML = '￥' + responseData.price;
		hideLoading();
	});
}

function createCardOrder(session, cardId, that) {
	var pays = {};

	var param = {
		'token': session.token(),
		'cardId': cardId,
		'payment': payCode
	};
	//			need_reload = true;
	//			mui.back();
    mui(that).button('loading');
	//这里要判断支付方式是不是可以用
	bjpost('/Card/cardOrderAdd.html', param, function(responseData) {
		//visualPay(session, responseData.order_sn);
		pay(session, responseData.order_sn, pays, '购买成功');
	}, function(error) {
		mui.toast(error);
		mui(that).button('reset');
	})

}

$(function() {

	require(['session'], function(session) {
		//		var web = plus.webview.currentWebview();
		var web = getQueryString();
		checkoutOrderInfo(session, web.id)
		$('#payBtn').on('tap', function() {
		    var that = this;
			createCardOrder(session, web.id, that);
		})
	})
});

window.onload = function() {
	var obj_lis = document.getElementById("payTypes").getElementsByTagName("li");
	for(i = 0; i < obj_lis.length; i++) {
		obj_lis[i].onclick = function() {
			var payType = $(this).attr('id');
			selected_payway = payType;
			if(payType == 'wxpay') {
				payCode = 1;
			} else if(payType == 'alipay') {
				payCode = 2;
			} else if(payType == 'cmbpay') {
				payCode = 3;
			}
			if($(this).find('input').prop('checked')) {
				$(this).find('input').prop('checked', true);
			} else {
				$(this).find('input').prop('checked', true);
			}
		}
	}
}