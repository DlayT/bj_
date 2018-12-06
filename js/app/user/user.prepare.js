var mescroll = new MeScroll("mescroll", {
	down: {
		auto: true,
		callback: pulldownRefresh,
	},
	up: {
		auto: false,
		callback: pullupRefresh, //上拉加载的回调
		isBounce: true //如果您的项目是在iOS的微信,QQ,Safari等浏览器访问的,建议配置此项.解析(必读)
	}
});

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

mui('.mui-table-view').on('tap', '.mui-table-view-cell', function(event) {
	var order = JSON.parse(this.getAttribute('id'));
//	return false;
	//注册一个session
	sessionStorage.setItem('order_msg',JSON.stringify(order));
	if(order.refund_status > 0) {
		mui.toast(refund_desc(order.refund_status));
		return;
	}
	pushToExtrasController('/user/prepare.detail.html', '预约详情', order);
})

var bj_pagesize = 10; //

/**
 * 订单列表
 * 
 * @api    /Order/orderList.html
 * 
 * @param  int      $orderStatus 订单状态，0-未支付，1-已支付，2-已退款，3-已取消，默认值：全部
 * @param  int      $isReserve   是否预定 1-选择已预约，0-全部，默认是全部
 * @param  int      $page        页码， 默认值：1
 * @param  int      $pageSize    每页显示数，默认值：总记录数
 * @return json
 */
function loadOrder(orderStatus, isReserve, page, complete) {
	require(['session'], function(session) {
		var param = {
			'token': session.token(),
			'isReserve': isReserve,
			'page': page,
			'pageSize': bj_pagesize
		};
		bjpost('/Order/orderList.html', param, function(orders) {
			if(orders.length == 0 && page == 1) {
				showEmpty();
				mui('#prepare').pullRefresh().endPulldownToRefresh();
				return;
			}
			var slider_items = new Array();
			$.each(orders, function(index, value) {
				for(var i = 0; i < value.goodsList.length; i++) {
					if(value.goodsList[i].is_child == 0) {
						var amount = value.goodsList[i].quantity * value.cardinal_number; //不是套餐基数默认是1
					}
				}
				//之前判断陪同人数量的方式如果陪同人单独购买的话会出现陪同人数少了一个。
				//				var amount = (value.amount - 1) * value.cardinal_number; //不是套餐基数默认是1
				var item = {
					imgpath: createImgPath(value.goodsList[0].thumb),
					order_sn: value.order_sn,
					order_id: value.goodsList[0].order_id,
					name: value.goodsList[0].name,
					amount: amount,
					refund_status:value.refund_status,
					order_type: value.order_type
				};
				slider_items.push(item);

			});

			if(complete) {
				complete(slider_items)
			}
		})
	})
}

//$orderStatus 订单状态，0-未支付，1-已支付，2-已退款，3-已取消，默认值：全部
// * @param  int        
function pulldownRefresh() {
	var orderStatus = 0;
	var isReserve = 1;
	loadOrder(orderStatus, isReserve, 1, function(items) {
		var html = template('tmp_order_unpay', {
			'result': items
		});
		$('#prepare').html(html);

		mescroll.endSuccess();
	});
}

function pullupRefresh() {
	var count = $('#prepare').children().length;
	var pageindex = Math.ceil(count / bj_pagesize) + 1;
	var orderStatus = 0;
	var isReserve = 1;
	loadOrder(orderStatus, isReserve, pageindex, function(items) {
		var html = template('tmp_order_unpay', {
			'result': items
		});
		$('#prepare').append(html);
		mescroll.endSuccess(items.length);
	});
}