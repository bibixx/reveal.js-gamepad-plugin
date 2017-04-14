/* eslint comma-dangle: 0 */
// General
const argv = require( "yargs" ).argv;
const browserSync = require( "browser-sync" );
const gulp = require( "gulp" );
const gulpif = require( "gulp-if" );
const gutil = require( "gulp-util" );
const sourcemaps = require( "gulp-sourcemaps" );

// JS
const babelify = require( "babelify" ); // eslint-disable-line no-unused-vars
const browserify = require( "browserify" );
const buffer = require( "vinyl-buffer" );
const rename = require( "gulp-rename" );
const source = require( "vinyl-source-stream" );
const stripDebug = require( "gulp-strip-debug" );
const uglify = require( "gulp-uglify" );
const watchify = require( "watchify" );

// Constants
const SOURCE_PATH = "./src";
const BUILD_PATH = "./build";

/**
 * Simple way to check for development/production mode.
 */
function isProduction() {
  return argv.production;
}

/**
 * Logs the current build mode on the console.
 */
function logBuildMode() {
  if ( isProduction() ) {
    gutil.log( gutil.colors.green( "Running production build..." ) );
  } else {
    gutil.log( gutil.colors.red( "Running development build..." ) );
  }
}

/**
 * Handles errors
 */
function logError( err ) {
  if ( err.fileName ) {
    gutil.log( `${gutil.colors.red( err.name )}: ${gutil.colors.yellow( err.fileName.replace( `${__dirname}/src/js/`, "" ) )}: Line ${gutil.colors.magenta( err.lineNumber )} & Column ${gutil.colors.magenta( err.columnNumber || err.column )}: ${gutil.colors.blue( err.description )}` );
  } else {
    // Browserify error..
    gutil.log( `${gutil.colors.red( err.name )}: ${gutil.colors.yellow( err.message )}` );
  }
}

/**
 * Converts time to appropriate unit.
 */
function showDuration( t ) {
  if ( t >= 1000 ) {
    return `${t / 1000} s`;
  }

  if ( t <= 1 ) {
    return `${t * 1000} μs`;
  }

  return `${t} ms`;
}

/**
 * Transforms ES2015 code into ES5 code.
 * Creates sourcemaps if production.
 * Uglifies if not in production.
 */
function buildScript( path ) {
  const filename = path.split( "/" ).pop();
  const bundler = browserify( path, {
    basedir: __dirname,
    debug: true,
    cache: {},
    packageCache: {},
    plugin: [watchify],
  } );

  bundler.transform( "babelify", { presets: ["es2015"] } );

  const rebundle = function() {
    const timer = Date.now();

    const stream = bundler.bundle().on( "end", () => {
      gutil.log( `Started '${gutil.colors.cyan( "scripts" )}' ('${gutil.colors.cyan( filename )}')...` );
    } );

    let production = true;

    stream
      .on( "error", logError )
      .pipe( source( filename ) )
      .pipe( buffer() )
      .pipe( sourcemaps.init( { loadMaps: true } ) )
      .pipe( gulpif( production, stripDebug() ) )
      .pipe( gulpif( production, uglify() ) )
      .pipe( gulpif( production, rename( {
        suffix: ".min",
      } ) ) )
      .pipe( sourcemaps.write( "./" ) )
      .pipe( gulp.dest( `${BUILD_PATH}/` ) )
      .on( "end", () => {
        const taskName = `'${gutil.colors.cyan( "scripts" )}' ('${gutil.colors.cyan( filename )}')`;
        const taskTime = gutil.colors.magenta( showDuration( Date.now() - timer ) );
        gutil.log( `Finished ${taskName} after ${taskTime}` );
      } )
      .pipe( browserSync.stream() );

    production = false;

    return stream
      .on( "error", logError )
      .pipe( source( filename ) )
      .pipe( buffer() )
      .pipe( sourcemaps.init( { loadMaps: true } ) )
      .pipe( gulpif( production, stripDebug() ) )
      .pipe( gulpif( production, uglify() ) )
      .pipe( gulpif( production, rename( {
        suffix: ".min",
      } ) ) )
      .pipe( sourcemaps.write( "./" ) )
      .pipe( gulp.dest( `${BUILD_PATH}/` ) )
      .on( "end", () => {
        const taskName = `'${gutil.colors.cyan( "scripts" )}' ('${gutil.colors.cyan( filename )}')`;
        const taskTime = gutil.colors.magenta( showDuration( Date.now() - timer ) );
        gutil.log( `Finished ${taskName} after ${taskTime}` );
      } )
      .pipe( browserSync.stream() );
  };

  bundler.on( "update", rebundle );
  return rebundle();
}

gulp.task( "default", () => {
  logBuildMode();
  buildScript( `${SOURCE_PATH}/gamepad.js` );
} );
