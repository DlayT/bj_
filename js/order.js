GetOrderList(1, 1, 1); //未支付
GetOrderList(2, 1, 2); //已支付
GetOrderList(3, 1, 3); //失效

//初始化数据  获取订单
function GetOrderList(status, page, ID) {
	var API_ALL_URL = '';

	mui.ajax(API_ALL_URL, {
		data: {
			access_token: userToken,
			code: userToken,
			status: status,
			pageSize: 10,
			page: page
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		timeout: 5000, //超时时间设置为10秒；
		//指定HTTP请求的Header格式(教育家接口非JSON请求模式，注释)
		//headers:{'Content-Type':'application/json'},
		success: function(data) {
			//服务器返回响应，根据响应结果，分析是否登录成功；
			var responseCode = data.responseCode;
			var responseMessage = data.responseMessage;
			//验证登录状态--失效，跳转
			overtime_session(responseCode);
			if(responseCode == 0) {
				var result = data.data;
				//console.log(result);
				//   拼接字符串
				if(!emptyObject(result)) {
					for(var i = 0; i < result.length; i++) {
						//    创建一个li 标签
						var item = result[i];
						// console.log(item);
						var li = document.createElement("li");
						li.className = "mui-table-view-cell mui-media";
						var str = "";
						var img_str = "";
						if(item.productinfo.img == "") {
							img_str = Default_Cover("");
						} else {
							img_str = item.productinfo.img;
						}
						str = '<div class="lh_div mag_lr"><span class="float_l">订单：' + item.orderinfo.order_num + '</span><span class="float_r color_r">' + GetOrderState(item.orderinfo.status) + '</span></div>';
						str += '	<div class="mag_lr pad_lr">';
						str += '      <img src="' + img_str + '" style="width: 30%;" class="float_l">';
						str += '          <span class="mag_lr float_l" style="width: 60%;">';
						str += '              <p style="color:#000;">' + item.productinfo.name + '</p>';
						str += '              <p></p>';
						str += '              <p><span class=" float_l color_r">¥' + item.productinfo.sale_price + '</span><span style="font-size: 12px;text-decoration:line-through;">&nbsp;&nbsp;¥' + item.productinfo.market_price + '</span></p>';
						str += '              <p style="font-size: 12px;">数量：' + item.orderinfo.num + item.productinfo.unit + '</p>';
						str += '			</span>';
						str += '  </div>';
						str += '  <div style="height: 100px;"></div>';
						str += '  <div class="line_1 mag_lr"></div>';
						str += '  <div class="lh_div mag_lr"><span class="float_r">¥' + item.orderinfo.rec_amount + '</span><span class="float_r">共 ' + item.orderinfo.num + ' 件商品，</span></div>';
						str += '  <div class="line_2"></div>';
						li.innerHTML = str;
						$("#view" + ID).append(li);
					}
				}

			} else {
				//打印验证提示
				var responseInfo = responseMessage;
				Message_info(responseInfo);
				return false;
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			mui.toast("请求异常，稍后再试");
			return false;
		}
	});
}