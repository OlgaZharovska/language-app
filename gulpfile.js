// var gulp = require('gulp');
// var sass = require('gulp-sass');
// // var browserSync = require('browser-sync').create();

// gulp.task('server', function() {
//     // browserSync.init({
//     //     server: {baseDir: './src/'}
//     // });

//     // gulp.watch('src/**/*.html').on('change', browserSync.reload);
//     gulp.watch('./sass/**/*.scss', gulp.series('sass'));
//     // gulp.watch('src/js/**/*.js').on('change', browserSync.reload);
// });

// gulp.task('sass', function() {
//     return gulp.src('./sass/main.scss')
//         .pipe(sass())
//         .pipe(gulp.dest('./public/app.css'));
//         // .pipe(browserSync.stream());
// });

// gulp.task('default', gulp.series('server', 'sass'));
