if (window.hasOwnProperty('odoo') && odoo && odoo.hasOwnProperty('debug')) {
    const body = document.getElementsByTagName('body')[0];
    let odooVersion = 'legacy';
    let debugMode = '';
    if (typeof odoo.debug === 'boolean') {
        const url = window.location.href;
        if (url.search(/[&|?]debug=assets/) !== -1) {
            debugMode = 'assets';
        } else if (url.search(/[&|?]debug/) !== -1) {
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
