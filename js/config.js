require.config({
	baseUrl:'',
	paths:{
		'cssjs':'js/lib/css.min',
		'mui':'js/lib/mui.min',
		'jsonp':'js/lib/mui.jsonp',
		'jquery':'js/lib/jquery',
		'validator':'js/lib/validator.min',
		'utils': 'js/common/utils.min',
		'storage': 'js/common/storage',
		'session': 'js/common/usersession',
		'request': 'js/common/request',
	},
	shim:{
		cssjs:{
			 deps: ['jquery']
		},
		mui:{
			 deps: ['jquery','cssjs!css/mui.min.css']
		},
		storage: {
			deps: ['mui']
		},
		session: {
			deps: ['storage']
		},
		jsonp: {
			deps: ['mui']
		},
		request: {
			deps: ['validator']
		},
	},
})