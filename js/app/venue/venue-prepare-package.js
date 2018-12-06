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
var accompany_quantity = 1; //陪同人数
var package_quantity = 1; //陪同人数
var hud = null;
var openid = getOpenid();
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
var step;
var packageId;
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
	//	wflog(param)
	bjpost('/Venue/venueInfo.html', param, function(responsedata) {
		orderinfo = responsedata;
		initOrderInfo(session, orderinfo);
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
		console.log(error);
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
	var web = getQueryString();
	orderinfo.xsname = session.true_name();
	orderinfo.price = parseFloat(web.package_price) / parseInt(web.step);
	orderinfo.price = orderinfo.price.toFixed(2);
	
	orderinfo.parentprice = parseFloat(web.package_price) * accompany_quantity;
	orderinfo.parentprice = orderinfo.parentprice.toFixed(2);
	
	orderinfo.original_price = web.package_original_price;
	orderinfo.step = web.step;
	var html = template('tmp_orderinfo', {
		'result': orderinfo
	});
	$("#orderinfo").html(html);
	var parentprice = parseFloat(web.package_price) * accompany_quantity;
	parentprice = parentprice.toFixed(2);
	$('#pricetotal').html('￥' + parentprice + '元');

	mui('.mui-numbox').numbox().setValue(accompany_quantity * step);
	//mui('.mui-numbox').numbox().setOption('min', step);
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
		pushToExtrasController('/card/carddetail.html', '查看明细', {
			cardId: id
		})
	} else {
		pushToWebController('/card/carddetail_nopay.html', '查看明细', {
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
		if(selected_card.is_buy == 0) {
			buyBtn.innerHTML = '去买卡';
			buyCard.innerHTML = '此卡价格:';
			$('#pricetotal').html('￥' + selected_card.price + '元');
			$('#student_price').html('免费'); //(顶部学生价格)没有买卡暂时显示免费 
			$('#hintMessage').slideDown(duration);
		} else {
			buyBtn.innerHTML = '立即预约';
			buyCard.innerHTML = '预约总价:';
			$('#hintMessage').slideUp(duration);
			if(selected_card.is_use == 1) {
				var total = parseFloat(orderinfo.parentprice) + parseFloat(orderinfo.price) * 1;
				$('#pricetotal').html('￥' + total + '元');
				$('#student_price').html('￥' + parseFloat(orderinfo.price) + '元');
			} else {
				var total = parseFloat(orderinfo.parentprice) * 1;
				$('#pricetotal').html('￥' + total + '元');
				$('#student_price').html('免费');
			}
			//			updateBottomPrice(accompany_quantity);
		}
	} else {
		selected_card = null;
		buyBtn.innerHTML = '立即预约';
		buyCard.innerHTML = '预约总价:';
		var total = parseFloat(orderinfo.parentprice) * 1
		$('#pricetotal').html('￥' + total + '元');
		$('#student_price').html('免费');
		document.getElementById('hintMessage').style.display = 'block';
	}
}
//选择日期的事件
$('#choiceCalendar').on('click', function() {
	var web = getQueryString();
    //  pushToExtrasController('test.date.picker.html', '预约日期', {
    //      venueId: web.venueId
    //  });
    
    pushToExtrasController('/vunue/prepare-calendar.html?venueId=' + web.venueId +'&venueType=2', '预约日期', {
        venueId: web.venueId,
        venueType: '2'
    });
})

//创建订单
function createOrder(session, venueId, date, that) {
    that = that || document.getElementById('payBtn');
	var param = {
		token: session.token(),
		cardId: selected_card.id,
		venueId: venueId,
		packageId: packageId,
		quantity: accompany_quantity,
		quotaDate: date,
		payment: payCode,
	};
	var pays = {};
    mui(that).button('loading');
    bjpost('/Venue/venueOrderAdd.html', param, function(responseData) {
        mui(that).button('reset');
        pay(session, responseData.order_sn, pays);
    }, function(error) {
        mui(that).button('reset');
        mui.toast(error);
    })
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
		presentToController('/card/carddetail_nopay.html', selected_card.name, {
			cardId: selected_card.id
		});
	}
}

//选择日期成功的回调
document.addEventListener('calendarDate', function(selectDate) {
	console.log('日期回调');
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
    step = web.step;
    packageId = web.packageid;
    require(['session'], function(session) {
        checkoutOrderInfo(session, web.venueId);
        $('#payBtn').on('click', function() {
            if(session.is_bind_child()) { //判断是不是绑定了用户信息
                if(selected_card && selected_card.is_buy == 1) { //预约下单
                    var date = quotaDate.innerText;
                    if(date.length == 0) {
                        pushToExtrasController('/vunue/prepare-calendar.html?venueId=' + web.venueId +'&venueType=2', '预约日期', {
                            venueId: web.venueId,
                            venueType: '2'
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
                            createOrder(session, web.venueId, date);
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
		}
	}
}

mui('#orderinfo').on('change', '#numbox_input', function() {
	accompany_quantity = this.value / step;
	updateBottomPrice(accompany_quantity);
})

/**
 * @param {Object} count 套餐数
 */
function updateBottomPrice(count) {
	var web = getQueryString();

	var packageId = web.packageid;

	if(selected_card && selected_card.is_buy) { //如果卡已经买了
		if(selected_card && selected_card.is_use) { //如果这张卡没有购买 那么使用状态肯定是0
			var childprice = 0;
			var parentprice = parseFloat(web.package_price) * count;
			var total = parentprice + childprice;
			//var total = parseFloat(orderinfo.price) * (count + 1);	//	
			total = total.toFixed(2); //
			$('#pricetotal').html('￥' + total + '元');
		} else {
			var total = parseFloat(web.package_price) * count;
			$('#pricetotal').html('￥' + total + '元');
		}
	}
}