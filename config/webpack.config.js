module.exports = {
  target: 'node',
  entry: '../index.js',
  module: {
    rules: [
      {
        test: /\.(js|jsx)?$/,
        loader: 'babel-loader'
      },
      {
        test: /\.tsx?$/,
        use: ['babel-loader', 'ts-loader']
      },
      {
        test: /\.global\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
}