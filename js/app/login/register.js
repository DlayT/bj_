var phone;
var code;
var nick;
var psw;
var rigBtn;
//60秒之后获取验证码
var wait = 60;
var issend = true;
var openid = getOpenid();
function auto_login(name, password, that) {
	var param = {
		'name': name,
		'password': password,
		'openid': openid
	};
	require(['session'], function(session) {
		bjpost('/User/login.html', param, function(responseData) {
		    mui(that).button('reset');
			session.handleLoginSuccess(responseData);
//			handleUserInfoChangedSignal();
            mui.toast('登录成功');
			mui.later(function() {
				window.location.replace(bj_web_root+'/index.html');
			}, 500)
		}, function(error) {
		    mui(that).button('reset');
			mui.toast(error);
		});
	})

}

$(function() {
	phone = document.getElementById('phone');
	code = document.getElementById('code');
	nick = document.getElementById('nick');
	psw = document.getElementById('psw');
	rigBtn = document.getElementById('registerBtn');
	require(['session'], function(session) {
		$('#registerBtn').on('click', function() {
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
			if(nick.value == 0) {
				mui.toast('请输入昵称');
				return false;
			}
			if(psw.value == 0) {
				mui.toast('请输入密码');
				return false;
			}
			var param = {
				'mobile': phone.value,
				'catpcha': code.value,
				'nickName': nick.value,
				'password': psw.value
			};
			mui(that).button('loading');
			bjpost('/User/register.html', param, function(responseData) {
				auto_login(phone.value, psw.value, that);
			}, function(error) {
			    mui(that).button('reset');
				mui.toast(error);
			});
		})

	})

})

function time(obj) {
	var param = {
		'mobile': phone.value
	}
	if(issend) { //如果可以发送
		issend = false;
		bjpost('/Common/sendSms.html', param, function(response) {
			console.log(response);
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

function jumpToweb() {
	pushToWebController('/app/register.protocol.html', '用户注册协议');
}