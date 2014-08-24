var gulp = require('gulp');
var gif = require('gulp-if');
var cached = require('gulp-cached');
var uglify = require('gulp-uglify');
var csso = require('gulp-csso');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var globs = {
  js: 'public/js/*.js',
  css: 'public/css/*',
  static: ['public/**/*', '!public/js/*.js', '!public/css/*.css']
};

rimraf.sync('./dist');
mkdirp.sync('./dist');

gulp.task('watch', function(){
  gulp.watch(globs.css, ['css']);
  gulp.watch(globs.js, ['js']);
  gulp.watch(globs.static, ['static']);
});

gulp.task('static', function(){
  return gulp.src(globs.static)
    .pipe(cached('build'))
    .pipe(gif('*.js', uglify()))
    .pipe(gif('*.css', csso()))
    .pipe(gulp.dest('dist'))
});

gulp.task('js', function(){
  return browserify('./public/js/main.js')
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(cached('js'))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write('dist/js/maps'))
    .pipe(gulp.dest('dist/js'))
});

gulp.task('css', function(){
  return gulp.src('./public/css/main.css')
    .pipe(cached('css'))
    .pipe(csso())
    .pipe(gulp.dest('dist/css'))
});

gulp.task('default', ['css', 'js', 'static', 'watch']);