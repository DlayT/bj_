//mui.plusReady(function() {

function getUserInfo(session) {
	var user_gender_string = document.getElementById("usersex").innerHTML;
	var user_gender = (user_gender_string == "女") ? 0 : 1;
	var user = {
		token: session.token(),
		trueName: document.getElementById("username").innerHTML,
		gender: user_gender,
		nickName: document.getElementById("usernickname").innerHTML,
		mobile: document.getElementById("userphone").innerHTML,
	};
	return user;
}

//初始化界面	 自执行函数
function saveUserInfo() {
	require(['session'], function(session) {
		var param = getUserInfo(session);
		bjcpost('/User/infoEdit.html', param, function(responseData, error) {
			if(!error) { //更新本地的用户信息
				updateUserInfo(session.token(), session);
			} else {
				mui.toast(error);
			}
		});
	});
}

function reloadPage(session) {
	console.log(session.user_avator());
	document.getElementById("avator").src = session.user_avator();
	document.getElementById("username").innerHTML = session.true_name();
	document.getElementById("usersex").innerHTML = session.gender() == 0 ? '女' : '男';
	document.getElementById("usernickname").innerHTML = session.nick_name();
	document.getElementById("userphone").innerHTML = session.mobile();
	document.getElementById("userBinderCell").innerHTML = session.is_bind_child() ? '已绑定' : '未绑定';
	if(isDevelopmentEnv) {
		$('#version').html('v' + bjversion + 'beta');
	} else {
		$('#version').html('v' + bjversion);
	}
}

mui.ready(function() {
	require(['session'], function(session) {
		showLoading();
		reloadPage(session);
		hideLoading();
	})
})

//jquery $ 表示 等页面加载完 才执行里面的代码
$(function() {
	require(['session'], function(session) {
		//上传头像
		document.getElementById('header').addEventListener('tap', function() {
			if(mui.os.plus) {
				var a = [{
					title: '拍照'
				}, {
					title: '从手机相册选择'
				}];
				plus.nativeUI.actionSheet({
					title: '修改头像',
					cancel: '取消',
					buttons: a
				}, function(b) {
					switch(b.index) {
						case 0:
							break;
						case 1:
							//拍照
							getImages(session.token(), session);
							break;
						case 2:
							//打开相册
							galleryImages(session.token(), session);
							break;
						default:
							break;
					}
				}, false);
			}
		});

		//性别弹框
		mui('body').on('tap', '#sexPicker li>a', function() {
			var a = this,
				parent;
			for(parent = a.parentNode; parent != document.body; parent = parent.parentNode) {
				if(parent.classList.contains('mui-popover-action')) {
					break;
				}
			}
			//性别选择
			if(a.innerHTML == '男' || a.innerHTML == '女') {
				document.getElementById("usersex").innerHTML = a.innerHTML;
				saveUserInfo();
			}

			//			if(a.getAttribute('class')=='a-upload'){
			////				=document.getElementById("avator").src
			//				saveUserInfo();
			//			}
			//关闭actionsheet
			mui('#' + parent.id).popover('toggle');
		});

		$('.a-upload>input').on('tap', function() {
			readURL(this,session);
			//上传图片
//			setTimeout(function() {
				var result = document.getElementById('avator').src;
				console.log(result);
				//saveUserInfo();
				mui('#picture').popover('toggle');
//				uploadHeadImg(result, session.token(), session);
//			}, 0);

		});
		//性别
		mui(".mui-table-view").on('tap', '#sex', function() {
			var id = this.getAttribute('id');
			if(id == 'sex') {
				mui('#sexPicker').popover('toggle');
			}
		});
		//姓名
		document.getElementById("username-li").addEventListener('tap', function(e) {
			e.detail.gesture.preventDefault(); //修复iOS 8.x平台存在的bug，使用plus.nativeUI.prompt会造成输入法闪一下又没了
			var btnArray = ['取消', '确定'];
			mui.prompt('请输入您的姓名', '姓名', '', btnArray, function(e) {
				if(e.index == 1) {
					username.innerText = e.value;
				}
			})
		});
		//昵称
		document.getElementById("usernickname-li").addEventListener('tap', function(e) {
			e.detail.gesture.preventDefault(); //修复iOS 8.x平台存在的bug，使用plus.nativeUI.prompt会造成输入法闪一下又没了
			var btnArray = ['取消', '确定'];
			mui.prompt('请输入您的昵称', '昵称', '', btnArray, function(e) {
				if(e.index == 1) {
					document.getElementById("usernickname").innerText = e.value;
					saveUserInfo();
				}
			})
		});
		//电话号码
		document.getElementById("userphone-li").addEventListener('tap', function(e) {
			e.detail.gesture.preventDefault(); //修复iOS 8.x平台存在的bug，使用plus.nativeUI.prompt会造成输入法闪一下又没了
			var btnArray = ['取消', '确定'];
			mui.prompt('请输入您的手机号码', '手机号码', '', btnArray, function(e) {
				if(e.index == 1) {
					document.getElementById("userphone").innerText = e.value;
					saveUserInfo();
				}
			})
		});
		//绑卡
		document.getElementById("userbinder-li").addEventListener('tap', function(e) {
			pushToExtrasController('/card/bindchildmsg.html', '绑定身份', {

			})
		});
	})
});

