_ = require 'lodash'
gulp = require 'gulp'
gutil = require 'gulp-util'
browserify = require 'browserify'
source = require 'vinyl-source-stream'
concat = require 'gulp-concat'
rework = require 'gulp-rework'
reworkNpm = require 'rework-npm'
browserSync = require 'browser-sync'
reload = browserSync.reload
coffee = require 'gulp-coffee' 
watchify = require 'watchify'

# Compile coffeescript to js in lib/
gulp.task 'coffee', ->
  gulp.src('./src/**/*.coffee')
    .pipe(coffee({ bare: true }))
    .pipe(gulp.dest('./lib/'))

# Copy non-coffeescript files
gulp.task 'copy', ->
  gulp.src(['./src/**/*.js', './src/**/*.css', './src/**/*.txt'])
    .pipe(gulp.dest('./lib/'))

makeBrowserifyBundle = ->
  shim(browserify("./demo.coffee",
    extensions: [".coffee"]
    basedir: "./src/"
  ))

bundleDemoJs = (bundle) ->
  bundle.bundle()
    .on("error", gutil.log)
    .pipe(source("demo.js"))
    .pipe(gulp.dest("./dist/js/"))

gulp.task "browserify", ->
  bundleDemoJs(makeBrowserifyBundle())

gulp.task "libs_css", ->
  return gulp.src([
    "./bower_components/bootstrap/dist/css/bootstrap.css"
    "./bower_components/bootstrap/dist/css/bootstrap-theme.css"
  ]).pipe(concat("libs.css"))
    .pipe(gulp.dest("./dist/css/"))

gulp.task "libs_js", ->
  return gulp.src([
    "./bower_components/jquery/dist/jquery.js"
    "./bower_components/bootstrap/dist/js/bootstrap.js"
    "./bower_components/lodash/lodash.js"
  ]).pipe(concat("libs.js"))
    .pipe(gulp.dest("./dist/js/"))

gulp.task "copy_fonts", ->
  return gulp.src(["./bower_components/bootstrap/dist/fonts/*"]).pipe(gulp.dest("./dist/fonts/"))

gulp.task "index_css", ->
  return gulp.src("./src/index.css")
    .pipe(rework(reworkNpm("./src/")))
    .pipe(gulp.dest("./dist/css/"))

gulp.task 'copy_assets', ->
  return gulp.src("assets/**/*")
    .pipe(gulp.dest('dist/'))

gulp.task "demo", gulp.parallel([
  "browserify"
  "libs_js"
  "libs_css"
  "copy_fonts"
  "copy_assets"
  "index_css"
])

# gulp.task 'watch', gulp.series([
#   'demo'
#   gulp.parallel([
#     -> browserSync({ server: "./dist", startPath: "demo.html", ghostMode: false, notify: false })
#     -> gulp.watch("./src/**", gulp.series(['browserify', 'index_css', -> reload()]))
#   ])
# ])

gulp.task 'watch', gulp.series([
  'demo', 
  ->
    b = makeBrowserifyBundle()
    w = watchify(b)

    first = true
    w.on 'bytes', ->
      if first
        browserSync({ server: "./dist", startPath: "/demo.html", ghostMode: false,  notify: false })
        first = false
      else
        browserSync.reload()

    # Needs to be run at least once
    bundleDemoJs(w)

    # Redo on update
    w.on 'update', ->
      bundleDemoJs(w)
  ])

gulp.task "default", gulp.series("copy", "coffee")

# Shim non-browserify friendly libraries to allow them to be 'require'd
shim = (instance) ->
  shims = {
    jquery: '../shims/jquery-shim'
    lodash: '../shims/lodash-shim'
  }

  # Add shims
  for name, path of shims
    instance.require(path, {expose: name})

  return instance
