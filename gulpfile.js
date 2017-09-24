var gulp = require('gulp');
var gutil = require('gulp-util');
var gulpif = require('gulp-if');
var streamify = require('gulp-streamify');
var autoprefixer = require('gulp-autoprefixer');
var cssmin = require('gulp-cssmin');
var less = require('gulp-less');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');

var babelify = require('babelify');
var browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    standalonify = require('standalonify'),
    argv = require('yargs').argv;
var watchify = require('watchify');
var uglify = require('gulp-uglify');


var production = process.env.NODE_ENV === 'production';

var dependencies = [
    'alt',
    'react',
    'react-router',
    'underscore'
];

/*
 |--------------------------------------------------------------------------
 | Combine all JS libraries into a single file for fewer HTTP requests.
 |--------------------------------------------------------------------------
 */
gulp.task('vendor', function () {
    return gulp.src([
        'bower_components/jquery/dist/jquery.js',
        'bower_components/bootstrap/dist/js/bootstrap.js',
        'bower_components/magnific-popup/dist/jquery.magnific-popup.js',
        'bower_components/toastr/toastr.js'
    ]).pipe(concat('vendor.js'))
        .pipe(gulpif(production, uglify({mangle: false})))
        .pipe(gulp.dest('public/js'));
});

/*
 |--------------------------------------------------------------------------
 | Compile third-party dependencies separately for faster performance.
 |--------------------------------------------------------------------------
 */
gulp.task('browserify-vendor', function () {
    return browserify()
        .require(dependencies)
        .bundle()
        .pipe(source('vendor.bundle.js'))
        .pipe(gulpif(production, streamify(uglify({mangle: false}))))
        .pipe(gulp.dest('public/js'));
});

/*
 |--------------------------------------------------------------------------
 | Compile only project files, excluding all third-party dependencies.
 |--------------------------------------------------------------------------
 */
function getJsLibName() {
    var libName = 'bundle.js';
    if (argv.min) {  //按命令参数"--min"判断是否为压缩版
        libName = 'bundle.min.js';
    }

    return libName;
}
gulp.task('browserify', ['browserify-vendor'], function () {
    return browserify('app/main.js')
        .plugin(standalonify, {  //使打包后的js文件符合UMD规范并指定外部依赖包
            name: 'FlareJ',
            deps: {
                'react': 'React',
                'react-dom': 'ReactDOM',
                'react-router':"BrowserRouter"
            }
        })
        .external(dependencies)
        .transform(babelify, {  //此处babel的各配置项格式与.babelrc文件相同
            presets: [
                'es2015',  //转换es6代码
                'stage-0',  //指定转换es7代码的语法提案阶段
                'react'  //转换React的jsx
            ],
            plugins: [
                'transform-object-assign',  //转换es6 Object.assign插件
                'external-helpers',  //将es6代码转换后使用的公用函数单独抽出来保存为babelHelpers
                ['transform-es2015-classes', {"loose": false}],  //转换es6 class插件
                ['transform-es2015-modules-commonjs', {"loose": false}]  //转换es6 module插件

            ]
        })
        .bundle()
        .pipe(source(getJsLibName()))  //将常规流转换为包含Stream的vinyl对象，并且重命名
        .pipe(buffer())  //将vinyl对象内容中的Stream转换为Buffer
        .pipe(gulp.dest('./public/js'));  //输出打包后的文件
});

/*
 |--------------------------------------------------------------------------
 | Same as browserify task, but will also watch for changes and re-compile.
 |--------------------------------------------------------------------------
 */
gulp.task('browserify-watch', ['browserify-vendor'], function () {
    var bundler = watchify(browserify('app/main.js', watchify.args));
    bundler.external(dependencies);
    bundler.transform(babelify);
    bundler.on('update', rebundle);
    return rebundle();

    function rebundle() {
        var start = Date.now();
        return bundler.bundle()
            .on('error', function (err) {
                gutil.log(gutil.colors.red(err.toString()));
            })
            .on('end', function () {
                gutil.log(gutil.colors.green('Finished rebundling in', (Date.now() - start) + 'ms.'));
            })
            .pipe(source('bundle.js'))
            .pipe(gulp.dest('public/js/'));
    }
});

/*
 |--------------------------------------------------------------------------
 | Compile LESS stylesheets.
 |--------------------------------------------------------------------------
 */
gulp.task('styles', function () {
    return gulp.src('app/stylesheets/main.less')
        .pipe(plumber())
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(gulpif(production, cssmin()))
        .pipe(gulp.dest('public/css'));
});

gulp.task('watch', function () {
    gulp.watch('app/stylesheets/**/*.less', ['styles']);
});

//gulp.task('default', ['styles', 'vendor', 'browserify-watch', 'watch']);
gulp.task('default', ['styles', 'vendor', 'browserify']);
gulp.task('build', ['styles', 'vendor', 'browserify']);