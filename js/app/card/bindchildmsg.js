var total;
var num;
var d = 1;
var imgData;
var bindBtn = document.getElementById("bindBtn");
var nameInput = document.getElementById("name");
var idCardInput = document.getElementById("idCard");
var phonenum1 = document.getElementById("phonenum1");
var phonenum2 = document.getElementById("phonenum2");
var school = document.getElementById("school");
var bjclass = document.getElementById("bjclass");
var imgAvator = document.getElementById("childAvatar");
var isAvatar = false;
var need_reload;
/**
 * 查询并显示用户信息
 */
function queryUserBindInfo() {
	require(['session'], function(session) {
		var param = {
			token: session.token(),
		};
		bjcpost('/User/childInfo.html', param, function(responseData, error) {
//			console.log(responseData);
			if(responseData) {
				nameInput.value = responseData.child_name;
				idCardInput.value = responseData.child_idno;
				phonenum1.value = responseData.warden_mobile;
				phonenum2.value = responseData.warden_mobile_back;
				school.value = responseData.schoole_name;
				bjclass.value = responseData.class_name;
				document.getElementById("childAvatar").src = responseData.child_avatar;
				if(responseData.child_avatar.length == 0) {
					isAvatar = true;
				} else {
					//					document.getElementById('uploadingAvatar').removeEventListener('tap', choicePic, false);
					//已经上传后禁止点击
					document.getElementById('uploadingAvatar').setAttribute('disabled', 'disabled');
				}
			}
			hideLoading();
		})
	})
}

function updateBindInfo() {
	require(['session'], function(session) {
		var fromData = formObject();
		fromData.token = session.token();
		bjcpost('/User/childEdit.html', fromData, function(responseData, error) {
			if(!error) {
				mui.toast('修改成功');
			}
		})
	})
}

function bindUserInfo() {
	require(['session'], function(session) {
		var fromData = formObject();
		fromData.token = session.token();
		bjcpost('/User/childEdit.html', fromData, function(responseData, error) {
			if(!error) {
				mui.toast('修改成功');
			}
		})
	})
}

function initPage() {
	//设置bottom绝对位置
	if(mui.os.android) { //解决输入键盘将底部布局顶起的问题
		document.getElementById('bindBtn').style.top = (window.innerHeight - 60) + "px";
	}
	require(['session'], function(session) {
	    showLoading();
		if(session.is_bind_child()) { //如果绑定过个人信息 先查询 然后显示出来
			queryUserBindInfo();
			bindBtn.innerHTML = '更新绑定信息';

			$('#name').attr('readonly', 'readonly');
			$('#idCard').attr('readonly', 'readonly');
		} else {
			bindBtn.innerHTML = '立即绑定';
			hideLoading();
		}
	})
}

//function choicePic() {
//	if(mui.os.plus) {
//		var a = [{
//			title: '拍照'
//		}, {
//			title: '从手机相册选择'
//		}];
//		plus.nativeUI.actionSheet({
//			title: '修改头像',
//			cancel: '取消',
//			buttons: a
//		}, function(b) {
//			switch(b.index) {
//				case 0:
//					break;
//				case 1:
//					//拍照
//					getImages(function(imgPath) {
//						console.log('1111');
//						uploadHeadImg(imgPath);
//					});
//					break;
//				case 2:
//					//打开相册
//					galleryImages(function(imgPath) {
//						uploadHeadImg(imgPath);
//					});
//					break;
//				default:
//					break;
//			}
//		}, false);
//	}
//}
$(function() {
	//	document.getElementById('uploadingAvatar').addEventListener('tap', choicePic, false);
	$('#uploadingAvatar>input').on('change', function() {
		uploadImg(this);
	})
	//初始化页面
	initPage();
	require(['session', 'validator'], function(session, validator) {

		/**
		 * 儿童资料添加
		 * @param  string  $childName    儿童姓名
		 * @param  int     $childGender  儿童性别，0-女，1-男，2保密
		 * @param  string  $childIdno    身份证号码
		 * @param  string  $wardenMobile 看护人手机号码  (没有看护人姓名)
		 */

		$('#bindBtn').on('click', function() {
			var childName = document.getElementById('name').value;
			var childIdno = document.getElementById('idCard').value.toUpperCase();
			var schlloName = document.getElementById('school').value;
			var clazzName = document.getElementById('bjclass').value;
			var wardenMobile1 = document.getElementById('phonenum1').value;
			var wardenMobile2 = document.getElementById('phonenum2').value;
			var childGender = 1;
			var person;
			console.log('isAvatar:' + isAvatar);
			try {
				if(isAvatar) {
					if(!imgData) throw '请上传小孩头像';
				}
				if(childName.length == 0) throw '请填写小孩姓名';
				if(!Bee.IdCardUtils.isIdCard18(childIdno)) throw "请输入正确的身份证号码";
				person = Bee.IdCardUtils.getPersonInfo18(childIdno);
				if(person.age > 18) throw "身份证年龄大于18岁";
				if(schlloName.length == 0) throw '请填写学校';
				if(clazzName.length == 0) throw '请填写班级';
				if(!Bee.PhoneUtils.isPhoneNum(wardenMobile1)) throw "请输入正确的电话号码";

			} catch(e) {
				mui.toast(e);
				return;
			}

			var sexcode = person.sex == '男' ? 1 : 0;
			var param = {
				token: session.token(),
				childName: childName,
				childGender: sexcode,
				childAge: person.age,
				childIdno: childIdno,
				avatar: imgData,
				warden_mobile_back: wardenMobile2,
				schoole_name: schlloName,
				class_name: clazzName,
				wardenMobile: wardenMobile1
			};
			bjpost('/User/childEdit.html', param, function(responseData) {
				mui.toast('修改成功');
				updateUserInfo();
				need_reload = true;
				mui.later(function(){
				    mui.back();
				}, 500)
			}, function(error) {
				mui.toast(error);
			})
		});

		function updateUserInfo() {
			console.log('updateUserInfo');
			var param = {
				token: session.token(),
			};

			bjpost('/User/info.html', param, function(responseData) {
				session.updateUserInfo(responseData);
			});
		}

	});
});
//上传图片
//function uploadHeadImg(imgPath) {
//	//选中图片之后，头像当前的照片变为选择的照片
//	var mainImg = document.getElementById('childAvatar');
//	mainImg.src = imgPath;
//
//	var images = new Image();
//	images.src = imgPath;
//	images.onload = function() {
//		console.log('宽度：' + images.width);
//		console.log('高度：' + images.height);
//		imgData =imgPath;
//	}
//	console.log(imgData);
//}
//web  上传图片
function uploadImg(input) {
	if(input.files && input.files[0]) {
		var reader = new FileReader();
		reader.onload = function(e) {
			$('#childAvatar').attr('src', e.target.result);
			imgData = e.target.result;
			//			console.log(imgData);
		}
		reader.readAsDataURL(input.files[0]);
	}

}