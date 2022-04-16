if (window.hasOwnProperty('odoo') && odoo && odoo.hasOwnProperty('debug')) {
    let odooVersion = 'legacy';
    let debugMode = '';
    const body = document.getElementsByTagName('body')[0];
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
    debugMode = debugMode === '0' ? '' : debugMode;  // In Firefox Odoo add '0' for no debug instead of empty string ''.
    body.setAttribute('data-odoo', odooVersion);
    body.setAttribute('data-odoo-debug-mode', debugMode);
}
