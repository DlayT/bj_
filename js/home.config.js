//首页的js配置文件
console.log('引入公共配置文件成功')
require.config({
	baseUrl: '',
	paths: {
		'cssjs': 'js/lib/css.min',
		'mui': 'js/lib/mui.min',
		'jquery': 'js/lib/jquery',
		'template': 'js/lib/template',
		'validator': 'js/lib/validator.min',
		'md5': 'js/lib/md5.min',
		'utils': 'js/common/utils.min',
		'util': 'js/common/base.utils',
		'storage': 'js/common/storage',
		'session': 'js/common/usersession',
		'request': 'js/common/request',
	},
	shim: {
		mui: {
			deps: ['jquery','cssjs!../../css/base.app.css']
		},
		request: {
			deps: ['utils']
		},
	},
})