const gulp = require('gulp')
const HubRegistry = require('gulp-hub')

const conf = require('./conf/gulp.conf')

// Load some files into the registry
const hub = new HubRegistry([conf.path.tasks('*.js')])

// Tell gulp to use the tasks just loaded
gulp.registry(hub)

gulp.task('default', gulp.series('clean', 'build:dist'))
gulp.task('serve', gulp.series('clean', 'build', 'watch'))
