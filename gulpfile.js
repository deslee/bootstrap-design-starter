var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var environments = require('gulp-environments'),
    production = environments.production,
    development = environments.development;

var paths = {
    html: [
        './source/**/*.html'
    ],
    js: [
        './source/**/*.js'
    ],
    scss: [
        "./source/scss/style.scss"
    ],
    outputDir: './www'
};

var options = {
    watch: {
        verbose: true,
        ignoreInitial: false
    }
};

gulp.task('scss', function() {
    return production() ? task() : plugins.watch('./source/**/*.scss', options.watch, function() {
        return task();
    });

    function task() {
        var stream = gulp.src(paths.scss);
        stream = development() ? stream.pipe(plugins.plumber()) : stream;
        stream = development() ? stream.pipe(plugins.sourcemaps.init()) : stream;
        stream = stream.pipe(plugins.sass().on('error', plugins.sass.logError))
        stream = development() ? stream.pipe(plugins.sourcemaps.write()) : stream;
        stream = stream.pipe(gulp.dest(paths.outputDir));

        return stream;
    }
});

gulp.task('js', function() {
    return production() ? task() : plugins.watch(paths.js, options.watch, function() {
       return task();
    });

    function task() {
        var stream = gulp.src(paths.js);
        stream = development() ? stream.pipe(plugins.plumber()) : stream;
        stream = development() ? stream.pipe(plugins.sourcemaps.init()) : stream;
        stream = stream.pipe(plugins.concat('bundle.js'));
        stream = production() ? stream.pipe(plugins.uglify()) : stream; // only uglify in production
        stream = development() ? stream.pipe(plugins.sourcemaps.write()) : stream;
        stream = stream.pipe(gulp.dest(paths.outputDir));

        return stream;
    }
});

gulp.task('html', function() {
    var stream = development() ? plugins.watch(paths.html, options.watch) : gulp.src(paths.html);
    stream = development() ? stream.pipe(plugins.plumber()) : stream;
    stream = stream.pipe(plugins.html()); // html lint
    stream = stream.pipe(plugins.bootlint()); // bootstrap lint
    stream = production() ? stream.pipe(plugins.htmlmin({collapseWhitespace: true})) : stream;
    stream = stream.pipe(gulp.dest(paths.outputDir));

    return stream;
});

gulp.task('default', ['html', 'js', 'scss'], function() {
});

if (production()) {
    console.log("running in production")
} else if (development()) {
    console.log("running in development")
}
