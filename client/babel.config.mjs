export default {
  plugins: [
    'babel-plugin-react-compiler', // must run first
    [
      'babel-plugin-styled-components',
      {
        displayName: true,
        fileName: true,
      },
    ],
  ],
};
