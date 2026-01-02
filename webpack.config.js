const path = require('path');

module.exports = {
  entry: {
    main: './tanoda/static/js/react/index.js',
    admin_dashboard: './tanoda/static/js/react/admin_dashboard/index.js',
    user_dashboard: './tanoda/static/js/react/user_dashboard/index.js',
    plotly_chart: './tanoda/static/js/react/plotly_chart/index.js',
    pythagorasz_tabla_bundle: './tanoda/static/js/szorzas/pythagorasz_tabla/pythagorasz_tabla_bundle.js',
    szorzas_performance_chart: './tanoda/static/js/react/szorzas_chart/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'tanoda/static/js/bundles'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
