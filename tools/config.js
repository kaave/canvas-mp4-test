export default {
  dest: {
    dev: '.tmp',
    build: 'docs',
  },

  copy: {
    static: ['src/*.*'],
    assets: ['src/assets/**/*'],
  },

  rev: {
    src: 'docs/**/*.{js,css,png,gif,jpg,jpeg,svg,eot,ttf,woff,ico}',
    dest: 'docs',
    manifestFileName: 'manifest.json',
    isEnable: false
  },

  revReplace: {
    src: ['docs/index.html', 'docs/**/*.{js,css,html}'],
    dest: 'docs',
  },

  view: {
    src: ['src/views/**/*.ejs', '!src/views/**/_*'],
    watch: ['src/views/**/*.ejs', 'src/modules/**/*.ejs'],
    rename (path) {
      if (path.basename === 'index') {
        return;
      }

      let basename = 'index';
      let dirname = `${path.dirname}/`;

      dirname += path.basename.split('.').reduce((str, item) => {
        if (item.charAt(0) === '_') {
          basename = item.substr(1);
        } else {
          str += `${item}/`;
        }
        return str;
      }, '');

      path.basename = basename;
      path.dirname = dirname;
    },
  },

  style: {
    src: ['src/styles/**/*.css', '!src/styles/**/_*'],
    watch: ['src/styles/**/*.css', 'src/modules/**/*.css'],
    urlOption: { filter: ['./**/*'], url: 'inline' },
    autoprefixerOption: { grid: true }
  },

  script: {
    src: ['src/scripts/**/*.{js,jsx}', '!src/scripts/**/_*'],
    watch: ['src/scripts/**/*', 'src/components/**/*', 'src/modules/**/*.{js,jsx}', 'src/libs/**/*.js']
  },

  browser: {
    notify: false,
    port: 9012,
    reloadDebounce: 500,
    server: {
      baseDir: ['.tmp'],
      routes: {
        '/assets': 'src/assets'
      },
    },
  },
};
