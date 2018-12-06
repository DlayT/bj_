//资源升级
//mui.plusReady(function() {
//	// Android处理返回键 暂时不懂
//	plus.key.addEventListener('backbutton', function() {
//		if(confirm('确认退出？')) {
//			plus.runtime.quit();
//		}
//	}, false);
//})

function showUpdatePage(updator) {
	mui.openWindow({
		id: 'update',
		url: 'project/app/bjcz.update.html',
		styles: {
			popGesture: "none",
		},
		show: {
			aniShow: 'none'
		},
		waiting: {
			autoShow: false
		},
		extras: updator
	});
}

function checkUpdate() {
	console.log('正在检测更新');
	bjcpost('/Common/update.html', {}, function(updateinfo, error) {
		if(updateinfo) {
			wflog(updateinfo);
			plus.runtime.getProperty(plus.runtime.appid, function(inf) {
				wgtVer = inf.version; //本地版本
				var updator = mui.os.ios ? updateinfo.ios : updateinfo.android;
				var newVer = updator.version;
				wflog(updator);
				if(wgtVer && newVer && (wgtVer < newVer)) {
					var update_msg = updator.desc ? updator.desc : '系统有新的更新内容';
					if(updator.force == true) {
						console.log("正在下载资源包");
						showUpdatePage(updator);
					} else {
						//弹出有新的资源是否立即更新
						if(mui.os.android) { //只有安卓才会提示，苹果只存在强制更新，
							var bts = ["是", "否"];
							plus.nativeUI.confirm(update_msg, function(e) {
								var i = e.index;
								if(i == 0) {
									showUpdatePage(updator);
								}
							}, "更新提示", bts);
						}
					}
				}

			});
		} else {
			wflog(error);
		}
	});
}