var bj_pagesize = 10; //
var mescroll = new MeScroll("mescroll", {
	down: {
		auto: true,
		callback: pulldownRefresh,
	},
	//	up: {
	//		auto: false,
	//		callback: pullupRefresh, //上拉加载的回调
	//		isBounce: true //如果您的项目是在iOS的微信,QQ,Safari等浏览器访问的,建议配置此项.解析(必读)
	//	}
});

function getWebServiceData(page, complete) {
	bjcpost('/Report/venueList.html', {}, function(responseData, error) {
		if(responseData) {
			var items = new Array();
			$.each(responseData, function(index, value) {
				var item = {
					activityId: value.id,
					imgpath: createImgPath(value.thumb),
					title: value.name,
					price: value.price,
					original_price: value.original_price,
					member_price: value.member_price,
					cate_id: value.cate_id,
					address: value.address,
					coordinate: value.coordinate,
					cost: value.cost,
					num: value.num,
					valid: value.valid,
					reminder_quantity: value.reminder_quantity,
					start_time: value.start_time,
					status: value.status
				};
				items.push(item);
			});
			if(complete) {
				complete(items);
			}
		} else {
			mescroll.endSuccess();
		}

	})
}

function pulldownRefresh() {
	getWebServiceData(1, function(items) {
		var html = template('tmp_items', {
			'result': items
		});
		$('#activityList').html(html);
		mescroll.endSuccess(); //无参
	});
}

function pullupRefresh() {
	var count = $('#activityList').children().length;
	var pageindex = Math.ceil(count / bj_pagesize) + 1;
	console.log('pageindex' + pageindex);
	getWebServiceData(pageindex, function(items) {
		var html = template('tmp_items', {
			'result': items
		});
		$('#activityList').append(html);
		mescroll.endSuccess(10);
	});
}

//点击事件
mui('.mui-table-view').on('tap', '.mui-table-view-cell', function(event) {
	var activity = JSON.parse(this.getAttribute('id'));
	pushToExtrasController('/activity/activity.detail.html?activityId='+activity.activityId, '活动详情');
})