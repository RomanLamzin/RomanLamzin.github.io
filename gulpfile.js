const { src, dest, task, series, watch, parallel } = require("gulp");
const rm = require("gulp-rm");
const sass = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const browserSync = require("browser-sync").create();
const reload = browserSync.reload;
const autoprefixer = require("gulp-autoprefixer");
const px2rem = require("gulp-smile-px2rem");
const cleanCSS = require("gulp-clean-css");
const sourcemaps = require("gulp-sourcemaps");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const gulpif = require("gulp-if");
const env = process.env.NODE_ENV;

sass.compiler = require("node-sass");

const libs = [
  "node_modules/jquery/dist/jquery.js",
  "node_modules/jquery-touchswipe/jquery.touchSwipe.js",
  "src/scripts/*.js",
];

task("clean", () => {
  return src("dist/**/*", { read: false }).pipe(rm());
});

task("copy:html", () => {
  return src("src/*.html")
    .pipe(dest("dist"))
    .pipe(reload({ stream: true }));
});

task("copy:txt", () => {
  return src("src/*.txt")
    .pipe(dest("dist"))
    .pipe(reload({ stream: true }));
});

task("copy:img", () => {
  return src("src/styles/img/**/*.*")
    .pipe(dest("dist/img"))
    .pipe(reload({ stream: true }));
});

task("copy:fonts", () => {
  return src("src/styles/fonts/**/*.*")
    .pipe(dest("dist/fonts"))
    .pipe(reload({ stream: true }));
});

const styles = [
  "node_modules/normalize.css/normalize.css",
  "src/styles/main.scss",
];

task("styles", () => {
  return (
    src(styles)
      .pipe(gulpif(env === "dev", sourcemaps.init()))
      .pipe(concat("main.min.scss"))
      .pipe(sass().on("error", sass.logError))
      // .pipe(px2rem())
      .pipe(
        gulpif(
          env === "prod",
          autoprefixer({
            browsers: ["last 2 versions"],
            cascade: false,
          })
        )
      )
      .pipe(gulpif(env === "prod", cleanCSS()))
      .pipe(gulpif(env === "dev", sourcemaps.write()))
      .pipe(dest("dist"))
      .pipe(reload({ stream: true }))
  );
});

task("server", () => {
  browserSync.init({
    server: {
      baseDir: "./dist",
    },
    open: false,
  });
});

task("scripts", () => {
  return src(libs)
    .pipe(gulpif(env === "dev", sourcemaps.init()))
    .pipe(concat("main.min.js", { newLine: ";" }))
    .pipe(
      gulpif(
        env === "prod",
        babel({
          presets: ["@babel/env"],
        })
      )
    )
    .pipe(gulpif(env === "prod", uglify()))
    .pipe(gulpif(env === "dev", sourcemaps.write()))
    .pipe(dest("dist"))
    .pipe(reload({ stream: true }));
});

task("watch", () => {
  watch("./src/styles/**/*.scss", series("styles"));
  watch("./src/*.html", series("copy:html"));
  watch("./src/*.txt", series("copy:txt"));
  watch("./src/scripts/*.js", series("scripts"));
});

task(
  "default",
  series(
    "clean",
    parallel(
      "copy:html",
      "copy:txt",
      "copy:img",
      "copy:fonts",
      "styles",
      "scripts"
    ),
    parallel("watch", "server")
  )
);

task(
  "build",
  series(
    "clean",
    parallel(
      "copy:html",
      "copy:txt",
      "copy:img",
      "copy:fonts",
      "styles",
      "scripts"
    )
  )
);
