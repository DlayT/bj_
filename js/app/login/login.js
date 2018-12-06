mui.init({
	swipeBack: true
});
var account;
var psd;
var login;
var register;
var repsd;
var pagefrom = '';
var openid ;
if (mui.os.wechat) {
	openid = getOpenid();
}

$(function() {
    require(['session'], function(session) {
    	console.log(session.token());
    	pagefrom = document.referrer;
    	account = document.querySelector('input[type="number"]');
    	psd = document.querySelector('input[type="password"]');
    	login = document.getElementById('loginBtn');
    	register = document.getElementById('registerBtn');
    	repsd = document.getElementById('repsd');
    	//检测本地的登录过的账号。
    	if(localStorage.getItem('account')) {
    		account.value = localStorage.getItem('account');
    	}
    	//登陆的点击事件
    	login.addEventListener('tap', function() {
    	    var that = this;
    		if(account.value.length == 0) {
    			mui.toast('请输入手机号码');
    			return false;
    		}
    		if(!isMobile(account.value)) {
    			mui.toast('请输入正确的手机号码');
    			return false;
    		}
    		if(psd.value == 0) {
    			mui.toast('请输入密码');
    			return false;
    		}
    		mui(that).button('loading');
    //		var oper = plus.webview.currentWebview().opener();
    		var param = {
    			'name': account.value,
    			'password': psd.value,
    			'openid': openid
    		};
    		
    		bjpost('/User/login.html', param, function(responseData) {
    			session.handleLoginSuccess(responseData);
    //				handleUserInfoChangedSignal(oper);
    			//加一个定时器避免白屏
    			mui.toast('登录成功');
    			mui.later(function() {
				mui.back();
    			}, 500)
    		}, function(error) {
    			mui(that).button('reset');
    			mui.toast(error);
    		});
    		
    
    	}, false);
    	//注册按钮的点击事件
    	register.addEventListener('tap', function() {
    	    presentToController('/login/register.html', '注册');
    	}, false);
    	//注册按钮的点击事件
    	repsd.addEventListener('tap', function() {
    	    presentToController('/login/changepassword.html', '修改密码');
    	}, false);
    })
});