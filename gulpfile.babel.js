import gulp from 'gulp';
import { deleteAsync as del } from 'del';
import dom from 'gulp-dom';
import path from 'path';

// Ursprung: ./www (fertiger Build von React oder anderem Tool)
const SOURCE_DIR = './www';
// Ziel: nur der INHALT kommt nach .buildResult (ohne den Ordner selbst)
const DEST_DIR = './.buildResult';

const paths = {
    assets: {
        src: [SOURCE_DIR + '/**/*'],
        dest: DEST_DIR
    },
    index: {
        src: SOURCE_DIR + '/index.html',
        dest: DEST_DIR
    }
};

// Löscht den vorherigen Build-Ordner (.buildResult)
function clean() {
    return del([DEST_DIR]);
}

// Kopiert alle Dateien aus www/ in .buildResult/
function copy() {
    return gulp.src(paths.assets.src, { base: SOURCE_DIR }) // <– wichtig, um www/ nicht mitzukopieren
        .pipe(gulp.dest(paths.assets.dest));
}

// Modifiziert index.html (optional, aber meist nötig für Tizen)
function modifyIndex() {
    return gulp.src(paths.index.src)
        .pipe(dom(function () {
            // Fügt CSP hinzu
            const meta = this.createElement('meta');
            meta.setAttribute('http-equiv', 'Content-Security-Policy');
            meta.setAttribute('content', "default-src * 'self' 'unsafe-inline' 'unsafe-eval' data: gap: file: filesystem: ws: wss:;");
            this.head.appendChild(meta);

            // Sucht ein Script mit main-Bundle (z. B. von React)
            let apploader = this.querySelector('script[src^=main]');

            if (apploader) {
                apploader.setAttribute('defer', '');
            } else {
                // Optional: Inject fallback script, falls nichts gefunden wird
                apploader = this.createElement('script');
                apploader.setAttribute('src', 'scripts/apploader.js'); // Falls du ein apploader brauchst
                apploader.setAttribute('defer', '');
                this.body.appendChild(apploader);
            }

            const injectTarget = apploader.parentNode;

            // WebAPIs (Tizen spezifisch)
            const webapis = this.createElement('script');
            webapis.setAttribute('src', '$WEBAPIS/webapis/webapis.js');
            injectTarget.insertBefore(webapis, apploader);

            // App-Mode setzen
            const appMode = this.createElement('script');
            appMode.text = "window.appMode='cordova';";
            injectTarget.insertBefore(appMode, apploader);

            // Tizen.js injizieren
            const tizen = this.createElement('script');
            tizen.setAttribute('src', '../tizen.js');
            tizen.setAttribute('defer', '');
            injectTarget.insertBefore(tizen, apploader);

            return this;
        }))
        .pipe(gulp.dest(paths.index.dest));
}

// Haupt-Build-Task
const build = gulp.series(
    clean,
    gulp.parallel(copy, modifyIndex)
);

// Exporte
export {
    clean,
    copy,
    modifyIndex
};
export default build;
