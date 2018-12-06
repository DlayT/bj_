var total;
var num;
var d = 1;
var imgData;

//测试代码可以删除掉的
//$('#bindBtn').on('click', function() {
//	var childName = document.getElementById('name').value;
//	var childIdno = document.getElementById('idCard').value;
//	var wardenMobile = document.getElementById('phonenum').value;
//	console.log(childIdno.toUpperCase());
//})

mui.plusReady(function() {
	//设置bottom绝对位置
	if(mui.os.android) { //解决输入键盘将底部布局顶起的问题
		document.getElementById('bindBtn').style.top = (plus.display.resolutionHeight - 49 - 60) + "px";
	}
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
			var wardenMobile = document.getElementById('phonenum').value;
			var childGender = 1;
			var person;
			try {
				if(!imgData) throw '请上传小孩头像';
				if(childName.length == 0) throw '请填写小孩姓名';
				if(!Bee.IdCardUtils.isIdCard18(childIdno)) throw "请输入正确的身份证号码";
				person = Bee.IdCardUtils.getPersonInfo18(childIdno);
				if(person.age > 18) throw "身份证年龄大于18岁";
				if(!Bee.PhoneUtils.isPhoneNum(wardenMobile)) throw "请输入正确的电话号码";

			} catch(e) {
				mui.toast(e);
				return;
			}

			var sexcode = person.sex == '男' ? 1 : 0;
			console.log(wardenMobile);
			var param = {
				token: session.token(),
				childName: childName,
				childGender: sexcode,
				childAge: person.age,
				childIdno: childIdno,
				avatar: imgData,
				wardenMobile: wardenMobile
			};
			wflog(param)
			bjpost('/User/childAdd.html', param, function(responseData) {
				wflog(responseData);
				updateUserInfo()
				mui.back();
			}, function(error) {
				mui.toast(error);
				mui.back();
			})

			var web = plus.webview.getWebviewById('');
			mui.fire(web, 'bind_idcard', {
				'bind': true,
			})
		});

		function updateUserInfo() {
			console.log('updateUserInfo');
			var param = {
				token: session.token(),
			};

			bjpost('/User/info.html', param, function(responseData) {
				wflog(responseData);
				session.updateUserInfo(responseData);
			});
		}

		document.getElementById('uploadingAvatar').addEventListener('tap', function() {
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
							getImages();
							break;
						case 2:
							//打开相册
							galleryImages();
							break;
						default:
							break;
					}
				}, false);
			}
		});

		//拍照
		function getImages() {
			var mobileCamera = plus.camera.getCamera();
			mobileCamera.captureImage(function(e) {
				plus.io.resolveLocalFileSystemURL(e, function(entry) {
					var path = entry.toLocalURL() + '?version=' + new Date().getTime();
					uploadHeadImg(path);
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
		function galleryImages() {
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
									uploadHeadImg(path);
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
								uploadHeadImg(path);
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
		function uploadHeadImg(imgPath) {
			//选中图片之后，头像当前的照片变为选择的照片
			var mainImg = document.getElementById('childAvatar');
			mainImg.src = imgPath;

			var images = new Image();
			images.src = imgPath;
			images.onload = function() {
				console.log('宽度：' + images.width);
				console.log('高度：' + images.height);
				imgData = getBase64Image(images);
			}

		}

		//压缩图片转成base64
		function getBase64Image(img) {
			var canvas = document.createElement("canvas");
			var width = img.width;
			var height = img.height;
			if(width > height) {
				if(width > 100) {
					height = Math.round(height *= 100 / width);
					width = 100;
				}
			} else {
				if(height > 100) {
					width = Math.round(width *= 100 / height);
				}
				height = 100;
			}
			canvas.width = width;
			canvas.height = height;
			var ctx = canvas.getContext('2d');
			ctx.drawImage(img, 0, 0, width, height);

			var dataUrl = canvas.toDataURL('image/jpeg', 0.8);
			console.log(dataUrl);
			//		return dataUrl.replace('data:image/jpeg;base64,', '');
			return dataUrl;
		}
	})
})