require.config({
	baseUrl: '',
	paths: {
		'validator':'../../js/lib/validator.min',
		'request': '../../js/common/request',
		'storage': '../../js/common/storage',
		'session': '../../js/common/usersession',
	},
	
	shim: {
		session: {
			deps: ['storage','request']
		},
	},
})