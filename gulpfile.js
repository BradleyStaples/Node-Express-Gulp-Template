'use strict';

var autoprefixer = require('gulp-autoprefixer');
var browserify = require('browserify');
var del = require('del');
var concat = require('gulp-concat');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var jade = require('gulp-jade');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var minifycss = require('gulp-minify-css');
var nodemon = require('gulp-nodemon');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var useref = require('gulp-useref');


gulp.task('browserify', ['move-js-to-dist'], function () {
    return browserify('./src/js/browserify.js')
       .bundle()
       .pipe(source('browserify.js'))
       .pipe(rename('browserify.js'))
       .pipe(gulp.dest('./dist/js'));
});


gulp.task('clean-files', function (cb) {
    return del(['dist/**/*'], cb);
});


gulp.task('combine-and-minify-js', ['browserify'], function () {
    return gulp.src(['./dist/js/browserify.js', './dist/js/index.js'])
        .pipe(uglify())
        .on('error', gutil.log)
        .pipe(concat('index.js'))
        .pipe(gulp.dest('./dist/js'));
});


gulp.task('concatenate', ['combine-and-minify-js', 'minifiy-css', 'jade-to-html'], function () {
    var assets = useref.assets();
    return gulp.src('./dist/*.html')
        .pipe(assets)
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifycss()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest('dist'));
});


gulp.task('copy-bookmark-images', function () {
    return gulp.src('./src/images/bookmarks/*')
        .pipe(gulp.dest('./dist/img/bookmarks/'));
});


gulp.task('copy-favicon', function () {
    return gulp.src('./src/images/bookmarks/favicon.ico')
        .pipe(gulp.dest('./dist/'));
});


gulp.task('jade-to-html', function () {
    return gulp.src('./src/views/*.jade')
        .pipe(jade({
            pretty: true
        }))
        .on('error', gutil.log)
        .pipe(gulp.dest('./dist/'));
});


gulp.task('lint-js', function () {
    return gulp.src(['./src/js/*.js', 'bin/www'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});


gulp.task('lint-js-styles', function () {
    return gulp.src(['./*.js', './src/js/*.js'])
        .pipe(jscs());
});


gulp.task('minifiy-css', ['sass-to-css', 'prefix-css'], function () {
    return gulp.src('./dist/css/*.css')
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(minifycss())
        .on('error', gutil.log)
        .pipe(gulp.dest('./dist/css'));
});


gulp.task('move-images-to-dist', function () {
    return gulp.src(['./src/images/*.jpg', './src/images/*.png'])
        .pipe(gulp.dest('dist/img'));
});


gulp.task('move-js-to-dist', function () {
    return gulp.src(['./src/js/*.js', './src/js/external/*.js'])
        .pipe(gulp.dest('dist/js'));
});


gulp.task('prefix-css', function () {
    return gulp.src('./dist/css/*.css')
        .pipe(autoprefixer('last 2 version'))
        .on('error', gutil.log)
        .pipe(gulp.dest('./dist/css'));
});


gulp.task('start-dev', function () {
    return nodemon({
        script: './bin/www',
        env: {
            NODE_ENV: 'development'
        }
    });
});


gulp.task('sass-to-css', function () {
    return gulp.src('./src/sass/index.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            style: 'expanded'
        }))
        .on('error', gutil.log)
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('./dist/css'));
});


gulp.task('watch-files', function () {
    gulp.watch('./src/sass/*.scss', ['minifiy-css']);
    gulp.watch('./src/js/*.js', ['combine-and-minify-js']);
    gulp.watch('./src/views/*.jade', ['jade-to-html']);
});


// todo: lint sass
var verify_tasks = [
    'lint-js',
    'lint-js-styles'
];
gulp.task('verify', verify_tasks, function () {

});


var default_tasks = [
    'concatenate',
    'move-images-to-dist',
    'watch-files',
    'start-dev'
];
gulp.task('default', default_tasks, function () {

});


var build_tasks = [
    'verify',
    'concatenate',
    'move-images-to-dist',
    'copy-bookmark-images',
    'copy-favicon'
];
gulp.task('build', build_tasks, function () {

});
