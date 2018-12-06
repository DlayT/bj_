var phone;
var code;
var psw;
var pswagin;
var subBtn;

$(function() {
	phone = document.getElementById('phone');
	code = document.getElementById('code');
	psw = document.getElementById('psw');
	pswagin = document.getElementById('pswagin');
	subBtn = document.getElementById('changeBtn');

	require(['session'], function(session) {

		$('#changeBtn').on('click', function() {
            var that = this;
			if(phone.value.length == 0) {
				mui.toast('请输入手机号码');
				return false;
			}
			if(!isMobile(phone.value)) {
				mui.toast('请输入正确的手机号码');
				return false;
			}
			if(code.value == 0) {
				mui.toast('请输入验证码');
				return false;
			}
			if(psw.value == 0) {
				mui.toast('请输入密码');
				return false;
			}
			if(pswagin.value == 0) {
				mui.toast('请确认密码');
				return false;
			}
			if(psw.value != pswagin.value) {
				mui.toast('两次输入的密码不一致');
				return false;
			}
			var param = {
				'catpcha': code.value,
				'name': phone.value,
				'password': psw.value
			};
			mui(that).button('loading');
			bjpost('/User/resetPassword.html', param, function(responseData) {
				session.handleLoginSuccess(responseData);
				mui.toast('修改成功');
				mui.later(function(){
				    presentToController('/login/login.html', '登录');
				},500)
			}, function(error) {
			    mui(that).button('reset');
				mui.toast(error);
			});
		})
	})
})

//60秒之后获取验证码
var wait = 60;
var issend = true;

//开始倒计时
function startCountDown () {
	
}

function time(obj) {
	if(issend) {
		issend = false; //能不能发送
		bjpost('/Common/sendSms.html', {
			'mobile': phone.value
		}, function(response) {
			mui.toast('发送成功');
			console.log(response);
		},function(error){
			console.log(error);
			mui.toast(error);	
			wait = 0;
		}) 
	}

	if(wait == 0) {
		issend = true;
		obj.removeAttribute("disabled");
		obj.innerHTML = "获取验证码";
		wait = 60;
	} else {
		obj.setAttribute("disabled", true);
		obj.innerHTML = wait + "秒";
		wait--;
		setTimeout(function() {
			time(obj)
		}, 1000)
	}

}