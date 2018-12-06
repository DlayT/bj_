var content; //秒杀商品内容
var seckillId; //秒杀商品id
//var payBtn = document.getElementById("prepareView");
mui.plusReady(function() {
	var web = plus.webview.currentWebview();
	if(web.haveNew == 0) {//如果没有秒杀活动隐藏秒杀
		document.getElementById("prepareView").style.display = 'none';
		return;
	}
	content = document.getElementById('seckillcontent');
	require(['session'], function(session) {
		var param = {
			token: session.token()
		}
		bjpost('/Promotion/flashSaleContent.html', param, function(responseData) {
			seckillId = responseData.id;
			content.innerHTML = responseData.content;
		}, function(error) {
			mui.toast(error);
		});

		$('#seckillBtn').on('click', function() {
			var param = {
				token: session.token(),
				promId: seckillId
			}
			bjpost('/Promotion/flashSaleOrderAdd.html', param, function(responseData) {
				var orderSn = responseData.order_sn;
				plus.payment.getChannels(function(channels) {
					var pays = {};
					for(var i = 0; i < channels.length; i++) {
						var channel = channels[i];
						pays[channel.id] = channel;
					}
					//这里要判断支付方式是不是可以用
					plus.nativeUI.showWaiting();
					pay(session, orderSn, pays);
				});
			}, function(error) {
				console.log(error);
				mui.toast(error);
			});
		})
	})
})

function pay(session, order_sn, pays) {
	var param = {
		'token': session.token(),
		'orderSn': order_sn,
		'payment': '1'
	};

	//type 0 一般出现的原因 场馆价格为0 无法吊起微信支付 直接内部支付通过
	//type 1 支付正常
	wflog(param)
	bjpost('/Order/orderPay.html', param, function(responseData) {
		//		wflog(responseData);
		plus.nativeUI.closeWaiting();
		if(responseData.type == 0) {
			mui.toast('支付成功');
			mui.back();
		} else {
			plus.payment.request(pays['wxpay'], responseData.paystr, function(result) {
				mui.toast('支付成功');
				mui.back();
			}, function(e) {
				mui.toast('支付失败');
				wflog(e);
			});
		}
	}, function(error) {
		wflog(error)
	})
}