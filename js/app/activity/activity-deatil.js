var content;
var packeages = new Array();
// 初始化页面
$(function() {
    require(['session'], function(session) {
        showLoading();
        loadVenueInfoPageData(session);
    })
})
function loadVenueInfoPageData(session, complete) {
    
    var queryObj = getQueryString();
    var activityId = queryObj.activityId;
    isLogin = session.islogin();
    var param = {
        token: session.token(),
        venueId: activityId
    }
    
    bjcpost('/Report/venueInfo.html', param, function(responseData, error) {
        if(responseData) {
            responseData.activityId = activityId;
            initContent(responseData);
        }
        $('.mui-content').show();
        if(complete) {
            complete();
        }
        hideLoading();
    })
}
//$('#callVenue').on('click', function() {
//	dialPhone('073196255');
	//	if(plus.os.name == 'Android') {
	//		var Intent = plus.android.importClass("android.content.Intent");
	//		var Uri = plus.android.importClass("android.net.Uri");
	//		var main = plus.android.runtimeMainActivity();
	//		var uri = Uri.parse("tel:073196255");
	//		var call = new Intent("android.intent.action.CALL", uri);
	//		main.startActivity(call);
	//	} else {
	//		var UIAPP = plus.ios.importClass("UIApplication");
	//		var NSURL = plus.ios.importClass("NSURL");
	//		var app = UIAPP.sharedApplication();
	//		app.openURL(NSURL.URLWithString("tel://" + 96255));
	//	}
//})

function initContent(web){
	content = document.getElementById('venuecontent');
	require(['session'], function(session) {
		activityId = web.activityId;
		document.getElementById('vunenName').innerHTML = web.name;
		var coordinates = new Array();
		if(web.coordinate && web.coordinate.length != 0) {
			coordinates = web.coordinate.split(",");
		}

		if(web.address&&web.address.length == 0) {
			document.getElementById('venueAddress').innerHTML = '场馆方暂未填写地址';
			document.getElementById('venueAddressTop').innerHTML = '场馆方暂未填写地址';
		} else {
			document.getElementById('venueAddress').innerHTML = web.address;
			document.getElementById('venueAddressTop').innerHTML = web.address;
		}
		var venueAddress = web.address;
		document.getElementById('venuepic').src = web.thumb;
		document.getElementById('venuedate').innerHTML = '活动开始时间：' + web.start_time;
		document.getElementById('funnyprice').innerHTML = '￥' + web.price;
		if(web.valid == 0) { //0活动已结束，1活动进行中
			$('#payBtn').html('活动结束');
			$('#payBtn').css("background-color", "#777777");
		} else {
			if(web.reminder_quantity == 0) { //reminder_quantity库存
				$('#payBtn').html('报名已满');
				$('#payBtn').css("background-color", "#777777");
			}
		}
		var param = {
			'token': session.token(),
			'venueId': activityId
		}

		bjpost('/Report/venueContent.html', param, function(responseData) {
			if(responseData.package_list) {
				packeages = responseData.package_list; //套餐列表 里面有套餐书面
			}
			content.innerHTML = responseData.content;
		}, function(error) {
			mui.toast(error);
		})

		//场馆预约或者套餐
		$('#payBtn').on('click', function() {
			if(web.valid == 0) {
				mui.toast('活动已结束');
				return;
			} else if(web.reminder_quantity == 0) {
				mui.toast('活动报名已满');
				return;
			} else {
				if(!session.islogin()) { //如果没有登录
					presentToController('/login/login.html', '登录');
					return false;
				} else {
					var param = {
						activityId: activityId
					};
					pushToExtrasController('/activity/activity.prepare.html?activityId='+web.activityId, '预约活动', param);
				}
			}

		})

		//趣玩价 这个功能暂时被隐藏
//		$('#funnyprice').on('click', function() {
//			if(!session.islogin()) { //如果没有登录
//				presentToController('/login/login.html', '登录');
//				return false;
//			} else {
//				var param = {
//					venueId: web.venueId
//				};
//				pushToExtrasController('/vunue/venue.funnyprepare.html', '预约场馆', param);
//			}
//		})

		//底部地址点击
		$('#venueNavigation').on('tap', function() {
			if(coordinates.length == 0 && venueAddress.length == 0) {
				return;
			}
			mui('#picker').popover('toggle');
		})

		//顶部地址点击
		$('#navigationBtn').on('tap', function() {
		    if(coordinates.length == 0 && venueAddress.length == 0) {
                return;
            }
            mui('#picker').popover('toggle');
		})

		//选择地图的回调事件
		mui('body').on('tap', '.mui-popover-action li>a', function() {
			var a = this,
				parent;
			//根据点击按钮，反推当前是哪个actionsheet
			for(parent = a.parentNode; parent != document.body; parent = parent.parentNode) {
				if(parent.classList.contains('mui-popover-action')) {
					break;
				}
			}
			//关闭actionsheet
			mui('#' + parent.id).popover('toggle');

			if(a.innerHTML == '百度地图') {
				openBMap(web.address, coordinates);
			} else if(a.innerHTML == '高德地图') {
				openAMap(web.address, coordinates);
			} else if(a.innerHTML == '苹果地图') {
				openSysMap(web.address, coordinates)
			} else {

			}
		})

	})

}