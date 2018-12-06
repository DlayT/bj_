/**
 *  1 获取该场馆可用年卡列表-->选择对应的年卡-->判断有没有绑定用户信息
 *    1 如果已绑定用户信息
 * 		1、有没有这张卡
 * 			1、有： 直接预约成功
 * 			2、没有： 买卡 --> 预约成功
 *    2、没有绑定用户信息
 * 			1、绑定用户信息
 * 			2、判断有没有这张卡
 * 				1、有： 直接预约成功
 * 				2、没有： 买卡 --> 预约成功
 * 
 * 
 * 
 * 
 *  		2 如果拥有这张年卡 则判断该年卡有没有绑定身份信息
 *       1、绑定过-->直接下单支付
 * 		 2、没有绑定 -->绑定 --> 刷新年卡	-->下单
 *  		3 没有这张年卡 买年卡-->绑定信息--->下单
 **/
//当前使用后
var orderinfo = null;
var selected_card = null;
var selected_index = 0;
var selected_payway = 'wxpay';
var payCode = 1;
var is_bind_child = null;
var accompany_quantity = 0; //陪同人数
var accompany_price = 0; //陪同人百纪价格
var accompany_original_price = 0; //陪同人市场价格
var hud = null;

var buyCard = document.getElementById('cardPrice');
var buyBtn = document.getElementById('payBtn');
var quotaDate = document.getElementById('date');
var dateimg = $('.choice-date-box').find('img');
// 预约日期
if(sessionStorage.getItem('calendar')){
    quotaDate.innerHTML = sessionStorage.getItem('calendar') || '';
    quotaDate.style.display = 'block';
    dateimg[0].style.display = 'block';
}
var openid = getOpenid();
/**
 * 获取预约场馆的信息
 * @param {Object} session
 * @param {Object} venueId
 */
function checkoutOrderInfo(session, venueId) {
	showLoading();
	var param = {
		'token': session.token(),
		'venueId': venueId
	};
	bjpost('/Venue/venueInfo.html', param, function(responsedata) {
		orderinfo = responsedata;
		initOrderInfo(session, orderinfo);
		accompany_price = orderinfo.price;
		accompany_original_price = orderinfo.original_price;
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
			onSelectCard(JSON.stringify(selected_card), 0);
		}
		initCardList(orderinfo.related_card);

		hideLoading();
		$('.mui-content').show();
	}, function(error) {
		mui.toast(error);
	})
}

/**
 * 预约场馆可以使用的卡
 * @param {Object} cards
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
			escort: value.escort,
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

/**
 * 预约场馆顶部信息
 * @param {Object} session
 * @param {Object} orderinfo
 */
function initOrderInfo(session, orderinfo) {
    $("#venueImg").attr('src', orderinfo.thumb);
	$('#venueName').html(orderinfo.name);
	$('#marketPrice').html('门市价:' + orderinfo.original_price);
	$('#wufangPrice').html(orderinfo.price + '元');
	$('#pricetotal').html(orderinfo.price);
}

/**
 * 暂时没有用到
 * @param {Object} session
 * @param {Object} orderinfo
 */
function initPage(session, orderinfo) {
	orderinfo.xsname = session.true_name();
	var html = template('tmp_content', {
		'result': orderinfo
	});
	$(".mui-content").html(html);
}

//点击事件
//点击图片查看百纪卡明细
mui('.mui-table-view.mui-table-view-radio').on('tap', '.venue-card-img', function() {
	var id = $(this).attr('id');
	var is_buy = $(this).attr('is_buy');

	if(is_buy) {
		pushToExtrasController('/card/carddetail.html?id='+id, '查看明细', {
			cardId: id
		})
	} else {
		pushToWebController('/card/carddetail_nopay.html?id='+id, '查看明细', {
			cardId: id
		});
	}

	var oEvent = event;
	oEvent.stopPropagation(); // 只执行button的click，如果注释掉该行，将执行button、p和div的click   
})

//选择使用哪张卡
mui('.mui-table-view.mui-table-view-radio').on('tap', '.mui-table-view-cell', function() {
	var card = $(this).attr('id');
	onSelectCard(card, 300);
})

//选择使用哪种支付方式

function onSelectCard(card, duration) {
	var total = 0;
	if(card) {
		selected_card = JSON.parse(card);
		if(selected_card.escort == 1) { //1可以不需要陪同人、0必须要有陪同人
			accompany_quantity = 0;
			mui('.mui-numbox').numbox().setOption('min', 0);
			mui('.mui-numbox').numbox().setValue(0);
		} else {
			accompany_quantity = 1;
			mui('.mui-numbox').numbox().setOption('min', 1);
			mui('.mui-numbox').numbox().setValue(1);
		}
		if(selected_card.is_buy == 0) {
			buyBtn.innerHTML = '去买卡';
			buyCard.innerHTML = '此卡价格:';
			$('#pricetotal').html('￥' + selected_card.price + '元');
			$('#student_price').html('免费'); //(顶部学生价格)没有买卡暂时显示免费 
			//			document.getElementById('hintMessage').style.display = 'block'; //隐藏顶部提示信息
			$('#hintMessage').slideDown(duration);
		} else {
			buyBtn.innerHTML = '立即预约';
			buyCard.innerHTML = '预约总价:';
			$('#hintMessage').slideUp(duration);
			//			document.getElementById('hintMessage').style.display = 'none';
			if(selected_card.is_use) {
				var total = parseFloat(orderinfo.price) + parseFloat(orderinfo.price) * 1;
				$('#pricetotal').html('￥' + total + '元');
				$('#student_price').html('￥' + parseFloat(orderinfo.price) + '元');

			} else {
				var total = parseFloat(orderinfo.price) * 1;
				$('#pricetotal').html('￥' + total + '元');
				$('#student_price').html('免费');
			}
			updateBottomPrice(accompany_quantity);
		}
	} else {
		selected_card = null;
		buyBtn.innerHTML = '立即预约';
		buyCard.innerHTML = '预约总价:';
		var total = parseFloat(orderinfo.price) * 1
		$('#pricetotal').html('￥' + total + '元');
		$('#student_price').html('免费');
		document.getElementById('hintMessage').style.display = 'block';
	}
}
//选择日期的事件
$('#choiceCalendar').on('tap', function() {
	var web = getQueryString();
	//	pushToExtrasController('test.date.picker.html', '预约日期', {
	//		venueId: web.venueId
	//	});
	
	pushToExtrasController('/vunue/prepare-calendar.html?venueId=' + web.venueId +'&venueType=1', '预约日期', {
		venueId: web.venueId,
		venueType: '1'
	});
})

