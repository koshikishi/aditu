'use strict';

var gulp = require('gulp');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cleancss = require('gulp-clean-css');
var rename = require('gulp-rename');
var server = require('browser-sync').create();
var imagemin = require('gulp-imagemin');
var posthtml = require('gulp-posthtml');
var include = require('posthtml-include');
var htmlmin = require('gulp-htmlmin');
var del = require('del');

// Компиляция файлов *.css из *.scss с автопрефиксером и минификацией
gulp.task('css', function () {
  return gulp.src('source/sass/style.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: require('node-normalize-scss').includePaths
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(cleancss())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
});

// Запуск сервера Browsersync
gulp.task('server', function () {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch('source/sass/**/*.{scss,sass}', [
    'css'
  ]);
  gulp.watch('source/*.html', [
    'html',
    'refresh'
  ]);
});

// Сжатие файлов изображений
gulp.task('img', function () {
  return gulp.src('source/img/*.{png,jpg,svg}')
    .pipe(imagemin([
      imagemin.optipng({
        optimizationLevel: 5
      }),
      imagemin.jpegtran({
        progressive: true
      }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest('build/img'));
});

// Минификация файлов *.html
gulp.task('html', function () {
  return gulp.src('source/*.html')
    .pipe(posthtml([
      include()
    ]))
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest('build'));
});

// Копирование файлов в папку build
gulp.task('copy', function () {
  return gulp.src([
      'source/fonts/**/*.{woff,woff2}',
      'source/img/**',
      'source/*.ico'
    ], {
      base: 'source'
    })
    .pipe(gulp.dest('build'));
});

// Удаление файлов в папке build перед копированием
gulp.task('clean', function () {
  return del('build');
});

// Создание сборки проекта
gulp.task('build', [
  'clean',
  'copy',
  'css',
  'html'
]);

// Автообновление страницы
gulp.task('refresh', function (done) {
  server.reload();
  done();
});

// Создание сборки проекта и запуск сервера Browsersync
gulp.task('start', [
  'build',
  'server'
]);
