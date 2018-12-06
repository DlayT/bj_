var content;
$(function() {
    require(['session'], function(session) {
        showLoading();
        loadVenueInfoPageData(session);
    })
})

function loadVenueInfoPageData(session, complete) {
    
    var queryObj = getQueryString();
    var venueId = queryObj.id;
    isLogin = session.islogin();
    var param = {
        token: session.token(),
        venueId: venueId
    }
    bjcpost('/Venue/venueInfo.html', param, function(responseData, error) {
  	  	hideLoading();
        if(responseData) {
            responseData.venueId = venueId;
            initContent(responseData);
        }
        if(complete) {
            complete();
        }
    })
}


function initContent(web) {
	content = document.getElementById('venuecontent');
	require(['session'], function(session) {
		//		wflog(web);
		var coordinates = new Array();
		if(web.coordinate.length != 0) {
			coordinates = web.coordinate.split(",");
		}
		if(web.address.length == 0) {
			document.getElementById('venueAddress').innerHTML = '场馆方暂未填写地址';
			document.getElementById('venueAddressTop').innerHTML = '场馆方暂未填写地址';
		} else {
			document.getElementById('venueAddress').innerHTML = web.address;
			document.getElementById('venueAddressTop').innerHTML = web.address;
		}
		var venueAddress = web.address;

		document.getElementById('venuepic').src = web.thumb;
		document.getElementById('venuedate').innerHTML = '预约开始时间：' + web.start_time;
		var param = {
			'token': session.token(),
			'venueId': web.venueId
		}
		//		wflog(param);
		bjpost('/Venue/venueContent.html', param, function(responseData) {
			//			wflog(responseData);
			content.innerHTML = responseData.content;
			hideLoading();
			$(".mui-content").show();
		}, function(error) {
			hideLoading();
			mui.toast(error);
		})

		//底部地址点击
		$('#venueNavigation').on('tap', function() {
			if(coordinates.length == 0 && address.length == 0) {
				return;
			}
			if(mui.os.android) {
				openSysMap(coordinates)
			} else {
				mui('#picker').popover('toggle');
			}
		})
		//顶部地址点击
		$('#navigationBtn').on('tap', function() {
			if(coordinates.length == 0 && address.length == 0) {
				return;
			}
			if(mui.os.android) {
				openSysMap(coordinates)
			} else {
				mui('#picker').popover('toggle');
			}
		})

		//选择地图的回调事件
		mui('body').on('tap', '.mui-popover-action li>a', function() {
			var a = this,parent;
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
			}else if(a.innerHTML == '苹果地图') {
				openSysMap(web.address, coordinates)
			}else {
				
			}
		})
	})

	$('#callVenue').on('click', function() {
		if(mui.os.ios) {
			console.log('ios打电话。。。');
			var UIAPP = plus.ios.importClass("UIApplication");
			var NSURL = plus.ios.importClass("NSURL");
			var app = UIAPP.sharedApplication();
			app.openURL(NSURL.URLWithString("tel://" + 073196255));
		} else {
			console.log('android打电话。。。');
			var Intent = plus.android.importClass("android.content.Intent");
			var Uri = plus.android.importClass("android.net.Uri");
			var main = plus.android.runtimeMainActivity();
			var uri = Uri.parse("tel:073196255");
			var call = new Intent("android.intent.action.CALL", uri);
			main.startActivity(call);
		}
	})
}