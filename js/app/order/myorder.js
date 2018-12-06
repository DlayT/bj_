//订单
var current_selected_index = 0;
var ul_nopay = $('#scroll2').find('ul');
var ul_paying = $('#scroll3').find('ul');
$('body').on('tap', '.mui-btn', function(event) {
	var order = JSON.parse($(this).attr('id'));
	if(order.refund_status > 0) {
		mui.toast(refund_desc(order.refund_status));
		return;
	}
	pushToExtrasController('order.refund.select.html', '申请退款', order);
	event.preventDefault();
})

//mui初始化，配置下拉刷新
var orderSn;
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
		pushToExtrasController('../user/prepare.detail.html', '预约详情', order);
	}
})

var bj_pagesize = 10; //
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
		wflog(param);
		bjpost('/Order/orderList.html', param, function(orders) {
			var slider_items = new Array();
			$.each(orders, function(index, value) {
				if(value.order_type == 3) { //3为场馆、4为活动
					for(var i = 0; i < value.goodsList.length; i++) {
						if(value.goodsList[i].is_child == 0) {
							var amount = value.goodsList[i].quantity * value.cardinal_number; //不是套餐基数默认是1
						}
					}
				} else {
					var amount = 0; //活动没有陪同人
				}

				//之前判断陪同人数量的方式如果陪同人单独购买的话会出现陪同人数少了一个。
				//				var amount = (value.amount - 1) * value.cardinal_number; //不是套餐基数默认是1
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
					status: orderStatus

				};
				slider_items.push(item);
			});

			if(complete) {
				complete(slider_items)
			}
		})
	})
}
mui('.mui-scroll-wrapper').scroll({
	indicators: true //是否显示滚动条
});

//阻尼系数
var deceleration = mui.os.ios ? 0.003 : 0.0009;
mui('.mui-scroll-wrapper').scroll({
	bounce: false,
	indicators: true, //是否显示滚动条
	deceleration: deceleration
});
//$orderStatus 订单状态，0-未支付，1-已支付，2-已退款，3-已取消，默认值：全部
// * @param  int        
function pulldownRefresh(table, tabindex, complete) {
	console.log('pulldownRefresh(table, tabindex, complete) ');
	var orderStatus = tabindex - 1;
	var isReserve = tabindex == 0 ? 1 : 0;
	loadOrder(orderStatus, isReserve, 1, function(items) {
		var html = template('tmp_order_unpay', {
			'result': items
		});
		$(table).html(html);
		if(complete) {
			complete();
		}
	});
}

function pullupRefresh(table, tabindex, complete) {
	//获取子元素的个数
	var count = $(table).children().length;
	var pageindex = Math.ceil(count / bj_pagesize) + 1;
	var orderStatus = tabindex - 1;
	var isReserve = tabindex == 0 ? 1 : 0;
	loadOrder(orderStatus, isReserve, pageindex, function(items) {
		var html = template('tmp_order_unpay', {
			'result': items
		});
		$(table).append(html);
		if(complete) {
			complete();
		}
	});
}

document.getElementById('slider').addEventListener('slide', function(e) {
	var className = '#item' + e.detail.slideNumber + ' .mui-table-view';
	current_selected_index = e.detail.slideNumber;
	var table = $(className)[0];
	var count = $(table).children().length;
	if(count == 0) {
		pulldownRefresh($(table)[0], e.detail.slideNumber);
	}
});

mui.ready(function() {
	//循环初始化所有下拉刷新，上拉加载。
	mui.each(document.querySelectorAll('.mui-slider-group .mui-scroll'), function(index, pullRefreshEl) {
		mui(pullRefreshEl).pullToRefresh({
			down: {
				callback: function() {
					var self = this;
					var ul = self.element.querySelector('.mui-table-view');
					pulldownRefresh(ul, index, function() {
						self.endPullDownToRefresh();
					})
				}
			},
			up: {
				auto: true,
				callback: function() {
					var self = this;
					var ul = this.element.querySelector('.mui-table-view');
					pullupRefresh(ul, index, function() {
						self.endPullUpToRefresh();
					})
				}
			}
		});
	});
});

mui.plusReady(function() {
	require(['session'], function(session) {

		/**
		 * 取消订单 
		 */
		mui('body').on('tap', '.price_left', function() {
			var btnArray = ['否', '是'];
			mui.confirm('您是否确认取消订单？', '提示', btnArray, function(e) {
				if(e.index == 1) {
					plus.nativeUI.showWaiting('正在取消...');
					bjpost('/Order/orderCancel.html', {
						'token': session.token(),
						'orderSn': orderSn
					}, function(responseData) {
						plus.nativeUI.closeWaiting();
						pulldownRefresh(ul_nopay, 1, function() {
							self.endPullDownToRefresh();
						})
						mui.toast('取消成功');
					}, function(error) {
						plus.nativeUI.closeWaiting();
						console.log(error);
						mui.toast(error);
					})
				}
			})
		})

		/**
		 * 去支付 
		 */
		mui('body').on('tap', '.price_left1', function() {
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
		})

	})

})


//问题,时间名为refresh会冲突，导致订单列表执行两遍。
window.addEventListener('refundsuccesssignal', function(event) {
	pulldownRefresh(ul_paying, 2, function() {})
});