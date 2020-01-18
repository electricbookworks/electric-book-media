/*jslint for, this */

// This gulpfile processes:
// - images, optimising them for output formats
// - Javascript, optionally, minifying scripts for performance
// - HTML, rendering MathJax as MathML.
// It takes two arguments: --book and --language, e.g.:
// gulp --book samples --language fr

// Get Node modules
var gulp = require('gulp'),
    responsive = require('gulp-responsive-images'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    newer = require('gulp-newer'),
    gm = require('gulp-gm'),
    svgmin = require('gulp-svgmin'),
    args = require('yargs').argv,
    fileExists = require('file-exists'),
    mathjax = require('gulp-mathjax-page'),
    fs = require('fs'),
    yaml = require('js-yaml'),
    debug = require('gulp-debug'),
    del = require('del'),
    cheerio = require('gulp-cheerio'),
    tap = require('gulp-tap');

// A function for loading book metadata as an object
function loadMetadata() {
    'use strict';

    var paths = [];
    var filePaths = [];
    var books = [];
    var languages = [];

    if (fileExists.sync('_data/meta.yml')) {

        var metadata = yaml.load(fs.readFileSync('_data/meta.yml', 'utf8'));
        var works = metadata.works;

        var i;
        var j;
        for (i = 0; i < works.length; i += 1) {
            books.push(works[i].directory);
            paths.push('_site/' + works[i].directory + '/text/');
            filePaths.push('_site/' + works[i].directory + '/text/*.html');
            if (works[i].translations) {
                for (j = 0; j < works[i].translations.length; j += 1) {
                    languages.push(works[i].translations[j].directory);
                    paths.push('_site/' + works[i].directory + '/' + works[i].translations[j].directory + '/text/');
                    filePaths.push('_site/' + works[i].directory + '/' + works[i].translations[j].directory + '/text/*.html');
                }
            }
        }
    }

    return {
        books: books,
        languages: languages,
        paths: paths,
        filePaths: filePaths
    };
}

// Load image settings if they exist
var imageSettings = [];
if (fs.existsSync('_data/images.yml')) {
    imageSettings = yaml.load(fs.readFileSync('_data/images.yml', 'utf8'));
}

// Get the book we're processing
var book = 'book';
if (args.book && args.book.trim !== '') {
    book = args.book;
}

// let '--folder' be an alias for '--book',
// to make sense for gulping 'assets' and '_items'
if (args.folder && args.folder.trim !== '') {
    book = args.folder;
}

// Reminder on usage
if (book === 'book') {
    console.log('If processing images for a book that\'s not in the /book directory, use the --book argument, e.g. gulp --book potatoes');
    console.log('To process images in _items, use gulp --book _items');
}

// Get the language we're processing
var language = '';
if (args.language && args.language.trim !== '') {
    language = '/' + args.language;
}

// Reminder on usage
if (language === '') {
    console.log('If processing a translation\'s images, use the --language argument, e.g. gulp --language fr');
}

// Set up paths.
// Paths to text src must include the *.html extension.
// Add paths to any JS files to minify to the src array, e.g.
// src: ['assets/js/foo.js,assets/js/bar.js'],
var paths = {
    img: {
        source: book + language + '/images/_source/',
        printpdf: book + language + '/images/print-pdf/',
        web: book + language + '/images/web/',
        screenpdf: book + language + '/images/screen-pdf/',
        epub: book + language + '/images/epub/',
        app: book + language + '/images/app/'
    },
    text: {
        src: '_site/' + book + language + '/text/*.html',
        dest: '_site/' + book + language + '/text/'
    },
    epub: {
        src: '_site/epub' + language + '/text/*.html',
        dest: '_site/epub' + language + '/text/'
    },
    js: {
        src: [],
        dest: 'assets/js/'
    }
};

// Set filetypes to convert, comma separated, no spaces
var filetypes = 'jpg,jpeg,gif,png';

// Minify and clean SVGs and copy to destinations.
// For EpubCheck-safe SVGs, we remove data- attributes
// and don't strip defaults like <style "type=text/css">
gulp.task('images:svg', function (done) {
    'use strict';
    console.log('Processing SVG images from ' + paths.img.source);
    var prefix = '';
    gulp.src(paths.img.source + '*.svg')
        .pipe(debug({title: 'Processing SVG '}))
        .pipe(tap(function (file) {
            prefix = file.basename.replace('.', '').replace(' ', '');
        }))
        .pipe(svgmin(function getOptions() {
            return {
                plugins: [
                    {
                        // We definitely want a viewBox
                        removeViewBox: false
                    },
                    {
                        // With a viewBox, we can remove these
                        removeDimensions: true
                    },
                    {
                        // We can remove data- attributes
                        removeAttrs: {
                            attrs: 'data.*'
                        }
                    },
                    {
                        // Remove unknown elements, but not default values
                        removeUnknownsAndDefaults: {
                            defaultAttrs: false
                        }
                    },
                    {
                        // We want titles for accessibility
                        removeTitle: false
                    },
                    {
                        // We want descriptions for accessibility
                        removeDesc: false
                    },
                    {
                        // Default
                        convertStyleToAttrs: true
                    },
                    {
                        // Default
                        removeUselessStrokeAndFill: true
                    },
                    {
                        // Default
                        inlineStyles: true
                    },
                    {
                        // Default
                        cleanupAttrs: true
                    },
                    {
                        // Default
                        removeDoctype: true
                    },
                    {
                        // Default
                        removeXMLProcInst: true
                    },
                    {
                        // Default
                        removeComments: true
                    },
                    {
                        // Default
                        removeMetadata: true
                    },
                    {
                        // Default
                        removeUselessDefs: true
                    },
                    {
                        // Default
                        removeXMLNS: false
                    },
                    {
                        // Default
                        removeEditorsNSData: true
                    },
                    {
                        // Default
                        removeEmptyAttrs: true
                    },
                    {
                        // Default
                        removeHiddenElems: true
                    },
                    {
                        // Default
                        removeEmptyText: true
                    },
                    {
                        // Default
                        removeEmptyContainers: true
                    },
                    {
                        // Default
                        cleanupEnableBackground: true
                    },
                    {
                        // Default
                        minifyStyles: true
                    },
                    {
                        // Default
                        convertColors: true
                    },
                    {
                        // Default
                        convertPathData: true
                    },
                    {
                        // Default
                        convertTransform: true
                    },
                    {
                        // Default
                        removeNonInheritableGroupAttrs: true
                    },
                    {
                        // Default
                        removeUselessStrokeAndFill: true
                    },
                    {
                        // Default
                        removeUnusedNS: true
                    },
                    {
                        // Default
                        prefixIds: false
                    },
                    {
                        // Prefix and minify IDs
                        cleanupIDs: {
                            prefix: prefix + '-',
                            minify: true
                        }
                    },
                    {
                        // Default
                        cleanupNumericValues: true
                    },
                    {
                        // Default
                        cleanupListOfValues: true
                    },
                    {
                        // Default
                        moveElemsAttrsToGroup: true
                    },
                    {
                        // Default
                        collapseGroups: true
                    },
                    {
                        // Default
                        removeRasterImages: false
                    },
                    {
                        // Default
                        mergePaths: true
                    },
                    {
                        // Default
                        convertShapeToPath: false
                    },
                    {
                        // Default
                        convertEllipseToCircle: true
                    },
                    {
                        // Default
                        sortAttrs: false
                    },
                    {
                        // Default
                        sortDefsChildren: true
                    },
                    {
                        // Default
                        removeAttributesBySelector: false
                    },
                    {
                        // Default
                        removeElementsByAttr: false
                    },
                    {
                        // Default
                        addClassesToSVGElement: false
                    },
                    {
                        // Default
                        addAttributesToSVGElement: false
                    },
                    {
                        // Default
                        removeOffCanvasPaths: false
                    },
                    {
                        // Default
                        removeStyleElement: false
                    },
                    {
                        // Default
                        removeScriptElement: false
                    },
                    {
                        // Default
                        reusePaths: false
                    }
                ]
            };
        }).on('error', function (e) {
            console.log(e);
        }))
        .pipe(gulp.dest(paths.img.printpdf))
        .pipe(gulp.dest(paths.img.screenpdf))
        .pipe(gulp.dest(paths.img.web))
        .pipe(gulp.dest(paths.img.epub))
        .pipe(gulp.dest(paths.img.app));
    done();
});

// Convert source images for print-pdf
gulp.task('images:printpdf', function (done) {
    'use strict';

    // Options
    var printPDFColorProfile = 'PSOcoated_v3.icc';
    var printPDFColorSpace = 'cmyk';
    var printPDFColorProfileGrayscale = 'Grey_Fogra39L.icc';
    var printPDFColorSpaceGrayscale = 'gray';

    console.log('Processing print-PDF images from ' + paths.img.source);
    if (fileExists.sync('_tools/profiles/' + printPDFColorProfile)) {
        gulp.src(paths.img.source + '*.{' + filetypes + '}')
            .pipe(newer(paths.img.printpdf))
            .pipe(debug({title: 'Creating print-PDF version of '}))
            .pipe(gm(function (gmfile) {

                // Check for grayscale
                var thisColorProfile = printPDFColorProfile; // set default/fallback
                var thisColorSpace = printPDFColorSpace; // set default/fallback
                var thisFilename = gmfile.source.split('\/').pop(); // for unix slashes
                thisFilename = thisFilename.split('\\').pop(); // for windows backslashes

                // Look up image colour settings
                imageSettings.forEach(function (image) {
                    if (image.file === thisFilename) {
                        if (image['print-pdf'].colorspace === 'gray') {
                            thisColorProfile = printPDFColorProfileGrayscale;
                            thisColorSpace = printPDFColorSpaceGrayscale;
                        }
                    }
                });

                return gmfile.profile('_tools/profiles/' + thisColorProfile).colorspace(thisColorSpace);
            }).on('error', function (e) {
                console.log(e);
            }))
            .pipe(gulp.dest(paths.img.printpdf));
    } else {
        console.log('Colour profile _tools/profiles/' + printPDFColorProfile + ' not found. Exiting.');
        return;
    }
    done();
});

// Convert and optimise source images
// for screen-pdf, web, epub, and app
gulp.task('images:optimise', function (done) {
    'use strict';

    // Options
    var imagesOptimiseColorProfile = 'sRGB_v4_ICC_preference_displayclass.icc';
    var imagesOptimiseColorSpace = 'rgb';

    console.log('Processing screen-PDF, web, epub and app images from ' + paths.img.source);
    if (fileExists.sync('_tools/profiles/' + imagesOptimiseColorProfile)) {
        gulp.src(paths.img.source + '*.{' + filetypes + '}')
            .pipe(newer(paths.img.web))
            .pipe(debug({title: 'Optimising '}))
            .pipe(responsive({
                '*': [{
                    width: 810,
                    quality: 90,
                    upscale: false
                }]
            }).on('error', function (e) {
                console.log(e);
            }))
            .pipe(gm(function (gmfile) {
                return gmfile.profile('_tools/profiles/' + imagesOptimiseColorProfile).colorspace(imagesOptimiseColorSpace);
            }).on('error', function (e) {
                console.log(e);
            }))
            .pipe(gulp.dest(paths.img.screenpdf))
            .pipe(gulp.dest(paths.img.web))
            .pipe(gulp.dest(paths.img.epub))
            .pipe(gulp.dest(paths.img.app));
    } else {
        console.log('Colour profile _tools/profiles/' + imagesOptimiseColorProfile + ' not found. Exiting.');
        return;
    }
    done();
});

// Make small images for web use in srcset
gulp.task('images:small', function (done) {
    'use strict';

    // Options
    var imagesSmallColorProfile = 'sRGB_v4_ICC_preference_displayclass.icc';
    var imagesSmallColorSpace = 'rgb';

    console.log('Creating small web images from ' + paths.img.source);
    if (fileExists.sync('_tools/profiles/' + imagesSmallColorProfile)) {
        gulp.src(paths.img.source + '*.{' + filetypes + '}')
            .pipe(newer(paths.img.web))
            .pipe(debug({title: 'Creating small '}))
            .pipe(responsive({
                '*': [{
                    width: 320,
                    quality: 90,
                    upscale: false,
                    suffix: '-320'
                }]
            }).on('error', function (e) {
                console.log(e);
            }))
            .pipe(gm(function (gmfile) {
                return gmfile.profile('_tools/profiles/' + imagesSmallColorProfile).colorspace(imagesSmallColorSpace);
            }).on('error', function (e) {
                console.log(e);
            }))
            .pipe(gulp.dest(paths.img.web));
    } else {
        console.log('Colour profile _tools/profiles/' + imagesSmallColorProfile + ' not found. Exiting.');
        return;
    }
    done();
});

// Make medium images for web use in srcset
gulp.task('images:medium', function (done) {
    'use strict';

    // Options
    var imagesMediumColorProfile = 'sRGB_v4_ICC_preference_displayclass.icc';
    var imagesMediumColorSpace = 'rgb';

    console.log('Creating medium web images from ' + paths.img.source);
    if (fileExists.sync('_tools/profiles/' + imagesMediumColorProfile)) {
        gulp.src(paths.img.source + '*.{' + filetypes + '}')
            .pipe(newer(paths.img.web))
            .pipe(debug({title: 'Creating medium '}))
            .pipe(responsive({
                '*': [{
                    width: 640,
                    quality: 90,
                    upscale: false,
                    suffix: '-640'
                }]
            }).on('error', function (e) {
                console.log(e);
            }))
            .pipe(gm(function (gmfile) {
                return gmfile.profile('_tools/profiles/' + imagesMediumColorProfile).colorspace(imagesMediumColorSpace);
            }).on('error', function (e) {
                console.log(e);
            }))
            .pipe(gulp.dest(paths.img.web));
    } else {
        console.log('Colour profile _tools/profiles/' + imagesMediumColorProfile + ' not found. Exiting.');
        return;
    }
    done();
});

// Make large images for web use in srcset
gulp.task('images:large', function (done) {
    'use strict';

    // Options
    var imagesLargeColorProfile = 'sRGB_v4_ICC_preference_displayclass.icc';
    var imagesLargeColorSpace = 'rgb';

    console.log('Creating large web images from ' + paths.img.source);
    if (fileExists.sync('_tools/profiles/' + imagesLargeColorProfile)) {
        gulp.src(paths.img.source + '*.{' + filetypes + '}')
            .pipe(newer(paths.img.web))
            .pipe(debug({title: 'Creating large '}))
            .pipe(responsive({
                '*': [{
                    width: 1024,
                    quality: 90,
                    upscale: false,
                    suffix: '-1024'
                }]
            }).on('error', function (e) {
                console.log(e);
            }))
            .pipe(gm(function (gmfile) {
                return gmfile.profile('_tools/profiles/' + imagesLargeColorProfile).colorspace(imagesLargeColorSpace);
            }).on('error', function (e) {
                console.log(e);
            }))
            .pipe(gulp.dest(paths.img.web));
    } else {
        console.log('Colour profile _tools/profiles/' + imagesLargeColorProfile + ' not found. Exiting.');
        return;
    }
    done();
});

// Make extra-large images for web use in srcset
gulp.task('images:xlarge', function (done) {
    'use strict';

    // Options
    var imagesXLargeColorProfile = 'sRGB_v4_ICC_preference_displayclass.icc';
    var imagesXLargeColorSpace = 'rgb';

    console.log('Creating extra-large web images from ' + paths.img.source);
    if (fileExists.sync('_tools/profiles/' + imagesXLargeColorProfile)) {
        gulp.src(paths.img.source + '*.{' + filetypes + '}')
            .pipe(newer(paths.img.web))
            .pipe(debug({title: 'Creating extra-large '}))
            .pipe(responsive({
                '*': [{
                    width: 2048,
                    quality: 90,
                    upscale: false,
                    suffix: '-2048'
                }]
            }).on('error', function (e) {
                console.log(e);
            }))
            .pipe(gm(function (gmfile) {
                return gmfile.profile('_tools/profiles/' + imagesXLargeColorProfile).colorspace(imagesXLargeColorSpace);
            }).on('error', function (e) {
                console.log(e);
            }))
            .pipe(gulp.dest(paths.img.web));
    } else {
        console.log('Colour profile _tools/profiles/' + imagesXLargeColorProfile + ' not found. Exiting.');
        return;
    }
    done();
});

// Make full-quality images in RGB
gulp.task('images:max', function (done) {
    'use strict';

    // Options
    var imagesMaxColorProfile = 'sRGB_v4_ICC_preference_displayclass.icc';
    var imagesMaxColorSpace = 'rgb';

    console.log('Creating max-quality web images from ' + paths.img.source);
    if (fileExists.sync('_tools/profiles/' + imagesMaxColorProfile)) {
        gulp.src(paths.img.source + '*.{' + filetypes + '}')
            .pipe(newer(paths.img.web))
            .pipe(debug({title: 'Creating max-quality '}))
            .pipe(gm(function (gmfile) {
                return gmfile.quality(100).profile('_tools/profiles/' + imagesMaxColorProfile).colorspace(imagesMaxColorSpace);
            }).on('error', function (e) {
                console.log(e);
            }))
            .pipe(rename({suffix: "-max"}))
            .pipe(gulp.dest(paths.img.web));
    } else {
        console.log('Colour profile _tools/profiles/' + imagesMaxColorProfile + ' not found. Exiting.');
        return;
    }
    done();
});

// Minify JS files to make them smaller,
// using the drop_console option to remove console logging
gulp.task('js', function (done) {
    'use strict';

    if (paths.js.src.length > 0) {
        console.log('Minifying Javascript');
        gulp.src(paths.js.src)
            .pipe(debug({title: 'Minifying '}))
            .pipe(uglify({compress: {drop_console: true}}).on('error', function (e) {
                console.log(e);
            }))
            .pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest(paths.js.dest));
        done();
    } else {
        console.log('No scripts in source list to minify.');
        done();
    }
});

