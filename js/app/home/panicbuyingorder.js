var panicPrice;
var panicId;
var panicNum = 1;

var selected_payway = 'wxpay';
var payCode = 1;
var openid = getOpenid();

var mbuyLimit, mbuyAllready, mbuyRemainder; //限购数量、已买数量、商品剩余数量

var panic = getQueryString();
//wflog(panic);
mui.ready(function() {

	require(['session'], function(session) {
		var param = {
			token: session.token(),
			promId: panic.panicbuyingId
		};
		bjcpost('Promotion/specialSaleInfo.html', param, function(panic, error) {
			if(panic) {
				wflog(panic);
				panicPrice = panic.price;
				panicId = panic.panicbuyingId;
				mbuyLimit = panic.buy_limit;
				mbuyAllready = panic.buy_allready;
				mbuyRemainder = panic.buy_remainder;
				var num = mbuyLimit - mbuyAllready;
				mui('.mui-numbox').numbox().setOption('max', num); //设置最多选择数量(还需判断剩余数量是否大于0)
				document.getElementById('title').innerHTML = panic.title;
				document.getElementById('price').innerHTML = '￥' + panic.price + '元';
				document.getElementById('image').src = panic.thumb;
				document.getElementById('pricetotal').innerHTML = '￥' + panic.price + '元';
			}
		});

		$('#seckillBtn').on('click', function() {
			var param = {
				token: session.token(),
				promId: panic.panicbuyingId,
				num: panicNum
			}
			var that = document.getElementById('seckillBtn');
			mui(that).button('loading');
			bjpost('/Promotion/specialSaleOrderAdd.html', param, function(responseData) {
			    mui(that).button('reset');
			    var pays = {};
				pay(session, responseData.order_sn, pays, '抢购成功', '', that);
			}, function(error) {
				mui(that).button('reset');
				mui.toast(error);
			});
		})
	})

	//手动写增加减少
	$('#minusBtn').on('tap', function() {
		var inputNumbox = $('#number');
		var num = parseInt(inputNumbox.val());
		panicNum = num;
		updateBottomPrice(num);
	})

	//增加
	$('#plusBtn').on('tap', function() {
		var inputNumbox = $('#number');
		var num = parseInt(inputNumbox.val());
		panicNum = num;
		updateBottomPrice(num);
	})

})

function updateBottomPrice(count) {
	console.log('数量：' + count);
	var total = parseFloat(panicPrice) * count;
	console.log('总价：' + total);
	document.getElementById("pricetotal").innerHTML = '￥' + total + '元';
}

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
		}
	}
}