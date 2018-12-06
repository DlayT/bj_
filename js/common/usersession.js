//用户类型
if(typeof WFUserType == "undefined") {　　　　　　　　　　　
	var WFUserType = {};　　　　　　　　　　　
	WFUserType.Student = 1;　　　　　　　　　　　
	WFUserType.Parent = 2;
	WFUserType.Teacher = 3;　　　　　
}

var kEduUserKey = 'kEduUserKey';

define(['storage'], function(storage) {
	var UserSession = (function() {

		var instantiated = null; //是否已经实例化

		function isNull(str) {
			if(!str || str == "" || str == "null" || str == "undefined") {
				return true;
			} else {
				return false;
			}
		};

		function init() {
			var _user = null;
			var _userstr = storage.getItem(kEduUserKey);
			if(_userstr) { //如果已经登录
				_user = JSON.parse(_userstr);
			}

			return {
				handleLoginSuccess: function(data) {
					console.log(data);
					_user = data;
					storage.removeItem(kEduUserKey);
					storage.setItem(kEduUserKey, JSON.stringify(data));
				},
				updateUserInfo: function(user) {
					_user.user = user;
					wflog(_user.user);
					storage.removeItem(kEduUserKey);
					storage.setItem(kEduUserKey, JSON.stringify(_user));
				},
				handleLoginOut: function() {
					_user = null;
					storage.removeItem(kEduUserKey);
				},
				user: _user,
			}
		}

		return {
			sharedInstance: function() {
				//if(!instantiated) {
				instantiated = init();
				//}
				return instantiated;
			},
			islogin: function() {
				return UserSession.sharedInstance().user != null;
			},
			handleLoginSuccess: function(data) {
				return UserSession.sharedInstance().handleLoginSuccess(data);
			},
			updateUserInfo: function(user) {
				console.log(user);
				return UserSession.sharedInstance().updateUserInfo(user);
			},
			handleLoginOut: function() {
				return UserSession.sharedInstance().handleLoginOut();
			},
			user: function() {
				return UserSession.sharedInstance().user ? UserSession.sharedInstance().user.user : {};
			},
			token: function() {
				return UserSession.islogin() ? UserSession.sharedInstance().user.token : '0';
			},
			access_token: function() {
				return UserSession.sharedInstance().user.token;
			},
			user_id: function() {
				return UserSession.user().id;
			},
			user_avator: function() {
				return UserSession.user().avatar;
			},
			nick_name: function() {
				return UserSession.user().nick_name;
			},
			mobile: function() {
				return UserSession.islogin() ? UserSession.user().mobile : '';;
			},
			gender: function() {
				return UserSession.user().gender;
			},
			true_name: function() {
				if(UserSession.user()) {
					return UserSession.user().true_name ? UserSession.user().true_name : '学生';
				} else {
					return '学生';
				}
			},
			is_bind_child: function() {
				return UserSession.user() ? Boolean(UserSession.user().have_child) : 0;
			},
			key: '我是value', //用于测试
		};

	})();
	return UserSession;
});