// Process MathJax in output HTML

// Settings for mathjax-node-page. leave empty for defaults.
// https://www.npmjs.com/package/gulp-mathjax-page
var mjpageOptions = {
    mjpageConfig: {
        format: ["TeX"], // determines type of pre-processors to run
        output: 'svg', // global override for output option; 'svg', 'html' or 'mml'
        tex: {}, // configuration options for tex pre-processor, cf. lib/tex.js
        ascii: {}, // configuration options for ascii pre-processor, cf. lib/ascii.js
        singleDollars: false, // allow single-dollar delimiter for inline TeX
        fragment: false, // return body.innerHTML instead of full document
        cssInline: true,  // determines whether inline css should be added
        jsdom: {}, // jsdom-related options
        displayMessages: false, // determines whether Message.Set() calls are logged
        displayErrors: true, // determines whether error messages are shown on the console
        undefinedCharError: false, // determines whether unknown characters are saved in the error array
        extensions: '', // a convenience option to add MathJax extensions
        fontURL: '', // for webfont urls in the CSS for HTML output
        MathJax: {
            messageStyle: "none",
            SVG: {
                font: "Gyre-Pagella",
                matchFontHeight: false,
                blacker: 0,
                styles: {
                    ".MathJax [style*=border-top-width]": {
                        "border-top-width": "0.5pt ! important"
                    }
                }
            }
        } // options MathJax configuration, see https://docs.mathjax.org
    },
    mjnodeConfig: {
        ex: 6, // ex-size in pixels (ex is an x-height unit)
        width: 100, // width of math container (in ex) for linebreaking and tags
        useFontCache: true, // use <defs> and <use> in svg output?
        useGlobalCache: false, // use common <defs> for all equations?
        // state: mjstate, // track global state
        linebreaks: true, // do linebreaking?
        equationNumbers: "none", // or "AMS" or "all"
        math: "", // the math to typeset
        html: false, // generate HTML output?
        css: false, // generate CSS for HTML output?
        mml: false, // generate mml output?
        svg: true, // generate svg output?
        speakText: false, // add spoken annotations to output?
        timeout: 10 * 1000 // 10 second timeout before restarting MathJax
    }
};

