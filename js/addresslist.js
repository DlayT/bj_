mui.init({
	pullRefresh: {
		container: "#refreshContainer", //下拉刷新容器标识，querySelector能定位的css选择器均可，比如：id、.class等
		down: {
			height: 50, //可选,默认50.触发下拉刷新拖动距离,
			auto: true, //可选,默认false.自动下拉刷新一次
			contentdown: "下拉可以刷新", //可选，在下拉可刷新状态时，下拉刷新控件上显示的标题内容
			contentover: "释放立即刷新", //可选，在释放可刷新状态时，下拉刷新控件上显示的标题内容
			contentrefresh: "正在刷新...", //可选，正在刷新状态时，下拉刷新控件上显示的标题内容
			callback: pullfresh_down //必选，刷新函数，根据具体业务来编写，比如通过ajax从服务器获取新数据；
		}
	}
});

mui.plusReady(function() {
	hao.t.query(db, 'select * from notepad order by id desc', selectCallBack);
});

window.addEventListener('buttonClick', function(event) {
	hao.t.query(db, 'select * from notepad order by id desc', selectCallBack);
});

function pullfresh_down() {
	//业务逻辑代码，比如通过ajax从服务器获取新数据；
	//注意，加载完新数据后，必须执行如下代码，注意：若为ajax请求，则需将如下代码放置在处理完ajax响应数据之后
	hao.t.query(db, 'select * from notepad order by id desc', selectCallBack);
	mui('#refreshContainer').pullRefresh().endPulldownToRefresh();
};

function pullfresh_up() {
	//业务逻辑代码，比如通过ajax从服务器获取新数据；
	//注意：
	//1、加载完新数据后，必须执行如下代码，true表示没有更多数据了：
	//2、若为ajax请求，则需将如下代码放置在处理完ajax响应数据之后
	this.endPullupToRefresh(true | false);
};

hao.on('.mui-media-body', 'tap', function() {
	var _id = $(this).parent().attr('_arid');
	hao.t.open('addressdetail', '地址详情', {arid: _id});
});

var db = hao.t.db();
var selectCallBack = function(data) {
	var len = data.rows.length,i;
	var _html = '';
	for(i = 0; i < len; i++) {
		_html += '<li class="mui-table-view-cell mui-media" _arid="' + data.rows.item(i).id + '">' +
			'<div class="mui-slider-right mui-disabled">' +
			'<a class="mui-btn mui-btn-red">删除</a>' +
			'</div>' +
			'<div class="mui-media-body mui-slider-handle" style="margin-top: 6px;width: 100%;margin-left: 8px;">' +
			data.rows.item(i).name + '<span style="float: right;margin-right: 8px;">' +
			data.rows.item(i).phone + '</span>' +
			'</div>' +
			'<div style="margin-left: 8px;margin-top: 15px;">' +
			data.rows.item(i).city + data.rows.item(i).street + '</div>' +
			'<hr />' +
			'<div>' +
			'<div class="mui-switch mui-switch-blue mui-switch-mini mui-active">' +
			'<div class="mui-switch-handle">' +
			'</div>' +
			'</div>' +
			'<span style="font-size: 14px;">' +
			'设为默认地址' + '</span>' +
			'<div style="float: right;">' +
			'<span style="font-size: 14px;">编辑</span>' +
			//							'<span style="font-size: 14px;">删除</span>'+
			'</div>' +
			'</div>' +
			'</li>';

	}
	if(_html == '') {

	} else {
		$('#listContent').html(_html);
		loadDelTap();
	}
};

var loadDelTap = function() {
	hao.on('.mui-btn', 'tap', function() {
		var _id = $(this).parent().parent().attr('_arid');
		hao.t.query(db, 'delete from notepad where id="' + _id + '" ', function() {
			hao.t.query(db, 'select * from notepad order by id desc', selectCallBack);
		});
	});
};