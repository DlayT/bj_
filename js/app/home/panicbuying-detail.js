var content; //秒杀商品内容
mui.ready(function () {
  	var panic = getQueryString();
  	wflog(panic);
   	content = document.getElementById('seckillcontent');
	require(['session'], function(session) {
		var param = {
			token: session.token(),
			promId: panic.panicbuyingId
		}
		wflog(param);
		bjpost('/Promotion/specialSaleContent.html', param, function(responseData) {
			panic.buy_limit = responseData.buy_limit;
			panic.buy_allready = responseData.buy_allready;
			panic.buy_remainder = responseData.buy_remainder;
			content.innerHTML = responseData.content;
		}, function(error) {
			mui.toast(error);
		});

		
		$('#seckillBtn').on('click', function() {
			var path = Bee.UrlUtils.objToUrl('/home/panicbuyingorder.html',panic);
			pushToExtrasController(path, '填写订单');
		})
	})
   })

function pay(session, order_sn, pays) {
	var param = {
		'token': session.token(),
		'orderSn': order_sn,
		'payment': '1'
	};
}