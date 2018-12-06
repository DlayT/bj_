var title;

require(['session'], function(session) {
	showLoading();
	loadQuestions(title);
});

function loadQuestions(title) {
	var param = {
		title: title, //问题名称，可传可不传。
	};

	bjpost('/Questions/lists.html', param, function(questions) {
		wflog(questions);
		if(questions && questions.length == 0) {
			showEmpty();
			return;
		}
		initQuestions(questions);
		hideLoading();
	})
}

function initQuestions(questions) {
	var items = new Array();
	$.each(questions, function(index, value) {
		var item = {
			questionId: value.id,
			questionTitle: value.title,
			questionContent: value.content,
			desc: value.desc,
			is_hot_text: value.is_hot_text,
			status: value.status
		};
		items.push(item);
	});
	var myquestions = template('tmp_questions', {
		'result': items
	});
	$("#questionlist").html(myquestions);
}

mui('.mui-table-view').on('tap', '.mui-table-view-cell', function(event) {
	var question = JSON.parse(this.getAttribute('id'));
	sessionStorage.setItem('questiondetail',JSON.stringify(question));
	pushToExtrasController('/user/user.questiondetail.html', '问题详情', question);
})