var checkStatus;
var childobj;
var adultPrice = 0; //陪同票价格
var adultMktPrice = 0; //陪同票价格
var adultNum = 1; //陪同人数量
var cardId; //卡id
var venueId; //场馆id
var packageId; //套餐id
var hud = null;
var ptrs; //陪同人数
var childNum = 0;
var payCode = 1;
var selected_payway = 'wxpay';
var openid = getOpenid();
function checkoutOrderInfo(session, orderId) {
	var param = {
		token: session.token(),
		orderId: orderId
	};
	showLoading();
	bjcpost('/Order/orderDetail.html', param, function(responseData, error) {
		hideLoading();
		if(responseData) {
			//获取陪同人数量，获取陪同人预约价格
			for(var i = 0; i < responseData.goodsList.length; i++) {
				if(responseData.goodsList[i].is_child == 0) {
					ptrs = responseData.goodsList[i].quantity * responseData.cardinal_number;
					adultPrice = responseData.goodsList[i].price;
					adultMktPrice = responseData.goodsList[i].original_price;
					$('#adultTotal').html('￥' + adultPrice + '元');
					$('.buy-accompany-mktprice').html('市场价:' + '￥' + adultMktPrice + '元');
					$('.buy-accompany-bjprice').html('百纪价:' + '￥' + adultPrice + '元');
				}
			}
			
			//获取订单是否为陪同人单独预约
			for(var i = 0; i < responseData.goodsList.length; i++) {
				if(responseData.goodsList[i].is_child == 1) {
					childNum = responseData.goodsList[i].quantity;
				}
			}

			require(['session'], function(session) {
				document.getElementById("venueName").innerHTML = responseData.goodsList[0].name;
				document.getElementById("venueImg").src = responseData.goodsList[0].thumb;
				document.getElementById("venueCode").innerHTML = '订单号：' + responseData.goodsList[0].order_sn;
				document.getElementById("venueDate").innerHTML = '预约日期：' + responseData.quota_date;
				if(responseData.order_type == 3){
				    document.getElementById("personNum").innerHTML = session.true_name() + ' (陪同人数：' + ptrs + ')';
				}else{
				    document.getElementById("personNum").innerHTML = ' 购买份数：' + ptrs + '份';
				}
				
				document.getElementById("venueName2").innerHTML = responseData.goodsList[0].name;
				document.getElementById("venueName3").innerHTML = responseData.goodsList[0].name;
				//$('.buy-accompany-mktprice').val()
				cardId = responseData.card_id;
				venueId = responseData.target_id;
				packageId = responseData.package_id;
				childobj = responseData.child;
				checkStatus = responseData.check_status;
				if(responseData.check_status == 1) { //已经验票了
					document.getElementById('checkStatus').style.visibility = 'visible';
				}
				if(responseData.check_status == 0 && childNum > 0 && ptrs == 0 && responseData.refund_status == 0) { //未验票且订单只有有小孩没有大人
					$('#payAdultCell').show();
				} else {
					$('#payAdultCell').hide();
				}

			})
			for(var i = 0; i < responseData.goodsList.length; i++) {
				if(responseData.goodsList[i].is_child == 0) {
					adultPrice = responseData.goodsList[i].price;
					$('#adultTotal').html('￥' + adultPrice + '元');
					return;
				}
			}
		} else {
			mui.toast(error);
		}
	})
}

//mui.plusReady(function() {
(function() {
	require(['session'], function(session) {
//		var web = plus.webview.currentWebview();
		var web = JSON.parse(sessionStorage.getItem('order_msg'));
		checkoutOrderInfo(session, web.order_id)

		//生成二维码
		$('#payBtn').on('click', function() {
			var param = {
				token: session.token(),
				orderId: web.order_sn
			};
		})

		$('#payAdult').on('click', function() {
		    var that = this;
			var param = {
				token: session.token(),
				cardId: cardId,
				venueId: venueId,
				packageId: packageId,
				quantity: adultNum,
				payment: 1
			};
			var pays = {};
			mui(that).button('loading');
			bjpost('/Venue/venueParentOrderAdd.html', param, function(responseData) {
			    mui(that).button('reset');
				pay(session, responseData.order_sn, pays,'预约成功', '', that);
			}, function(error) {
			    mui(that).button('reset');
				mui.toast(error);
			})
		});
	})
})();

$('#adult_num').change(function() {
	adultNum = parseInt($('#adult_num').val());
	updateBottomPrice(adultNum);
});

function updateBottomPrice(count) {
	var total = parseFloat(adultPrice) * count;
	$('#adultTotal').html('￥' + total + '元');
}