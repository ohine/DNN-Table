var gulp = require('gulp');
var traceur = require('gulp-traceur');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var jscs = require('gulp-jscs');
var eslint = require('gulp-eslint');
var jshint = require('gulp-jshint');
var path = require('path');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var zip = require('gulp-zip');

var versionString = '01_00_00';
var projPath = 'Website/Resources/Libraries/dnn-table/';
var destPath = projPath + 'dest/' + versionString + '/';
var jsSrc = path.join(projPath + versionString, '/**/*.js');
var srcFiles = path.join(projPath + versionString, '/**/*');

gulp.task('dnn-table', function () {
	var self = this;
	
	return gulp.src(jsSrc)
			.pipe(plumber({ errorHandler: notify.onError({ title: '<%= error.plugin %>', message: '<%= error.message %>'}) }))
			.pipe(sourcemaps.init())
			.pipe(jscs({ esnext: true, configPath: '.jscsrc' }))
			.pipe(jshint())
			.pipe(eslint())
			.pipe(eslint.format())
			.pipe(eslint.failOnError())
			.pipe(traceur())
			.pipe(uglify())
			.pipe(rename({ suffix: '.min' }))
			.pipe(sourcemaps.write('.'))
			.pipe(gulp.dest(destPath));
});

gulp.task('watch', ['default'], function() {
	gulp.watch(jsSrc, ['dnn-table']);
});

gulp.task('package', ['default'], function() {
	return gulp.src([
				path.join(projPath + versionString, '/**/*.dnn'),
				path.join(projPath + versionString, '/**/*.htm'),
				path.join(projPath + 'dest/' + versionString + '/', '/**/*'),
			])
			.pipe(zip('Install_' + versionString + '.zip'))
			.pipe(gulp.dest(projPath + 'installs/'));
});

gulp.task('default', ['dnn-table'], function(done) {
	done();
});