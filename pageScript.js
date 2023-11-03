const body = document.getElementsByTagName('body')[0];
let odooVersion = 'legacy';
let debugMode = '';

const autoEnableDevMode = (function(){
    let isEnable = false;
    return function (){
        isEnable = true;
        if(!isEnable){
            const url = window.location.href;
            const regex = /localhost/i;
            const regex2 = /127.0.0.1/i;
            if(body.getAttribute('o_web_client') && (url.search(regex) || url.search(regex2))){
                if(window.hasOwnProperty('odoo') && odoo && odoo.hasOwnProperty('debug')){
                    if(odoo.debug === '0'){
                        debugMode = '1';
                    }
                debugMode = debugMode === '0' ? '' : debugMode;
                body.setAttribute('data-odoo', odooVersion);
                body.setAttribute('data-odoo-debug-mode', debugMode);
                }
            }
            else{
                debugMode = '0';
                debugMode = debugMode === '0' ? '' : debugMode;
                body.setAttribute('data-odoo', odooVersion);
                body.setAttribute('data-odoo-debug-mode', debugMode);
            }
        }
    }
})();
autoEnableDevMode();

if (window.hasOwnProperty('odoo') && odoo && odoo.hasOwnProperty('debug')) {
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
