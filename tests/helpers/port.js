let PORT;
if (process.env.NODE_ENV === 'production') {
  PORT = process.env.PORT || 5000;
} else if (process.env.NODE_ENV === 'ci') {
  PORT = process.env.PORT || 5000;
} else {
  PORT = 8080;
};

module.exports = {PORT};