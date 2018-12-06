require(['jquery'], function($) {
	var width = $(document.body).width();
	width = window.screen.availWidth
	var height = width * (200 / 320.);
	$('.user-header').height(height)
	$('.user-header').width(width)

	mui.init({
		swipeBack: true //启用右滑关闭功能
	});

});

function bjcz() {
	pushToUrlController('http://bjcz.app.wufangedu.com:18081/WFvendition/design/book/index.html', '关于我们');
}

//动态设置状态栏的背景
//mui.plusReady(function() {
(function() {
	//	plus.navigator.setStatusBarBackground("#009BFD");
	//	plus.navigator.setStatusBarStyle('light');
	if(mui.os.ios) {
		$('#updatecell').hide();
	}
	require(['session'], function(session) {
		//点击用户头像 跳转个人信息
		document.getElementById("userAvator").addEventListener('tap', function() {
			if(session.islogin()) {
				mui.openWindow({
					url: bj_webpath + '/user/user.personal.html',
					id: 'user.personal.html',
				});
			} else {
				mui.openWindow({
					url: bj_webpath + '/login/login.html',
					id: 'login.html',
					styles: { // 窗口参数 参考5+规范中的WebviewStyle,也就是说WebviewStyle下的参数都可以在此设置
						titleNView: { // 窗口的标题栏控件
							autoBackButton: true,
							titleText: '登录', // 标题栏文字,当不设置此属性时，默认加载当前页面的标题，并自动更新页面的标题
							titleColor: "#ffffff", // 字体颜色,颜色值格式为"#RRGGBB",默认值为"#000000"
							titleSize: "17px", // 字体大小,默认17px
							backgroundColor: "#009BFD", // 控件背景颜色,颜色值格式为"#RRGGBB",默认值为"#F7F7F7"
						}
					}
				});
			}
		});

		//我的资料
		document.getElementById("personalmsgBtn").addEventListener('tap', function() {
			if(session.islogin()) {
				mui.openWindow({
					url: bj_webpath + '/user/user.personal.html',
					id: 'user.personal.html',
				});
			} else {
				mui.openWindow({
					url: bj_webpath + '/login/login.html',
					id: 'login.html',
					styles: { // 窗口参数 参考5+规范中的WebviewStyle,也就是说WebviewStyle下的参数都可以在此设置
						titleNView: { // 窗口的标题栏控件
							autoBackButton: true,
							titleText: '登录', // 标题栏文字,当不设置此属性时，默认加载当前页面的标题，并自动更新页面的标题
							titleColor: "#ffffff", // 字体颜色,颜色值格式为"#RRGGBB",默认值为"#000000"
							titleSize: "17px", // 字体大小,默认17px
							backgroundColor: "#009BFD", // 控件背景颜色,颜色值格式为"#RRGGBB",默认值为"#F7F7F7"
						}
					}
				});
			}

		})
		//激活百纪卡
		document.getElementById("bind-card").addEventListener('tap', function() {
			//			if(session.islogin()) {
			mui.openWindow({
				url: bj_webpath + '/user/user.bindcard.html',
				id: '/user/user.bindcard.html',
				styles: {
					titleNView: { // 窗口的标题栏控件
						autoBackButton: true,
						titleText: '激活百纪卡', // 标题栏文字,当不设置此属性时，默认加载当前页面的标题，并自动更新页面的标题
						titleColor: "#ffffff", // 字体颜色,颜色值格式为"#RRGGBB",默认值为"#000000"
						titleSize: "17px", // 字体大小,默认17px
						backgroundColor: "#009BFD", // 控件背景颜色,颜色值格式为"#RRGGBB",默认值为"#F7F7F7"
						//							buttons: [{
						//								text: '保存',
						//								float: 'right',
						//								fontSize: '15px',
						//								onclick: clickSave
						//							}]
					}
				}
			});
			//			} else {
			//				mui.openWindow({
			//					url: '../login/login.html',
			//					id: 'login.html',
			//					styles: { // 窗口参数 参考5+规范中的WebviewStyle,也就是说WebviewStyle下的参数都可以在此设置
			//						titleNView: { // 窗口的标题栏控件
			//							autoBackButton: true,
			//							titleText: '登录', // 标题栏文字,当不设置此属性时，默认加载当前页面的标题，并自动更新页面的标题
			//							titleColor: "#ffffff", // 字体颜色,颜色值格式为"#RRGGBB",默认值为"#000000"
			//							titleSize: "17px", // 字体大小,默认17px
			//							backgroundColor: "#009BFD", // 控件背景颜色,颜色值格式为"#RRGGBB",默认值为"#F7F7F7"
			//						}
			//					}
			//				});
			//			}
		});
		//我的预约
		$('#myPrepare').on('click', function() {
			//			alert(1);
			if(session.islogin()) {
				pushToController('/user/user.prepare.html', '我的预约');
			} else {
				pushToWebController('/login/login.html', '登录');
			}
		});
		//		常见问题
		$('#question').on('click', function() {
			//			alert(1);
			pushToController('/user/user.question.html', '常见问题');
		});

		/**
		 * 我的年卡
		 */
		document.getElementById("myYearCard").addEventListener('tap', function() {
			if(session.islogin()) {
				mui.openWindow({
					url: bj_webpath + '/user/user.card.html',
					id: 'user.card',
					styles: { // 窗口参数 参考5+规范中的WebviewStyle,也就是说WebviewStyle下的参数都可以在此设置
						titleNView: { // 窗口的标题栏控件
							autoBackButton: true,
							titleText: '我的卡包', // 标题栏文字,当不设置此属性时，默认加载当前页面的标题，并自动更新页面的标题
							titleColor: "#ffffff", // 字体颜色,颜色值格式为"#RRGGBB",默认值为"#000000"
							titleSize: "17px", // 字体大小,默认17px
							backgroundColor: "#009BFD", // 控件背景颜色,颜色值格式为"#RRGGBB",默认值为"#F7F7F7"
						}
					}
				});
			} else {
				mui.openWindow({
					url: bj_webpath + '/login/login.html',
					id: 'login.html',
					styles: { // 窗口参数 参考5+规范中的WebviewStyle,也就是说WebviewStyle下的参数都可以在此设置
						titleNView: { // 窗口的标题栏控件
							autoBackButton: true,
							titleText: '登录', // 标题栏文字,当不设置此属性时，默认加载当前页面的标题，并自动更新页面的标题
							titleColor: "#ffffff", // 字体颜色,颜色值格式为"#RRGGBB",默认值为"#000000"
							titleSize: "17px", // 字体大小,默认17px
							backgroundColor: "#009BFD", // 控件背景颜色,颜色值格式为"#RRGGBB",默认值为"#F7F7F7"
						}
					}
				});
			}
		});

		/**
		 * 我的消息
		 */
		document.getElementById("myMessage").addEventListener('tap', function() {
			if(session.islogin()) {
				mui.openWindow({
					url: bj_webpath + '/user/user.message.html',
					id: 'user.message.html',
					styles: { // 窗口参数 参考5+规范中的WebviewStyle,也就是说WebviewStyle下的参数都可以在此设置
						titleNView: { // 窗口的标题栏控件
							autoBackButton: true,
							titleText: this.innerText, // 标题栏文字,当不设置此属性时，默认加载当前页面的标题，并自动更新页面的标题
							titleColor: "#ffffff", // 字体颜色,颜色值格式为"#RRGGBB",默认值为"#000000"
							titleSize: "17px", // 字体大小,默认17px
							backgroundColor: "#009BFD", // 控件背景颜色,颜色值格式为"#RRGGBB",默认值为"#F7F7F7"
							progress: { // 标题栏控件的进度条样式
								color: "#00FF00", // 进度条颜色,默认值为"#00FF00"  
								height: "1px" // 进度条高度,默认值为"2px"         
							},
							splitLine: { // 标题栏控件的底部分割线，类似borderBottom
								color: "#CCCCCC", // 分割线颜色,默认值为"#CCCCCC"  
								height: "1px" // 分割线高度,默认值为"2px"
							}
						}
					}
				});
			} else {
				mui.openWindow({
					url: bj_webpath + '/login/login.html',
					id: 'login.html',
					styles: { // 窗口参数 参考5+规范中的WebviewStyle,也就是说WebviewStyle下的参数都可以在此设置
						titleNView: { // 窗口的标题栏控件
							autoBackButton: true,
							titleText: '登录', // 标题栏文字,当不设置此属性时，默认加载当前页面的标题，并自动更新页面的标题
							titleColor: "#ffffff", // 字体颜色,颜色值格式为"#RRGGBB",默认值为"#000000"
							titleSize: "17px", // 字体大小,默认17px
							backgroundColor: "#009BFD", // 控件背景颜色,颜色值格式为"#RRGGBB",默认值为"#F7F7F7"
						}
					}
				});
			}
		});

		/**
		 * 我的订单
		 */
		document.getElementById("myOrder").addEventListener('tap', function() {
			//			alert(1);
			if(session.islogin()) {
				pushToWebController('/order/myVenueOrder.html', '我的订单');
				return;

				mui.openWindow({
					url: '/order/myorder.html',
					id: 'myorder.html',
					styles: { // 窗口参数 参考5+规范中的WebviewStyle,也就是说WebviewStyle下的参数都可以在此设置
						titleNView: { // 窗口的标题栏控件
							autoBackButton: true,
							titleText: '我的订单', // 标题栏文字,当不设置此属性时，默认加载当前页面的标题，并自动更新页面的标题
							titleColor: "#ffffff", // 字体颜色,颜色值格式为"#RRGGBB",默认值为"#000000"
							titleSize: "17px", // 字体大小,默认17px
							backgroundColor: "#009BFD", // 控件背景颜色,颜色值格式为"#RRGGBB",默认值为"#F7F7F7"
						}
					}
				});
			} else {
				mui.openWindow({
					url: bj_webpath + '/login/login.html',
					id: 'login.html',
					styles: { // 窗口参数 参考5+规范中的WebviewStyle,也就是说WebviewStyle下的参数都可以在此设置
						titleNView: { // 窗口的标题栏控件
							autoBackButton: true,
							titleText: '登录', // 标题栏文字,当不设置此属性时，默认加载当前页面的标题，并自动更新页面的标题
							titleColor: "#ffffff", // 字体颜色,颜色值格式为"#RRGGBB",默认值为"#000000"
							titleSize: "17px", // 字体大小,默认17px
							backgroundColor: "#009BFD", // 控件背景颜色,颜色值格式为"#RRGGBB",默认值为"#F7F7F7"
						}
					}
				});
			}
		});

		if(session.islogin()) {
			document.getElementById("user-nick").innerHTML = session.nick_name();
			document.getElementById("userAvator").src = session.user_avator();
		} else {
			document.getElementById("user-nick").innerHTML = '未登录';
		}
		//检查更新
		$('#updatecell').on('click', function() {
			plus.nativeUI.showWaiting('正在检查最新版本');
			setTimeout(function() {
				plus.runtime.getProperty(plus.runtime.appid, function(inf) {
					var param = {
						'token': session.token(),
						'version': inf.version
					}
					wflog(param);
					bjpost('/Common/checkUpdate.html', param, function(responseData) {
						wflog(responseData);
						plus.nativeUI.closeWaiting();
						if(responseData.update == 1) {
							var btnArray = ['是', '否'];

							mui.confirm('最新版本是：' + responseData.version + ',是否更新', '发现最新版本', btnArray, function(z) {
								if(z.index == 0) {
									var dtask = plus.downloader.createDownload(responseData.android_url, {}, function(d, status) {
										if(status == 200) { // 下载成功
											var path = d.filename;
											plus.runtime.install(path); // 安装下载的apk文件
										} else { //下载失败
											alert("Download failed: " + status);
										}
									});
									dtask.start();
								} else {
									return;
								}
							});
						} else {
							mui.toast('您已经是最新版本');
						}
					})
				})

			}, 1000);
		});

	});

})();

function clickSave(test) {
	var web = plus.webview.currentWebview();
	var string = JSON.stringify(test);
	plus.nativeUI.alert(string);
}

function savePersonalMsg() {

}

function clearCache() {
	mui.confirm('清除缓存成功', '提示');
	//pushToController('../vunue/consumer-package.html', '选择套餐');
}