module.exports = {
	apps: [
		{
			script: './src/index.js',
			watch: '.',
			instances: 'max',
			exec_mode: 'cluster',
			env_development: {
				NODE_ENV: 'development'
			},
			env_production: {
				NODE_ENV: 'production'
			}
		}
	]
};
