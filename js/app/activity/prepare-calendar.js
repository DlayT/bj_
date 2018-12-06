var calendars = null;
var selectedDate = null;
var type;
document.getElementById('currentDate').innerHTML = '今日日期' + getCurrentDate();
$('#btn').click(function() {
	var web = plus.webview.currentWebview();
	type = web.venueType;
	var page1 = plus.webview.getWebviewById('activity.prepare.html');
	var page2 = plus.webview.getWebviewById('venue-prepare-package.html');
	console.log(type);
	if(type == 1) {
		mui.fire(page1, 'calendarDate', {
			calendar: selectedDate.day,
		});
	} else if(type == 2) {
		mui.fire(page2, 'calendarDate', {
			calendar: selectedDate.day,
		});
	}
	mui.back();
})

mui.plusReady(function() {
	require(['session'], function(session) {
		var web = plus.webview.currentWebview();
		var id = web.venueId;
		type = web.venueType;
		console.log("type:" + type);
		plus.nativeUI.showWaiting('正在加载...');
		var param = {
			'token': session.token(),
			'venueId': id

		}
		wflog(param);
		bjcpost('/Report/venueDayList.html', param, function(responseData, error) {
			plus.nativeUI.closeWaiting();
			if(responseData) {
				calendars = responseData;
				initCalendarList(calendars);
			} else {
				mui.toast(error);
			}
		})
	})

});

function initCalendarList(calendars) {
	var items = new Array();
	$.each(calendars, function(index, value) {
		var item = {
			date: value.day,
			week: value.week,
			quantity: value.quantity,
			day: value.day_index,
			selected: false
		};
		items.push(item);
	});
	wflog(items);
	var calendarList = template('calendargrid', {
		'result': items
	});
	$("#grid").html(calendarList);
}

$('body').on('tap', '.mui-table-view-cell', function(event) {

	var index = $(this).attr('id');

	if(selectedDate) {
		selectedDate.selected = false;
	}

	selectedDate = calendars[parseInt(index)];
	wflog(calendars);

	$(this).find('.calendar-check-img').css('display', 'block');
	$(this).siblings().find('.calendar-check-img').css('display', 'none');
});

if(!mui.os.plus) {
	require(['session'], function(session) {
		var param = {
			'token': session.token(),
			'venueId': 61
		}
		wflog(param);
		bjpost('/Venue/venueDayList.html', param, function(responseData) {
			calendars = responseData;
			initCalendarList(responseData);
		}, function(error) {
			mui.toast(error);
		})
	})
}