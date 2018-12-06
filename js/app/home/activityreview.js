require(['session'], function(session) {
    showLoading();
    loadActivitys(session);
    mui('#activityreviews').on('tap', '.mui-table-view-cell', function(){
        var report_id = $(this).data('id');
        pushToExtrasController('/home/activityreviewdetail.html?id=' + report_id, '活动详情');
    })
})

function loadActivitys(session) {
    bjpost('/History/lists.html', {
        token: session.token()
    }, function(activitys) {
        if(activitys && activitys.length == 0) {
            showEmpty();
            return;
        }
        initActivitys(activitys);
        hideLoading();
    }, function(error) {
        hideLoading();
        mui.toast(error);
    })
}

function initActivitys(activitys) {
    var items = new Array();
    $.each(activitys, function(index, value) {
        var item = {
            activityId: value.id,
            report_id: value.report_id,
            activityTitle: value.title,
            questionContent: value.content,
            author: value.author,
            name: value.name,
            pictrue: createImgPath(value.thumbnail_url),
            status: value.status
        };
        items.push(item);
    });
    var myactivitys = template('tmp_activitylist', {
        'result': items
    });
    $("#activityreviews").html(myactivitys);
}