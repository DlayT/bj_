var bj_pagesize = 10;
var current_selected_index = 0;
var orderSn;
var selected_payway = 'wxpay';
var payCode = 1;
var openid = getOpenid();
//下拉刷新
var tab_mescroll_0 = createMescroll('mescroll', 0);
var tab_mescroll_1 = createMescroll('mescroll1', 1);
var tab_mescroll_2 = createMescroll('mescroll2', 2);

//事件
//退款
//注意防止
mui('.mui-table-view').on('tap', '.user-order-refund', function(event) {
	var order = JSON.parse($(this).attr('id'));
	if(order.refund_status > 0) {
		mui.toast(refund_desc(order.refund_status));
		return;
	}
	//注册一个session
	sessionStorage.setItem('order_msg',JSON.stringify(order));
	pushToExtrasController('/order/order.refund.select.html', '申请退款', order);
	//阻止冒泡和捕获事件
	event.stopPropagation();
});

/**
 * 取消订单 
 */
mui('.mui-table-view').on('tap', '.price_left', function() {
	var order = JSON.parse($(this).attr('value'));
	var btnArray = ['否', '是'];
	require(['session'], function(session) {
		mui.confirm('您是否确认取消订单？', '提示', btnArray, function(e) {
			if(e.index == 1) {
//				plus.nativeUI.showWaiting('正在取消...');
				var param = {
					'token': session.token(),
					'orderSn': order.order_sn
				};
				bjcpost('/Order/orderCancel.html', param, function(responseData, error) {
//					plus.nativeUI.closeWaiting();
					if(!error) {
						pulldownRefresh(tab_mescroll_1);
						mui.toast('取消成功');
					} else {
						console.log(error);
						mui.toast(error);
					}
				});
			}
		})
	})

	//	//阻止冒泡和捕获事件
	event.stopPropagation();
})

/**
 * 去支付 
 */
mui('.mui-table-view').on('tap', '.price_left1', function() {
    var that = this;
	var order = JSON.parse($(this).attr('value'));
	//这里要判断支付方式是不是可以用
	var pays = {};
	require(['session'], function(session) {
		pay(session, order.order_sn, pays, '支付成功', '', that);
	})
	//阻止冒泡和捕获事件
	event.stopPropagation();
})

/**
 * 
//<!--refund_status 退款状态，0没有申请退款状态  1-发起退款（退款中），2-同意退款，3-拒绝退款--> * @param {Object} orderStatus 
 * @param {Object} page 页码
 * @param {Object} complete 完成事件
 */
mui('.mui-table-view').on('tap', '.mui-table-view-cell', function(event) {
	var order = JSON.parse(this.getAttribute('id'));
	orderSn = order.order_sn;
	if(order.refund_status > 0) {
		mui.toast(refund_desc(order.refund_status));
		return;
	}
	if(current_selected_index == 0) {
		//注册一个session
		sessionStorage.setItem('order_msg',JSON.stringify(order));
		pushToExtrasController('/user/prepare.detail.html', '预约详情', order);
	}
})

function pulldownRefresh(mescroll) {
	var orderStatus = mescroll.tab_index - 1;
	var isReserve = mescroll.tab_index == 0 ? 1 : 0;
	loadOrder(orderStatus, isReserve, 1, function(items) {
		var html = template('tmp_order_unpay', {
			'result': items
		});
		var table = tableAtIndex(mescroll.tab_index);
		table.html(html);
		mescroll.resetUpScroll();
		mescroll.endSuccess(); //无参
	});
}

function pullupRefresh(page, mescroll) {
	var table = tableAtIndex(mescroll.tab_index);
	var count = table.children().length;
	var pageindex = Math.ceil(count / bj_pagesize) + 1;
	var orderStatus = mescroll.tab_index - 1;
	var isReserve = mescroll.tab_index == 0 ? 1 : 0;
	loadOrder(orderStatus, isReserve, pageindex, function(items) {
		var html = template('tmp_order_unpay', {
			'result': items
		});
		table.append(html);
		mescroll.endSuccess(items.length);
	});
}

