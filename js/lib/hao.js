var hao = {};
hao.on = function(obj, event, func) {
	$(document).off(event, obj).on(event, obj, func);
};
hao.log = function(txt) {
	console.log(txt);
};

//对mui以及nativejs相关封装

hao.t = {};

hao.t.normalStyle = {
	top: '45px',
	bottom: 0
};
hao.t.centerStyle = {
	top: '45px',
	bottom: '50px'
};
hao.t.normalPage = function(id) {
	return hao.t.page(id, {
		styles: hao.t.normalStyle
	});
};
hao.t.centerPage = function(id) {
	return hao.t.page(id, {
		styles: hao.t.centerStyle
	});
};
hao.t.page = function(id, options) {
	var url = '' + id + '.html';
	options.id = id;
	options.url = url;
	return options;
};
hao.t.indexPage = function() {
	return plus.webview.getWebviewById(plus.runtime.appid);
};
hao.t.currentPage = function() {
	return plus.webview.currentWebview();
};
hao.t.getPage = function(id) {
	return id ? plus.webview.getWebviewById(id) : null;
};
hao.t.show = function(id, ani, time, func) {
	if(id) plus.webview.show(id, ani, time, func);
};
hao.t.hide = function(id, ani, time) {
	if(id) plus.webview.hide(id, ani, time);
};
hao.t.fire = function(id, name, values) {
	mui.fire(hao.t.getPage(id), name, values);
};
hao.t.open = function(id, name, values) {
	mui.openWindow({
		url: id + '.html',
		id: id,
		styles: { // 窗口参数 参考5+规范中的WebviewStyle,也就是说WebviewStyle下的参数都可以在此设置
			titleNView: { // 窗口的标题栏控件
				autoBackButton: true,
				titleText: name, // 标题栏文字,当不设置此属性时，默认加载当前页面的标题，并自动更新页面的标题
				titleColor: "#ffffff", // 字体颜色,颜色值格式为"#RRGGBB",默认值为"#000000"
				titleSize: "17px", // 字体大小,默认17px
				backgroundColor: "#009BFD", // 控件背景颜色,颜色值格式为"#RRGGBB",默认值为"#F7F7F7"
			}
		}
	});
}

// 以下为UI封装------------------------------------------------------------------------------
// nativeui相关
hao.t.tip = function(msg, options) {
	plus.nativeUI.toast(msg, options);
};
hao.t.waiting = function(titile, options) {
	plus.nativeUI.showWaiting(titile, options);
};
hao.t.closeWaiting = function() {
	plus.nativeUI.closeWaiting();
};

// popover
hao.t.pop = function() {
	mui('.mui-popover').popover('toggle');
};

// actionsheet
hao.t.sheet = function(title, btns, func) {
	if(title && btns && btns.length > 0) {
		var btnArray = [];
		for(var i = 0; i < btns.length; i++) {
			btnArray.push({
				title: btns[i]
			});
		}

		plus.nativeUI.actionSheet({
			title: title,
			cancel: '取消',
			buttons: btnArray
		}, function(e) {
			if(func) func(e);
		});
	}
};

// 提示框相关
hao.t.modaloptions = {
	title: 'title',
	abtn: '确定',
	cbtn: ['确定', '取消'],
	content: 'content'
};
hao.t.alert = function(options, ok) {
	var opt = $.extend({}, hao.t.modaloptions);

	opt.title = '提示';
	if(typeof options == 'string') {
		opt.content = options;
	} else {
		$.extend(opt, options);
	}

	plus.nativeUI.alert(opt.content, function(e) {
		if(ok) ok();
	}, opt.title, opt.abtn);
};
hao.t.confirm = function(options, ok, cancel) {
	var opt = $.extend({}, hao.t.modaloptions);

	opt.title = '确认操作';
	if(typeof options == 'string') {
		opt.content = options;
	} else {
		$.extend(opt, options);
	}

	plus.nativeUI.confirm(opt.content, function(e) {
		var i = e.index;
		if(i == 0 && ok) ok();
		if(i == 1 && cancel) cancel();
	}, opt.title, opt.cbtn);
};
hao.t.prompt = function(options, ok, cancel) {
	var opt = $.extend({}, hao.t.modaloptions);

	opt.title = '输入内容';
	if(typeof options == 'string') {
		opt.content = options;
	} else {
		$.extend(opt, options);
	}

	plus.nativeUI.prompt(opt.content, function(e) {
		var i = e.index;
		if(i == 0 && ok) ok(e.value);
		if(i == 1 && cancel) cancel(e.value);
	}, opt.title, opt.content, opt.cbtn);
};

// 以下为插件封装------------------------------------------------------------------------------
// 本地存储相关
hao.t.length = function() {
	return plus.storage.getLength();
};
hao.t.key = function(i) {
	return plus.storage.key(i);
};
hao.t.getItem = function(key) {
	if(key) {
		for(var i = 0; i < hao.t.length(); i++) {
			if(key == plus.storage.key(i)) {
				return plus.storage.getItem(key);
			}
		};
	}

	return null;
};
hao.t.insertItem = function(key, value) {
	plus.storage.setItem(key, value);
};
hao.t.delItem = function(key) {
	plus.storage.removeItem(key);
};
hao.t.clear = function() {
	plus.storage.clear();
};

// web sql
hao.t.db = function(name, size) {
	var db_name = name ? name : 'db_test';
	var db_size = size ? size : 2;

	return openDatabase(db_name, '1.0', 'db_test', db_size * 1024 * 1024);
};
hao.t.update = function(db, sql) {
	if(db && sql) db.transaction(function(tx) {
		tx.executeSql(sql);
	});
};
hao.t.query = function(db, sql, func) {
	if(db && sql) {
		db.transaction(function(tx) {
			tx.executeSql(sql, [], function(tx, results) {
				func(results);
			}, null);
		});
	}
};

// 以下为功能封装------------------------------------------------------------------------------
// 退出
hao.t.exit = function() {
	hao.t.confirm('确定要退出吗？', function() {
		plus.runtime.quit();
	});
};
// 刷新
hao.t.endDown = function(selector) {
	var sel = selector ? selector : '#refreshContainer';
	mui(sel).pullRefresh().endPulldownToRefresh();
};