'use strict';

var gulp = require('gulp'),
    responsive = require('gulp-responsive-images'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    eslint = require('gulp-eslint'),
    watch = require('gulp-watch'),
    newer = require('gulp-newer'),
    gm = require('gulp-gm'),
    svgmin = require('gulp-svgmin'),
    args = require('yargs').argv;

// get the book we're processing
var book = 'book';
if (args.book && args.book.trim != '') {
    var book = args.book;
};

// get the language we're processing
var language = '';
if (args.language && args.language.trim != '') {
    var language = '/' + args.language;
};

// set up paths for later
// add paths to any JS files to minify to the src array, e.g.
// src: ['assets/js/foo.js,assets/js/bar.js'],
var paths = {
    img: {
        source: book + language + '/images/_source/',
        printpdf: book + language + '/images/print-pdf/',
        web: book + language + '/images/web/',
        screenpdf: book + language + '/images/screen-pdf/',
        epub: book + language + '/images/epub/',
        app: book + language + '/images/app/',
    },
    js: {
        src: [],
        dest: 'assets/js/'
    }
};

// set filetypes to convert, comma separated, no spaces;
// by default we don't convert svg which throws an error
var filetypes = 'jpg,jpeg,gif,png';


// Minify and clean SVGs and copy to destinations
// For EpubCheck-safe SVGs, we remove data- attributes
// and don't strip defaults like <style "type=text/css">
gulp.task('images:svg', function () {
    console.log('Processing SVG images from ' + paths.img.source);
    gulp.src(paths.img.source + '*.svg')
    .pipe(svgmin({
       plugins: [{
            removeAttrs: { attrs: 'data.*' }
        }, {
            removeUnknownsAndDefaults: {
                defaultAttrs: false
            }
        }],
    }))
    .pipe(gulp.dest(paths.img.printpdf))
    .pipe(gulp.dest(paths.img.screenpdf))
    .pipe(gulp.dest(paths.img.web))
    .pipe(gulp.dest(paths.img.epub))
    .pipe(gulp.dest(paths.img.app));
});

// Take the source images and convert them for print-pdf
gulp.task('images:printpdf', function () {
    console.log('Processing print-PDF images from ' + paths.img.source);
    gulp.src(paths.img.source + '*.{' + filetypes + '}')
    .pipe(newer(paths.img.printpdf))
    .pipe(gm(function(gmfile) {
        return gmfile.profile('_tools/profiles/PSOcoated_v3.icc').colorspace('cmyk');
    }))
    .pipe(gulp.dest(paths.img.printpdf));
});

// Take the source images and optimise and resize them for
// screen-pdf, web, epub, and app
gulp.task('images:optimise', function () {
    console.log('Processing screen-PDF, web, epub and app images from ' + paths.img.source);
    gulp.src(paths.img.source + '*.{' + filetypes + '}')
        .pipe(newer(paths.img.web))
        .pipe(responsive({
        '*': [{
            width: 810,
            quality: 90,
            upscale: false,
        }]
    }))
    .pipe(gm(function(gmfile) {
        return gmfile.profile('_tools/profiles/sRGB_v4_ICC_preference_displayclass.icc').colorspace('rgb');
    }))
    .pipe(gulp.dest(paths.img.screenpdf))
    .pipe(gulp.dest(paths.img.web))
    .pipe(gulp.dest(paths.img.epub))
    .pipe(gulp.dest(paths.img.app));
});

// Make small size images for web use in srcset in _includes/figure
gulp.task('images:small', function () {
    console.log('Creating small web images from ' + paths.img.source);
    gulp.src(paths.img.source + '*.{' + filetypes + '}')
        .pipe(newer(paths.img.web))
        .pipe(responsive({
            '*': [{
                width: 320,
                quality: 90,
                upscale: false,
                suffix: '-320',
            }]
        }))
        .pipe(gm(function(gmfile) {
            return gmfile.profile('_tools/profiles/sRGB_v4_ICC_preference_displayclass.icc').colorspace('rgb');
        }))
        .pipe(gulp.dest(paths.img.web));
});

// Make medium size images for web use in srcset in _includes/figure
gulp.task('images:medium', function () {
    console.log('Creating medium web images from ' + paths.img.source);
    gulp.src(paths.img.source + '*.{' + filetypes + '}')
        .pipe(newer(paths.img.web))
        .pipe(responsive({
            '*': [{
                width: 640,
                quality: 90,
                upscale: false,
                suffix: '-640',
            }]
        }))
        .pipe(gm(function(gmfile) {
            return gmfile.profile('_tools/profiles/sRGB_v4_ICC_preference_displayclass.icc').colorspace('rgb');
        }))
        .pipe(gulp.dest(paths.img.web));
});

// Make large size images for web use in srcset in _includes/figure
gulp.task('images:large', function () {
    console.log('Creating large web images from ' + paths.img.source);
    gulp.src(paths.img.source + '*.{' + filetypes + '}')
        .pipe(newer(paths.img.web))
        .pipe(responsive({
            '*': [{
                width: 1024,
                quality: 90,
                upscale: false,
                suffix: '-1024',
                }]
            }))
        .pipe(gm(function(gmfile) {
            return gmfile.profile('_tools/profiles/sRGB_v4_ICC_preference_displayclass.icc').colorspace('rgb');
        }))
        .pipe(gulp.dest(paths.img.web));
});

// Make extra large images for web use in srcset
gulp.task('images:xlarge', function () {
    console.log('Creating extra-large web images from ' + paths.img.source);
    gulp.src(paths.img.source + '*.{' + filetypes + '}')
        .pipe(newer(paths.img.web))
        .pipe(responsive({
            '*': [{
                width: 2048,
                quality: 90,
                upscale: false,
                suffix: '-2048',
                }]
            }))
        .pipe(gm(function(gmfile) {
            return gmfile.profile('_tools/profiles/sRGB_v4_ICC_preference_displayclass.icc').colorspace('rgb');
        }))
        .pipe(gulp.dest(paths.img.web));
});

// minify JS files to make them smaller
gulp.task('js', function() {
    console.log('Minifying Javascript');
    gulp.src(paths.js.src)
    .pipe(uglify())
    .pipe(rename({ suffix:'.min' }))
    .pipe(gulp.dest(paths.js.dest));
});

// lint the JS files: check for errors and inconsistencies
gulp.task('jslint', function() {
    console.log('Linting Javascript');
    gulp.src(paths.js.src)
    .pipe(eslint({
        configFile: 'eslint.json',
        fix: true
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

// watch the JS files for changes, run jslin and js tasks when they do
gulp.task('watch', function() {
    console.log('Watching for Javascript changes');
    gulp.watch(paths.js.src, ['jslint', 'js']);
});

// when running `gulp`, do the image tasks
gulp.task('default', ['images:svg', 'images:printpdf', 'images:optimise', 'images:small', 'images:medium', 'images:large', 'images:xlarge']);