// Process MathJax in HTML files
gulp.task('mathjax', function (done) {
    'use strict';

    console.log('Processing MathJax in ' + paths.text.src);
    gulp.src(paths.text.src)
        .pipe(mathjax(mjpageOptions))
        .pipe(debug({title: 'Processing MathJax in '}))
        .pipe(gulp.dest(paths.text.dest));
    done();
});

// Process MathJax in all HTML files
gulp.task('mathjax:all', function (done) {
    'use strict';
    var k;
    var mathJaxFilePaths = loadMetadata().paths;
    for (k = 0; k < mathJaxFilePaths.length; k += 1) {
        console.log('Processing MathJax in ' + mathJaxFilePaths[k]);
        gulp.src(mathJaxFilePaths[k] + '*.html')
            .pipe(mathjax(mjpageOptions))
            .pipe(debug({title: 'Processing MathJax in '}))
            .pipe(gulp.dest(mathJaxFilePaths[k]));
        done();
    }
});

// Convert all file names in internal links from .html to .xhtml.
// This is required for epub output to avoid EPUBCheck warnings.
gulp.task('epub:xhtmlLinks', function (done) {
    'use strict';

    gulp.src([paths.epub.src, '_site/epub/package.opf', '_site/epub/toc.ncx'], {base: './'})
        .pipe(cheerio({
            run: function ($) {
                var target, newTarget;
                $('[href*=".html"], [src*=".html"]').each(function () {
                    if ($(this).attr('href')) {
                        target = $(this).attr('href');
                    } else if ($(this).attr('src')) {
                        target = $(this).attr('src');
                    } else {
                        return;
                    }

                    if (target.includes('.html') && !target.includes('http')) {
                        newTarget = target.replace('.html', '.xhtml');
                        if ($(this).attr('href')) {
                            $(this).attr('href', newTarget);
                        } else if ($(this).attr('src')) {
                            $(this).attr('src', newTarget);
                        }
                    }
                });
            },
            parserOptions: {
                xmlMode: true
            }
        }))
        .pipe(debug({title: 'Converting internal links to .xhtml in '}))
        .pipe(gulp.dest('./'));
    done();
});

// Rename epub .html files to .xhtml.
// Creates a copy of the file that must then be cleaned out
// with the subsequent gulp task `epub:cleanHtmlFiles``
gulp.task('epub:xhtmlFiles', function (done) {
    'use strict';

    console.log('Renaming *.html to *.xhtml in ' + paths.epub.src);
    gulp.src(paths.epub.src)
        .pipe(debug({title: 'Renaming '}))
        .pipe(rename({
            extname: '.xhtml'
        }))
        .pipe(gulp.dest(paths.epub.dest));
    done();
});

// Clean out renamed .html files
gulp.task('epub:cleanHtmlFiles', function () {
    'use strict';
    console.log('Removing old *.html files in ' + paths.epub.src);
    return del(paths.epub.src);
});

// when running `gulp`, do the image tasks
gulp.task('default', gulp.series(
    'images:svg',
    'images:printpdf',
    'images:optimise',
    'images:small',
    'images:medium',
    'images:large',
    'images:xlarge',
    'images:max'
));
