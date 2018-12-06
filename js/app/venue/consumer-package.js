var content;
var packeages = new Array();
var venueName;
var isLogin;
// 初始化页面
if(!mui.os.plus) {
    require(['session'], function(session) {
        loadVenueInfoPageData(session);
    })
}
function loadVenueInfoPageData(session, complete) {
    
    var queryObj = getQueryString();
    var venueId = queryObj.venueId;
    isLogin = session.islogin();
    var param = {
        token: session.token(),
        venueId: venueId
    }
    showLoading();
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
function initContent(web){
    var packageList = template('tmp_package', {
        'result': web.package_list
    });
    $("#packagelist").html(packageList);

    mui('.mui-table-view').on('tap', '.mui-table-view-cell', function(event) {
        var index = $(this).attr('id');
        var bj_package = web.package_list[index];
        bj_package.index = index;

        var popoverhtml = template('tmp_popover', {
            'result': bj_package
        });
        popoverhtml = he.decode(popoverhtml);
        //从上级页面传递过来的html 被转义了 所以需要解码
        $("#bottomPopover").html(popoverhtml);
        $("#bottomPopover").show();
    });

    mui('.mui-table-view').on('tap', '.buyBtn', function(event) {
        var index = $(this).parents('.mui-table-view-cell').attr('id');
        var bj_package = web.package_list[index];
        var param = {
            venueId: web.venueId,
            step: bj_package.cardinal_number,
            packageid: bj_package.id,
            package_price: bj_package.price,
            package_original_price: bj_package.original_price
        };
        var queryUrl = buildQueryString('/vunue/venue-prepare-package.html', param);
        pushToExtrasController(queryUrl, '预约场馆', param);
        event.preventDefault();
        event.stopPropagation();
    });

    //点击blur区域隐藏popover
    mui('.mui-content').on('tap', '.mui-fullscreen', function() {
        $(this).hide();
    })

    mui('.mui-content').on('tap', '.rightnow-footer-bar', function() {
        var param = {
            venueId: web.venueId
        };
        pushToExtrasController('/vunue/venue.prepare.html?venueId='+web.venueId, '预约场馆', param);
    })

    mui('.mui-content').on('tap', '.package-footer-bar', function() {
        var index = $(this).attr('id');
        var bj_package = web.package_list[parseInt(index)];
        var param = {
            venueId: web.venueId,
            step: bj_package.cardinal_number,
            packageid: bj_package.id,
            package_price: bj_package.price,
            package_original_price: bj_package.original_price
        };
        var queryUrl = buildQueryString('/vunue/venue-prepare-package.html', param);
        pushToExtrasController(queryUrl, '预约场馆', param);
    })
}
mui.plusReady(function() {
	var web = plus.webview.currentWebview();

	var packageList = template('tmp_package', {
		'result': web.package_list
	});
	$("#packagelist").html(packageList);

	mui('.mui-table-view').on('tap', '.mui-table-view-cell', function(event) {
		var index = $(this).attr('id');
		var bj_package = web.package_list[index];
		bj_package.index = index;

		wflog(bj_package);
		var popoverhtml = template('tmp_popover', {
			'result': bj_package
		});
		popoverhtml = he.decode(popoverhtml);
		wflog(popoverhtml)
		//从上级页面传递过来的html 被转义了 所以需要解码
		$("#bottomPopover").html(popoverhtml);
		$("#bottomPopover").show();
	});

	mui('.mui-table-view').on('tap', '.buyBtn', function(event) {
		var index = $(this).parents('.mui-table-view-cell').attr('id');
		var bj_package = web.package_list[index];
		var param = {
			venueId: web.venueId,
			step: bj_package.cardinal_number,
			packageid: bj_package.id,
			package_price: bj_package.price,
			package_original_price: bj_package.original_price
		};
		wflog(param);
		pushToExtrasController('../vunue/venue-prepare-package.html', '预约场馆', param);
		event.preventDefault();
		event.stopPropagation();
	});

	//点击blur区域隐藏popover
	mui('.mui-content').on('tap', '.mui-fullscreen', function() {
		$(this).hide();
	})

	mui('.mui-content').on('tap', '.rightnow-footer-bar', function() {
		var param = {
			venueId: web.venueId
		};
		pushToExtrasController('/vunue/venue.prepare.html?venueId='+web.venueId, '预约场馆', param);
	})

	mui('.mui-content').on('tap', '.package-footer-bar', function() {
		var index = $(this).attr('id');
		var bj_package = web.package_list[parseInt(index)];
		var param = {
			venueId: web.venueId,
			step: bj_package.cardinal_number,
			packageid: bj_package.id,
			package_price: bj_package.price,
			package_original_price: bj_package.original_price
		};
		pushToExtrasController('../vunue/venue-prepare-package.html', '预约场馆', param);
	})
});