if (window.hasOwnProperty('odoo') && odoo && odoo.hasOwnProperty('debug')) {
    var body = document.getElementsByTagName('body')[0];
    var odooVersion = 'legacy';
    var debugMode = '';
    if (typeof odoo.debug === 'boolean') {
        var url = window.location.href;
        if (url.indexOf('?debug=assets') !== -1) {
            debugMode = 'assets';
        } else if (url.indexOf('?debug') !== -1) {
            debugMode = '1';
        }
    } else {
        odooVersion = 'new';
        debugMode = odoo.debug;
    }
    // In Firefox Odoo add '0' for no debug instead of empty string ''.
    if (debugMode === '0') {
        debugMode = '';
    }
    body.setAttribute('data-odoo-version', odooVersion);
    body.setAttribute('data-debug-mode', debugMode);
}
