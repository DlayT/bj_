require(['jquery', 'cssjs', 'mui'], function($, a, mui) {
//	var subpages = ['../home/home.html'];
	var subpages = ['../home/home.html', '../activity/card.index.html', '../mall/mall.html', '../user/userinfo.html'];
	var subpage_style = [{
		top: '0px',
		bottom: '51px'
	},{
		top: '0px',
		bottom: '51px'
	},{
		top: '0px',
		bottom: '51px'
	},{
		top: '0px',
		bottom: '51px'
	},];

	var aniShow = {};

	//创建子页面，首个选项卡页面显示，其它均隐藏；
	mui.plusReady(function() {
		var self = plus.webview.currentWebview();
		//发现的mui的bug 首先清除掉之前创建的子窗口
		for (var i = 0; i < self.children().length ; i++) {
			var web = self.children()[i];
			self.remove(web);
		}
		
		for(var i = 0; i < 4 ; i++) {
			var temp = {};
			var sub = plus.webview.create(subpages[i], subpages[i], subpage_style[i]);
			if(i > 0) {
				sub.hide();
			} else {
				temp[subpages[i]] = "true";
				mui.extend(aniShow, temp);
			}
			self.append(sub);
		}

	});
	//当前激活选项
	var activeTab = subpages[0];
	var title = document.getElementById("title");
	//选项卡点击事件
	mui('.mui-bar-tab').on('tap', 'a', function(e) {
		var targetTab = this.getAttribute('href');
		if(targetTab == activeTab) {
			return;
		}
		//更换标题
//		title.innerHTML = this.querySelector('.mui-tab-label').innerHTML;
		//显示目标选项卡
		//若为iOS平台或非首次显示，则直接显示
		if(mui.os.ios || aniShow[targetTab]) {
			plus.webview.show(targetTab);
		} else {
			//否则，使用fade-in动画，且保存变量
			var temp = {};
			temp[targetTab] = "true";
			mui.extend(aniShow, temp);
			plus.webview.show(targetTab, "fade-in", 300);
		}
		//隐藏当前;
		plus.webview.hide(activeTab);
		//更改当前活跃的选项卡
		activeTab = targetTab;
	});

		//动态设置状态栏的背景
		mui.plusReady(function() {
			plus.navigator.setStatusBarBackground("#009BFD");
			plus.navigator.setStatusBarStyle('light');
		})
});