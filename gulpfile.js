'use strict';

var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

var browserify = require("browserify");
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');

var tsify = require("tsify");

function taskBundle(name, options) {

  gulp.task(name, function () {

    var result = browserify({
        basedir: '.',
        debug: false,
        entries: [ './src.ts/' ],
        cache: {},
        packageCache: {},
//        standalone: "EthersLedger",
//        transform: [ [ transform, { global: true } ] ],
    })
    .plugin(tsify)
    .bundle()
    .pipe(source(options.filename))

    if (options.minify) {
        result = result.pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
    }

    result = result.pipe(gulp.dest("dist"));

    return result;
  });
}

// Creates dist/ethers.js
taskBundle("default", { filename: "ethers-ledger.js", minify: false });

// Creates dist/ethers.min.js
taskBundle("minified", { filename: "ethers-ledger.min.js", minify: true });