//创建订单
function createOrder(session, venueId, date, that) {
    that = that || document.getElementById('payBtn');
	var param = {
		token: session.token(),
		venueId: venueId,
		payment: payCode,
		quantity: accompany_quantity,
		quotaDate: date,
		cardId: selected_card.id

	};
	var pays = {};
    mui(that).button('loading');
    bjpost('/Venue/venueOrderAdd.html', param, function(responseData) {
        mui(that).button('reset');
        pay(session, responseData.order_sn, pays);
    }, function(error) {
        mui.toast(error);
        mui(that).button('reset');
    })
//	plus.payment.getChannels(function(channels) {
//		var pays = {};
//		for(var i = 0; i < channels.length; i++) {
//			var channel = channels[i];
//			pays[channel.id] = channel;
//		}
//		hud = plus.nativeUI.showWaiting("支付中...");
//		bjpost('/Venue/venueOrderAdd.html', param, function(responseData) {
//			wflog(responseData);
//			hud.close();
//			pay(session, responseData.order_sn, pays);
//		}, function(error) {
//			hud.close();
//			mui.toast(error);
//		})
//	});

}

/**
 * 绑定用户信息
 */
function bindChildInfo(session) {
	presentToController('/card/bindcard.html', '绑定身份信息');
}

/**
 * 购买卡
 */
function purchaseHappyCard() {
	if(selected_card) {
		presentToController('/card/carddetail_nopay.html?id='+selected_card.id, selected_card.name, {
			id: selected_card.id
		});
	}
}

//选择日期成功的回调
document.addEventListener('calendarDate', function(selectDate) {
	quotaDate.innerHTML = selectDate.detail.calendar;
	quotaDate.style.display = 'block';
	dateimg[0].style.display = 'block';
})

//购买卡成功的回调
window.addEventListener('bj_purchase_card', function(event) {
	location.reload();
})

//选择支付方式
window.onload = function() {
    var web = getQueryString();
    require(['session'], function(session) {
        checkoutOrderInfo(session, web.venueId);
        $('#payBtn').on('click', function() {
            if(selected_card && selected_card.is_buy == 0) {
                purchaseHappyCard(session);
                return;
            }
            if(session.is_bind_child()) { //判断是不是绑定了用户信息
                if(selected_card && selected_card.is_buy == 1) { //预约下单
                    var date = quotaDate.innerText;

                    if(date.length == 0) {
                        pushToExtrasController('/vunue/prepare-calendar.html?venueId=' + web.venueId +'&venueType=1', '预约日期', {
                            venueId: web.venueId,
                            venueType: '1'
                        });
                        return false;
                    }
                    //这个地方 判断该日期是不是能预约
                    bjpost('/Venue/venueDateCheck.html', {
                        'token': session.token(),
                        'quotaDate': date,
                        'venueId': web.venueId
                    }, function(response) {
                        if(response.is_legal == 1) {
                            if(accompany_quantity == 0) {
                                var btnArray = ['立刻选择', '去现场买'];
                                mui.confirm("为了孩子的安全，按场馆要求建议购买大人陪同票。\n市场价:" + accompany_original_price + "元\n百纪价:" + accompany_price + "元", '温馨提示', btnArray, function(e) {
                                    if(e.index == 1) {
                                        createOrder(session, web.venueId, date);
                                    } else if(e.index == -1) {
                                        return false;
                                    }
                                })
                            } else {
                                createOrder(session, web.venueId, date);
                            }

                        } else {
                            mui.toast('您选择的日期暂不能预约或者已经预约满员');
                            return false;
                        }
                    })
                } else { //购买趣玩卡
                    purchaseHappyCard(session);
                }
            } else { //没有绑定卡 就去绑定卡
                bindChildInfo(session);
            }
        })
    })
    
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

$('#adult_num').change(function() {
	accompany_quantity = parseInt($('#adult_num').val());
	updateBottomPrice(accompany_quantity);
});

function updateBottomPrice(count) {
	if(selected_card && selected_card.is_buy) {
		if(selected_card && selected_card.is_use) {
			var childprice = parseFloat(orderinfo.price);
			var parentprice = parseFloat(orderinfo.price) * count;
			var total = childprice + parentprice;
			total = total.toFixed(2);
			$('#pricetotal').html('￥' + total + '元');
		} else {
			var total = parseFloat(accompany_price) * count;
			$('#pricetotal').html('￥' + total + '元');
		}
	}

}