//拍照
function getImages(token, session) {
	var mobileCamera = plus.camera.getCamera();
	mobileCamera.captureImage(function(e) {
		plus.io.resolveLocalFileSystemURL(e, function(entry) {
			var path = entry.toLocalURL() + '?version=' + new Date().getTime();
			uploadHeadImg(path, token, session);
		}, function(err) {
			console.log("读取拍照文件错误");
		});
	}, function(e) {
		console.log("er", err);
	}, function() {
		filename: '_doc/head.png';
	});
}

//从本地相册选择
function galleryImages(token, session) {
	console.log("你选择了从相册选择");
	plus.gallery.pick(function(a) {
		plus.io.resolveLocalFileSystemURL(a, function(entry) {
			plus.io.resolveLocalFileSystemURL('_doc/', function(root) {
				root.getFile('head.png', {}, function(file) {
					//文件已经存在
					file.remove(function() {
						console.log("文件移除成功");
						entry.copyTo(root, 'head.png', function(e) {
							var path = e.fullPath + '?version=' + new Date().getTime();
							uploadHeadImg(path, token, session);
						}, function(err) {
							console.log("copy image fail: ", err);
						});
					}, function(err) {
						console.log("删除图片失败：（" + JSON.stringify(err) + ")");
					});
				}, function(err) {
					//打开文件失败
					entry.copyTo(root, 'head.png', function(e) {
						var path = e.fullPath + '?version=' + new Date().getTime();
						uploadHeadImg(path, token, session);
					}, function(err) {

						console.log("上传图片失败：（" + JSON.stringify(err) + ")");
					});
				});
			}, function(e) {
				console.log("读取文件夹失败：（" + JSON.stringify(err) + ")");
			});
		});
	}, function(err) {
		console.log("读取拍照文件失败: ", err);
	}, {
		filter: 'image'
	});
};
//上传图片
function uploadHeadImg(imgPath, token, session) {
	//选中图片之后，头像当前的照片变为选择的照片
	//	var mainImg = document.getElementById('avator').src;
	//	mainImg.src = imgPath;

	var images = new Image();
	images.src = imgPath;
	images.onload = function() {
		console.log('宽度：' + images.width);
		console.log('高度：' + images.height);
		//		var imgData =  getBase64Image(images);
		var param = {
			'token': token,
			'avatar': imgPath
		}

		bjpost('/User/resetAvatar.html', param, function() {
			mui.toast('修改成功');
			updateUserInfo(token, session)
		}, function(error) {
			mui.toast(error);
		})
	}

}

//压缩图片转成base64
function getBase64Image(img) {
	var canvas = document.createElement("canvas");
	var width = img.width;
	var height = img.height;
	console.log('width:' + width + '==1==' + 'height:' + height);
	if(width > height) {
		console.log('1');
		if(width > 100) {
			console.log('2');
			height = Math.round(height *= 100 / width);
			width = 100;
		}
	} else {
		console.log('3');
		if(height > 100) {
			console.log('4');
			width = Math.round(width *= 100 / height);
		}
		height = 100;
	}
	console.log('width:' + width + '==2==' + 'height:' + height);
	canvas.width = width;
	canvas.height = height;
	var ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0, width, height);

	var dataUrl = canvas.toDataURL('image/jpeg', 0.8);
	console.log(dataUrl);
	//      return dataUrl.replace('data:image/jpeg;base64,', '');
	return dataUrl;
}

function logout() {
	require(['session'], function(session) {
		bjpost('/User/logout.html', {
			'token': session.token()
		}, function(responseData, error) {
			mui.toast('已退出登陆');
			session.handleLoginOut();
			mui.back();
		});
	})
}

function updateUserInfo(token, session) {
	var param = {
		token: token
	};
	bjpost('/User/info.html', param, function(responseData) {
		wflog(responseData);
		mui.toast('修改成功');
		session.updateUserInfo(responseData);
	});
}