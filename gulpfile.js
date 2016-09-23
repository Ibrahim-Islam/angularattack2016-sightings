var gulp = require("gulp"),
    rimraf = require("rimraf"),
    plugins = require("gulp-load-plugins")({
        lazy: true
    }),
    runSequence = require("run-sequence");

var paths = {
    vendorScripts: [
        "node_modules/es6-shim/es6-shim.js",
        "node_modules/zone.js/dist/zone.js",
        "node_modules/reflect-metadata/Reflect.js",
        "node_modules/reflect-metadata/Reflect.js.map",
        "node_modules/systemjs/dist/system.src.js",
        "node_modules/jquery/dist/jquery.js",
        "node_modules/bootstrap/dist/js/bootstrap.js",
        "node_modules/bootstrap-material-design/dist/js/material.js",
        "node_modules/firebase/lib/firebase-web.js",
        "node_modules/primeui/primeui-ng-all.min.js",
        "node_modules/quill/dist/quill.js",
        "node_modules/toastr/toastr.js"
    ],
    vendorCss: [
        "node_modules/bootstrap/dist/css/bootstrap.css",
        "node_modules/bootstrap-material-design/dist/css/bootstrap-material-design.css",
        "node_modules/bootstrap-material-design/dist/css/ripples.css",
        "node_modules/bootstrap/dist/css/bootstrap.css.map",
        "node_modules/bootstrap-material-design/dist/css/bootstrap-material-design.css.map",
        "node_modules/bootstrap-material-design/dist/css/ripples.css.map",
        "node_modules/font-awesome/css/font-awesome.css",
        "node_modules/primeui/primeui-ng-all.min.css",
        "node_modules/quill/dist/quill.snow.css",
        "node_modules/toastr/build/toastr.css"
    ],
    vendorFonts: [
        "node_modules/font-awesome/fonts/*.*"
    ],
    vendorCssDist: "/vendors/css",
    vendorScriptsDist: "/vendors/js",
    vendorFontsDist: "/vendors/fonts",
    src: [
        "src/index.html",
        "src/**/*.html",
        "src/**/*.css",
        "src/favicon.ico",
        "CNAME"
    ],
    wwwroot: "dist"
};

gulp.task("copy:angular", function() {
    return gulp.src(["node_modules/@angular/**/*.js", "node_modules/@angular/**/*.js.map"])
        .pipe(gulp.dest(paths.wwwroot + paths.vendorScriptsDist + "/@angular"));
});

gulp.task("copy:angularfire2", function() {
    return gulp.src(["node_modules/angularfire2/**/*.js", "node_modules/angularfire2/**/*.js.map"])
        .pipe(gulp.dest(paths.wwwroot + paths.vendorScriptsDist + "/angularfire2"));
});

gulp.task("copy:primeng", function() {
    return gulp.src(["node_modules/primeng/**/*.*"])
        .pipe(gulp.dest(paths.wwwroot + paths.vendorScriptsDist + "/primeng"));
});

gulp.task("copy:rxjs", function() {
    return gulp.src(["node_modules/rxjs/**/*.js", "node_modules/rxjs/**/*.js.map"])
        .pipe(gulp.dest(paths.wwwroot + paths.vendorScriptsDist + "/rxjs"));
});

gulp.task("copy:vendorScripts", function() {
    return gulp.src(paths.vendorScripts)
        .pipe(gulp.dest(paths.wwwroot + paths.vendorScriptsDist));
});

gulp.task("copy:vendorCss", function() {
    return gulp.src(paths.vendorCss)
        .pipe(gulp.dest(paths.wwwroot + paths.vendorCssDist));
});

gulp.task("copy:vendorFonts", function() {
    return gulp.src(paths.vendorFonts)
        .pipe(gulp.dest(paths.wwwroot + paths.vendorFontsDist));
});

gulp.task("copy:deps", function(done) {
    runSequence("copy:vendorScripts", "copy:vendorCss", "copy:vendorFonts", "copy:angular", "copy:angularfire2", "copy:rxjs", "copy:primeng", done);
});

gulp.task("copy:src", function() {
    return gulp.src(paths.src).pipe(gulp.dest(paths.wwwroot));
});

gulp.task("tsc", plugins.shell.task("npm run tsc"));

gulp.task("compile:app", ["tsc"], function() {
    return gulp.src(["src/**/*.js"])
        .pipe(gulp.dest(paths.wwwroot))
        .pipe(plugins.connect.reload());
});

gulp.task("clean:wwwroot", function(cb) {
    rimraf(paths.wwwroot, cb);
});

gulp.task("server", function() {
    plugins.connect.server({
        root: paths.wwwroot,
        livereload: true,
        fallback: paths.wwwroot + "/index.html"
    });
});

gulp.task("watch", function () {
    gulp.watch(["src/**/*.ts"], ["compile:app"]);
    gulp.watch(["src/**/.js", "src/**/*.html", "src/**/*.css"], ["copy:src"]);
});

gulp.task("default", function(done) {
    runSequence("clean:wwwroot", "copy:deps", "copy:src", "compile:app", ["server", "watch"], done);
});
