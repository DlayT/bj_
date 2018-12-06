//当前使用后
var orderinfo = null;
var selected_card = null;
var selected_index = 0;
var selected_payway = 'wxpay';
var payCode = 1; //默认1 微信
var is_bind_child = null;
var isUpdateCard = false; //是否有可升级的卡
var updateCardId = 0; //被升级的卡的ID，现在只有一张可升级的卡，先写死。
var updateCardPrice = 0;
var updateToCardId = 0; //升级到知行实践卡的ID。
var updateToCardPrice = 0;
var hud = null;
var openid = getOpenid();
var buyCard = document.getElementById('cardPrice');
var buyBtn = document.getElementById('payBtn');
var quotaDate = document.getElementById('date');
var dateimg = $('.choice-date-box').find('img');

$(function() {
	var self = getQueryString();
	require(['session'], function(session) {
		showLoading();
		var param = {
			token: session.token(),
			venueId: self.activityId
		};
		bjpost('/Report/venueInfo.html', param, function(responseData) {
			orderinfo = responseData;
			quotaDate.innerHTML = orderinfo.start_time;
			if(orderinfo.userCard.length > 0) {
				updateCardId = orderinfo.userCard[0].card_id;
				updateCardPrice = orderinfo.userCard[0].price;
			}
			if(orderinfo.related_card.length == 0) { //该场馆没有可以使用的卡 一般不会出现这个情况
				onSelectCard(null, 0);
			} else {
				selected_card = orderinfo.related_card[0];
				$.each(orderinfo.related_card, function(index, card) {
					if(card.is_buy == 1) {
						selected_card = orderinfo.related_card[index];
						selected_index = index;
						return false;
					}
				});
				onSelectCard(JSON.stringify(selected_card), 0, orderinfo);
			}

			//顶部信息
			initActivityInfo(orderinfo);
			initCardList(orderinfo.related_card);
			hideLoading();
		}, function(error) {
			mui.toast(error);
		});
	})

	require(['session'], function(session) {
		$('#payBtn').on('click', function() {
		    var that = this;
			if(selected_card && selected_card.is_buy == 1) { //预约下单
				if(orderinfo.haveChild == 0) { //判断是不是绑定了用户信息,0未绑定、1已绑定
					bindChildInfo(session);
				} else {
					createActivityOrder(session, self.activityId);
				}
			} else { //升级或者购买趣玩卡
				if(isUpdateCard) {
					var btnArray = ['是', '否'];
					mui.confirm('您需要升级到知行实践卡才能预约该活动，是否升级？', '提示', btnArray, function(e) {
						if(e.index == 0) {
							//确认升级
							createUpdateCardOrder(session);
						}
					})
				} else { //去买卡
					purchaseHappyCard(session);
				}

			}

		})
	})

});

/**
 * 升级活动卡下单
 * @param {Object} session
 */
function createUpdateCardOrder(session,that) {
    that = that || document.getElementById('payBtn');
	var param = {
		token: session.token(),
		cardId: updateCardId,
		toCardId: updateToCardId,
		payment: payCode
	};
    var pays = {};
	//这里要判断支付方式是不是可以用
	mui(that).button('loading');
	bjpost('/Card/cardLeveupOrderAdd.html', param, function(responseData) {
		mui(that).button('reset');
		pay(session, responseData.order_sn, pays, '升级卡成功');
	}, function(error) {
		mui(that).button('reset');
		mui.toast(error);
	})
}

/**
 * @param {Object} session
 * @param {Object} activityId
 */
function createActivityOrder(session, activityId, that) {
    that = that || document.getElementById('payBtn');
	var param = {
		token: session.token(),
		cardId: selected_card.id,
		venueId: activityId,
		quantity: 1,
		payment: payCode
	};
	var pays = {};
	//这里要判断支付方式是不是可以用
	mui(that).button('loading');
	bjpost('/Report/venueOrderAdd.html', param, function(responseData) {
		mui(that).button('reset');
		pay(session, responseData.order_sn, pays);
	}, function(error) {
		mui(that).button('reset')
		mui.toast(error);
	})
}

/**
 * 顶部活动简介
 * @param {Object} orderinfo
 */
function initActivityInfo(orderinfo) {
	var html = template('tmp_orderinfo', {
		'result': orderinfo
	});
	$("#orderinfo").html(html);
}

function onSelectCard(card, duration, orderinfo) {
	var total = 0;
	if(card) {
		selected_card = JSON.parse(card);
		updateToCardId = selected_card.id;
		updateToCardPrice = selected_card.price;
		if(selected_card.is_buy == 0) { //没有知行实践卡

			if(orderinfo.userCard.length == 0) { //没有任何卡  需买知行实践卡368元
				$('#payBtn').html('去买卡');
				$('#cardPrice').html('此卡价格');
				$('#pricetotal').html('￥' + selected_card.price + '元');
			} else { //已经有卡但是没有知行实践卡     需升级100元
				var updatePrice = updateToCardPrice - updateCardPrice;
				$('#payBtn').html('去升级');
				$('#cardPrice').html('升级价格');
				$('#pricetotal').html('￥' + updatePrice + '元');
				isUpdateCard = true;
			}

			$('#hintMessage').slideDown(duration);
		} else { //有知行实践卡
			$('#payBtn').html('立即预约');
			$('#cardPrice').html('预约总价');
			$('#hintMessage').slideUp(duration);
			if(selected_card.is_use) {
				var total = parseFloat(orderinfo.price) + parseFloat(orderinfo.price) * 1;
				$('#pricetotal').html('￥' + total + '元');

			} else {
				var total = parseFloat(orderinfo.price) * 1;
				$('#pricetotal').html('￥' + total + '元');
			}
		}
	} else {
		selected_card = null;
		buyBtn.innerHTML = '立即预约';
		buyCard.innerHTML = '预约总价:';
		var total = parseFloat(orderinfo.price) * 1
		$('#pricetotal').html('￥' + total + '元');
		document.getElementById('hintMessage').style.display = 'block';
	}
}

/**
 * 预约场馆可以使用的卡
 * @param 包含活动的卡数组
 */
function initCardList(cards) {
	var items = new Array();
	$.each(cards, function(index, value) {
		var item = {
			id: value.id,
			name: value.name,
			instr: value.instr,
			agreement: value.agreement,
			venue_id: value.venue_id,
			thumb: createImgPath(value.thumb),
			price: value.price,
			validity_day: value.validity_day,
			status: value.status,
			is_del: value.is_del,
			is_buy: value.is_buy,
			is_use: value.is_use,
			is_favorite: value.is_favorite,
			selected: (index == selected_index),
		};
		items.push(item);
	});
	var html = template('tmp_related_card_table', {
		'result': items
	});

	$("#related_card_table").html(html);
}

//选择支付方式
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

/**
 * 购买卡
 */
function purchaseHappyCard() {
	if(selected_card) {
		presentToController('/card/carddetail_nopay.html?id='+selected_card.id, selected_card.name, {
			cardId: selected_card.id
		});
	}
}

/**
 * 绑定用户信息
 */
function bindChildInfo(session) {
	presentToController('/card/bindchildmsg.html', '绑定身份信息');
}

//购买卡成功的回调
window.addEventListener('bj_purchase_card', function(event) {
	location.reload();
})