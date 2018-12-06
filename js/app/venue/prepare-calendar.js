var calendars = null;
var selectedDate = null;
var type;
document.getElementById('currentDate').innerHTML = '今日日期' + getCurrentDate();
$('#btn').click(function() {
	var web = getQueryString();
	type = web.venueType;
//	var page1 = plus.webview.getWebviewById('venue.prepare.html');
//	var page2 = plus.webview.getWebviewById('venue-prepare-package.html');
	if(!selectedDate){
	    mui.toast('请选择日期');
	    return;
	}
	sessionStorage.setItem('calendar', selectedDate.day);
	mui.back();
})

$(function() {
    require(['session'], function(session) {
        var web = getQueryString();
        var id = web.venueId;
        type = web.venueType;
        var param = {
            'token': session.token(),
            'venueId': id

        }
        showLoading();
        bjcpost('/Venue/venueDayList.html', param, function(responseData, error) {
            
            if(responseData) {
                calendars = responseData;
                initCalendarList(calendars);
            } else {
                mui.toast(error);
            }
            hideLoading();
        })
    })
})
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

	$(this).find('.calendar-check-img').css('display', 'block');
	$(this).siblings().find('.calendar-check-img').css('display', 'none');
});