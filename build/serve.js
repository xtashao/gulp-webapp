'use strict'

const browserify = require('browserify')
const watchify = require('watchify')
const standalonify = require('standalonify')
const babelify = require('babelify')
const gulp = require('gulp')
const sass = require('gulp-sass')
const postcss = require('gulp-postcss')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const autoprefixer = require('autoprefixer')
const assign = require('lodash/assign')
const browserSync = require('browser-sync')

const conf = require('../conf/gulp.conf')

const customOpts = {
  entries: conf.path.src('js/index.js'),
  debug: true
}
const opts = assign({}, watchify.args, customOpts)
const b = watchify(browserify(opts))

b.plugin(standalonify, { // 使打包后的js文件符合UMD规范并指定外部依赖包
  name: 'vendors',
  deps: {
    // '$': 'jQuery'
  }
})
b.transform(babelify, {
  presets: [
    '@babel/preset-env'
  ]
})

b.on('update', buildJs)

function buildJs () {
  return b
    .bundle()
    .on('error', conf.errorHandler('Browserify Error'))
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(gulp.dest(conf.path.tmp('js')))
    .pipe(browserSync.stream())
}

function buildCss () {
  return gulp.src(conf.path.src('css/**/*.scss'))
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer({
      browsers: ['last 50 versions']
    })]))
    .pipe(gulp.dest(conf.path.tmp('css')))
    .pipe(browserSync.stream())
}

function buildHtml () {
  return gulp.src(conf.path.src('html/**/*.html')).pipe(gulp.dest(conf.path.tmp()))
}

gulp.task('build', gulp.series(buildJs, buildCss, buildHtml))

gulp.task('watch', () => {
  browserSync({
    server: {
      baseDir: [
        conf.paths.tmp,
        conf.paths.src
      ]
    },
    open: false
  })

  gulp.watch(conf.path.src('css/**/*.scss'), buildCss)
  gulp.watch(conf.path.src('**/*.html'), buildHtml).on('change', browserSync.reload)
})
