//我的消息
var bj_pagesize = 100; //

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
function loadOrder(page, complete) {
	require(['session'], function(session) {
		var param = {
			'token': session.token(),
			'page': page,
			'pageSize': bj_pagesize
		};
		bjpost('/User/messageList.html', param, function(msgs) {
			var slider_items = new Array();
			$.each(msgs, function(index, value) {
				var item = {
					title: value.title,
					content: value.content,
					add_time: value.add_time,
				};
				slider_items.push(item);

			});

			if(complete) {
				complete(slider_items)
			}
		})
	})
}

var mescroll = new MeScroll("mescroll", { //第一个参数"mescroll"对应上面布局结构div的id
	//如果您的下拉刷新是重置列表数据,那么down完全可以不用配置,具体用法参考第一个基础案例
	//解析: down.callback默认调用mescroll.resetUpScroll(),而resetUpScroll会将page.num=1,再触发up.callback
	down: {
		auto:true,
		callback: pulldownRefresh //下拉刷新的回调,别写成downCallback(),多了括号就自动执行方法了
	},
	up: {
		auto:false,
		callback: pullupRefresh, //上拉加载的回调
		isBounce: true //如果您的项目是在iOS的微信,QQ,Safari等浏览器访问的,建议配置此项.解析(必读)
	}
});


//$orderStatus 订单状态，0-未支付，1-已支付，2-已退款，3-已取消，默认值：全部
// * @param  int        
function pulldownRefresh() {
//	console.log('pulldownRefresh')
	loadOrder(1, function(items) {
		var html = template('tmp_order_unpay', {
			'result': items
		});
		$('#prepare').html(html);
	
		mescroll.endSuccess(); //无参
	});
}

function pullupRefresh() {
	//获取子元素的个数
	var count = $('#prepare').children().length;
	var pageindex = Math.ceil(count / bj_pagesize) + 1;
	loadOrder(pageindex, function(items) {
		var html = template('tmp_order_unpay', {
			'result': items
		});
		$('#prepare').append(html);
		
		mescroll.endSuccess(10);
	});
}