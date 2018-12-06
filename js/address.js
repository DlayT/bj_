mui.init({
	subpages: [{
		url: 'addresslist.html', //子页面HTML地址，支持本地地址和网络地址
		id: 'addresslist', //子页面标志
		styles: {
			top: '45px', //mui标题栏默认高度为45px；
			bottom: '0px' //默认为0px，可不定义；
		}
	}]

});

hao.on('#addAddress', 'tap', function() {
	hao.t.open('add');
});

var db = hao.t.db();

var dbCallBack = function(data) {

};

hao.t.query(db, 'CREATE TABLE IF NOT EXISTS notepad (id  INTEGER NOT NULL PRIMARY KEY   AUTOINCREMENT, name  char(100) NOT NULL,phone  TEXT NOT NULL,city TEXT NOT NULL,street TEXT NOT NULL)', dbCallBack);