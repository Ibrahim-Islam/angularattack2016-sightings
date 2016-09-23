(function(global) {

    // map tells the System loader where to look for things
    var map = {
        'app': 'app',
        'rxjs': 'vendors/js/rxjs',
        '@angular': 'vendors/js/@angular',
        'firebase': 'vendors/js/firebase-web.js',
        'angularfire2': 'vendors/js/angularfire2',
        'primeng': 'vendors/js/primeng'
    };

    // packages tells the System loader how to load when no filename and/or no extension
    var packages = {
        app: { main: 'main.js',  defaultExtension: 'js' },
        rxjs: { defaultExtension: 'js' },
        angularfire2: { main: 'angularfire2.js', defaultExtension: 'js' },
        primeng: { defaultExtension: 'js' }
    };

    var packageNames = [
        '@angular/common',
        '@angular/compiler',
        '@angular/core',
        '@angular/platform-browser',
        '@angular/platform-browser-dynamic',
        '@angular/router-deprecated'
    ];

    packageNames.forEach(function(pkgName) {
        packages[pkgName] = { main: 'index.js', defaultExtension: 'js' };
    });

    var config = {
        map: map,
        packages: packages
    }

    if (global.filterSystemConfig) {
        global.filterSystemConfig(config);
    }

    System.config(config);

})(this);