document.getElementById('slider').addEventListener('slide', function(e) {
	var className = '#item' + e.detail.slideNumber + ' .mui-table-view';
	current_selected_index = e.detail.slideNumber;
});

/**
 * 订单列表
 * 
 * @api    /Order/orderList.html
 * 
 * @param  int      $orderStatus 订单状态，0-未支付，1-已支付，2-已退款，3-已取消，默认值：全部
 * @param  int      $isReserve   是否预定 1-选择已预约，0-全部，默认是全部
 * @param  int      $page        页码， 默认值：1
 * @param  int      $pageSize    每页显示数，默认值：总记录数
 * @param  int      $check_status 验票状态，0-未验票，1-已通过，2-拒绝入场，3-取消
 * 
 * 返回数据  order_type 类型，0-商品，1-活动，2-活动卡，3-场馆
 * @return json
 */
function loadOrder(orderStatus, isReserve, page, complete) {
	require(['session'], function(session) {
		var param = {
			'token': session.token(),
			'orderStatus': orderStatus,
			'isReserve': isReserve,
			'page': page,
			'pageSize': bj_pagesize
		};
		bjcpost('/Order/orderList.html', param, function(orders) {
			var slider_items = new Array();
			$.each(orders, function(index, value) {
				for(var i = 0; i < value.goodsList.length; i++) {
					if(value.goodsList[i].is_child == 0) {
						var amount = value.goodsList[i].quantity * value.cardinal_number; //不是套餐基数默认是1
					    var quantity =  value.goodsList[i].quantity;
					    var price =  value.goodsList[i].price;
					}
				}
				var item = {
					imgpath: createImgPath(value.goodsList[0].thumb),
					order_sn: value.order_sn,
					order_id: value.goodsList[0].order_id,
					order_type: value.order_type,
					quota_date: value.quota_date,
					status: value.status,
					name: value.goodsList[0].name,
					amount: amount,
					accompanyCount: value.goodsList.length - 1,
					check_status: value.check_status,
					refund_status: value.refund_status,
					package_id: value.package_id,
					refund_option_desc: refund_option_desc(value.refund_status),
					status: orderStatus,
					quantity: quantity,
					price: price

				};
				slider_items.push(item);
			});

			if(complete) {
				complete(slider_items)
			}
		})
	})
}

//工具函数
//<!--refund_type 退款状态，0没有申请退款状态  1-发起退款（退款中），2-同意退款，3-拒绝退款-->
function refund_option_desc(refund_status) {
	switch(parseInt(refund_status)) {
		case 0:
			return '申请退款';
		case 1:
			return '退款已受理';
		case 2:
			return '退款同意';
		case 3:
			return '已申请退款';
		default:
			return '申请退款';
	}
}

function refund_desc(refund_status) {
	switch(parseInt(refund_status)) {
		case 0:
			return '申请退款';
		case 1:
			return '退款已受理';
		case 2:
			return '退款同意';
		case 3:
			return '不符合退款条件';
		default:
			return '申请退款';
	}
}

/**
 * 创建下拉刷新的控件
 * @param {Object} id
 * @param {Object} index
 */
function createMescroll(id, index) {
	var mescroll = new MeScroll(id, {
		down: {
			auto: true,
			callback: pulldownRefresh,
		},
		up: {
			auto: false,
			callback: pullupRefresh, //上拉加载的回调
		}
	});
	mescroll.tab_index = index;
	return mescroll;
}

/**
 * 获取对应的table
 * @param {Object} index
 */
function tableAtIndex(index) {
	if(index == 0) {
		return $('#mescroll').find('.mui-table-view');
	} else if(index == 1) {
		return $('#mescroll1').find('.mui-table-view');
	} else if(index == 2) {
		return $('#mescroll2').find('.mui-table-view');
	}
}