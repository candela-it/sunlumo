module.exports = {
  jquery: {
    exports: 'jQuery'
  },
  modernizr: {
    exports: "Modernizr",
    depends: {
      jquery: 'jquery'
    }
  },
  foundation: {
    exports: "Foundation",
    depends: {
      modernizr: "Modernizr"
    }
  }
};