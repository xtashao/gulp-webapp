'use strict'

const browserify = require('browserify')
const standalonify = require('standalonify')
const babelify = require('babelify')
const gulp = require('gulp')
const uglify = require('gulp-uglify')
const sourcemaps = require('gulp-sourcemaps')
const sass = require('gulp-sass')
const csso = require('gulp-csso')
const rev = require('gulp-rev')
const revCollector = require('gulp-rev-collector')
const htmlMin = require('gulp-htmlmin')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')

const conf = require('../conf/gulp.conf')

gulp.task('javascript', function () {
  var b = browserify({
    entries: conf.path.src('js/index.js'),
    debug: false
  })

  return b
    .plugin(standalonify, { // 使打包后的js文件符合UMD规范并指定外部依赖包
      name: 'vendors',
      deps: {
        // '_': 'lodash'
      }
    })
    .transform(babelify, {
      presets: [
        '@babel/preset-env'
      ]
    })
    .bundle()
    .on('error', conf.errorHandler('Browserify Error'))
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(uglify({
      mangle: false,
      compress: {
        properties: false
      },
      output: {
        quote_keys: true
      }
    }))
    .pipe(rev())
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(conf.path.dist('js')))
    .pipe(rev.manifest())
    .pipe(gulp.dest(conf.path.dist('rev/js')))
})

gulp.task('css', function () {
  return gulp.src(conf.path.src('css/**/*.scss'))
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer({
      browsers: ['last 50 versions']
    })]))
    .pipe(csso())
    .pipe(rev())
    .pipe(gulp.dest(conf.path.dist('css')))
    .pipe(rev.manifest())
    .pipe(gulp.dest(conf.path.dist('rev/css')))
})

gulp.task('html', function () {
  return gulp.src([conf.path.dist('rev/**/*.json'), conf.path.src('html/**/*.html')])
    .pipe(revCollector({
      replaceReved: true
    }))
    .pipe(htmlMin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest('dist/'))
})

gulp.task('build:dist', gulp.series(gulp.parallel('javascript', 'css'), 'html'))
