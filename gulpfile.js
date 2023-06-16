"use strict"

const {src, dest} = require("gulp");
const gulp = require("gulp");
const autoprefixer = require("gulp-autoprefixer");
const cssbeautify = require("gulp-cssbeautify");
const removeComments = require("gulp-strip-css-comments");
const rename = require("gulp-rename");
const sass = require("gulp-sass")(require('sass'));
const cssnano = require("gulp-cssnano");
const uglify = require("gulp-uglify");
const plumber = require("gulp-plumber");
const rigger = require("gulp-rigger");
// const panini = require("panini");
const imagemin = require("gulp-imagemin");
const del = require("del");
const notify = require("gulp-notify");
const browserSync = require("browser-sync").create();

/* Paths */

const srsPath = "src/";
const distPath = "dist/"

const path = {
    build: {
        html: distPath,
        css: distPath + "assets/css/",
        js: distPath + "assets/js/",
        images: distPath + "assets/images/",
        fonts: distPath + "assets/fonts/"
    },
    src: {
        html: srsPath + "*.html",
        css: srsPath + "assets/scss/*.scss",
        js: srsPath + "assets/js/*.js",
        images: srsPath + "assets/images/**/*.{jpeg,png,svg,jpg,ico,webp,webmanifest,xml,json}",
        fonts: srsPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    watch: {
        html: srsPath + "*.html",
        css: srsPath + "assets/scss/**/*.scss",
        js: srsPath + "assets/js/**/*.js",
        images: srsPath + "assets/images/**/*.{jpeg,png,svg,jpg,ico,webp,webmanifest,xml,json}",
        fonts: srsPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    clean: "./" + distPath
}

function serve(){
    browserSync.init({
        server: {
            baseDir: "./" + distPath,
            directory: true
        }
    });
}

function html(){
    // panini.refresh()
    return src(path.src.html, {base: srsPath})
    .pipe(plumber())
    // .pipe(panini({
    //     root: srsPath,
    //     layouts: srsPath + "templates/layouts/",
    //     partials: srsPath + "templates/partials/",
    //     data: srsPath + "templates/data/",
    // }))
    .pipe(dest(path.build.html))
    .pipe(browserSync.reload({stream:true}))
}

function css(){
    return src(path.src.css, {base: srsPath + "assets/scss/"})
    .pipe(plumber({
        errorHandler: function(err){
            notify.onError({
                title: "Scss Error",
                message: "Error: <%= error.message %>"
            })(err);
            this.emit('end');
        }
    }))
    .pipe(sass())
    .pipe(autoprefixer({
        overrideBrowserslist:['ie >= 8', 'last 4 version']
    }))
    .pipe(cssbeautify())
    .pipe(rigger())
    .pipe(dest(path.build.css))
    .pipe(cssnano({
        zindex:false,
        discardComments: {
            removeAll: true
        }
    }))
    .pipe(removeComments())
    .pipe(autoprefixer({
        overrideBrowserslist:['ie >= 8', 'last 4 version']
    }))
    .pipe(rename({
        suffix: ".min",
        extname: ".css"
    }))
    .pipe(dest(path.build.css))
    .pipe(browserSync.reload({stream:true}))
}

function js(){
    return src(path.src.js, {base: srsPath + "assets/js/"})
    .pipe(plumber({
        errorHandler: function(err){
            notify.onError({
                title: "Js Error",
                message: "Error: <%= error.message %>"
            })(err);
            this.emit('end');
        }
    }))
    .pipe(rigger())
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(rename({
        suffix: ".min",
        extname: ".js"
    }))
    .pipe(dest(path.build.js))
    .pipe(browserSync.reload({stream:true}))
}

function images(){
    return src(path.src.images, {base: srsPath + "assets/images/"})
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 80, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ]))
    .pipe(dest(path.build.images))
    .pipe(browserSync.reload({stream:true}))
}

function fonts(){
    return src(path.src.fonts, {base: srsPath + "assets/fonts/"})
    .pipe(browserSync.reload({stream:true}))
}

function clean(){
    return del(path.clean)
}

function watchFiles(){
    gulp.watch([path.watch.html], html)
    gulp.watch([path.watch.css], css)
    gulp.watch([path.watch.js], js)
    gulp.watch([path.watch.images], images)
    gulp.watch([path.watch.fonts], fonts)
}

const build = gulp.series(clean, gulp.parallel(html,css,js,images,fonts))
const watch = gulp.parallel(build, watchFiles, serve)

exports.html = html
exports.css = css
exports.js = js
exports.images = images
exports.fonts = fonts
exports.clean = clean
exports.build = build
exports.watch = watch
exports.default = watch
