const gulp = require('gulp');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const htmlmin = require('gulp-htmlmin');
const watch = require('gulp-watch');

gulp.task('jsmin', _ => {
    gulp.src('./src-js/*.js')
        .pipe(babel({presets: ['env']}))
        .pipe(uglify({
		  mangle: false,
		  //mangle:{except:['require','exports','module','$']}//排除混淆关键字
		}))
        .pipe(gulp.dest('./src/src/js'))
});
gulp.task('jsmincore', _ => {
    gulp.src('./src-js/core/*.js')
        .pipe(babel({presets: ['env']}))
        .pipe(uglify({ mangle: false}))
        .pipe(gulp.dest('./src/src/js/core'))
});

gulp.task('htmlmin', _ => {
    var options = {
        collapseWhitespace:true,
        collapseBooleanAttributes:true,
        removeComments:true,
        removeEmptyAttributes:true,
        removeScriptTypeAttributes:true,
        removeStyleLinkTypeAttributes:true,
        minifyCSS:true
    };
    gulp.src('./*.html')
        .pipe(htmlmin(options))
        .pipe(gulp.dest('./src'));
});

gulp.task('watch', function () {
    w('./src-js/**', 'jsmin');
    function w(path, task){
        watch(path, function () {
            gulp.start(task);
        });
    }
});

gulp.task('default',_ =>  gulp.start('watch'));