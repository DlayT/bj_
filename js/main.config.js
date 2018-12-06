//app 框架的js配置文件

require.config({
	baseUrl:'',
	paths:{//这个路径是相对于main.html的位置来确定的
		'cssjs':'../../js/lib/css.min',
		'mui':'../../js/lib/mui.min',
		'jquery':'../../js/lib/jquery',
		'template':'../../js/lib/template',
		'request':'../../js/common/request',
	},
	shim:{
		cssjs:{
			 deps: ['jquery']
		},
		mui:{
			 deps: ['jquery','cssjs!../../css/base.app.css'],//注意cssjs 的名字需要和上面的名字一致
		},
	},
})
