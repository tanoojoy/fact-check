'use strict';

function template(bodyClass, title, body, app, reduxState) {
    const styles = [];
    const js = [];

    const CommonModule = require('../../public/js/common');

    const styleCss = '<link href="' + CommonModule.getAppPrefix() + '/assets/css/style.css" rel="stylesheet" type="text/css" />';
    const responsiveCss = '<link href="' + CommonModule.getAppPrefix() + '/assets/css/responsive.css" rel="stylesheet" type="text/css" />';

    const canvasCropCss = '<link href="' + CommonModule.getAppPrefix() + '/assets/css/canvasCrop.css" rel="stylesheet" type="text/css" />';
    const bootstrapDateTimePickerCss = '<link href="' + CommonModule.getAppPrefix() + '/assets/css/bootstrap-datetimepicker.min.css" rel="stylesheet" type="text/css" />';
    const featureCss = '<link href="' + CommonModule.getAppPrefix() + '/assets/css/feature.css" rel="stylesheet" type="text/css" />';
    const sellerStyleCss = '<link href="' + CommonModule.getAppPrefix() + '/assets/css/seller-style.css" rel="stylesheet" type="text/css" />';
    const sellerResponsiveCss = '<link href="' + CommonModule.getAppPrefix() + '/assets/css/seller-responsive.css" rel="stylesheet" type="text/css" />';
    const clarivateCss = '<link href="' + CommonModule.getAppPrefix() + '/assets/css/clarivate.css" rel="stylesheet" type="text/css" />';
    const bootstrapDateTimePickerJs = '<script type="text/javascript" src="' + CommonModule.getAppPrefix() + '/assets/js/bootstrap-datetimepicker.min.js"></script>';
    const momentJs = '<script type="text/javascript" src="' + CommonModule.getAppPrefix() + '/assets/js/moment.min.js"></script>';
    const ratingJS = '<script type="text/javascript" src="' + CommonModule.getAppPrefix() + '/assets/js/rating.js"></script>';
    const fontAwesomeCss = '<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" rel="stylesheet" type="text/css" />';

    const jqueryTimepickerCss = '<link href="' + CommonModule.getAppPrefix() + '/assets/css/jquery.timepicker.css" rel="stylesheet" type="text/css" />';
    const jqueryTimepickerJs = '<script type="text/javascript" src="' + CommonModule.getAppPrefix() + '/assets/js/jquery.timepicker.min.js"></script>';

    const oldTagsInputJs = '<script type="text/javascript" src="' + CommonModule.getAppPrefix() + '/assets/bootstrap-tagsinput/bootstrap-tagsinput.js"></script>';
    const newTagsInputJs = '<script type="text/javascript" src="' + CommonModule.getAppPrefix() + '/assets/js/bootstrap-tagsinput-new.js"></script>';

    if (app.startsWith('merchant-') >= 0 || app != 'item-detail') {
        styles.push(sellerStyleCss);

        if (app != 'sub-account-list') {
            styles.push(sellerResponsiveCss);
        }
    }

    if (app == 'merchant-item-edit') {
        styles.push(canvasCropCss);
        styles.push(bootstrapDateTimePickerCss);

        js.push(momentJs);
        js.push(bootstrapDateTimePickerJs);
    }

    if (app == 'merchant-order-history') {
        styles.push(featureCss);
    }

    if (bodyClass.endsWith('page-sidebar') || app == 'chat-quotation') {
        styles.push(featureCss);
    }
    if (app == 'purchase-history-detail') {
        js.push(ratingJS);
    }
    if (app == 'create-receiving-note' || app == 'create-invoice') {
        styles.push(bootstrapDateTimePickerCss);
        styles.push(jqueryTimepickerCss);

        js.push(momentJs);
        js.push(bootstrapDateTimePickerJs);
        js.push(jqueryTimepickerJs);
    }

    if (app == 'create-rfq' || app === 'create-licensing-inquiry') {
        styles.push(bootstrapDateTimePickerCss);
        
        js.push(momentJs);
        js.push(bootstrapDateTimePickerJs);
    }

    if (app == 'quotation-template') {
        styles.push(bootstrapDateTimePickerCss);
        
        js.push(momentJs);
        js.push(bootstrapDateTimePickerJs);
    }

    if (app == 'chat' ||
        app == 'chat-inbox' ||
        app == 'create-rfq' || 
        app == 'create-licensing-inquiry' ||
        app == 'quotation-template' || 
        app == 'quotation-view') {
        js.push('<script src="https://media.twiliocdn.com/sdk/js/common/v0.1/twilio-common.min.js"></script>');
        js.push('<script src="https://media.twiliocdn.com/sdk/js/conversations/v1.2/twilio-conversations.min.js"></script>');
    }
    
    if (process.env.PRICING_TYPE == 'country_level' && !app.includes('product-settings')) {
        js.push(newTagsInputJs);
    } else {
        js.push(oldTagsInputJs);
    }
    

    return `<!doctype html>
            <html>
                <head>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>${CommonModule.getAppPrefix()}</title>
                    <link href="${CommonModule.getAppPrefix()}/assets/css/bootstrap.min.css" rel="stylesheet" type="text/css" />
                    <link href="${CommonModule.getAppPrefix()}/assets/css/slider.css" rel="stylesheet" type="text/css" />
                    <link href="${CommonModule.getAppPrefix()}/assets/css/common.css" rel="stylesheet" type="text/css" />
                    <link href="${CommonModule.getAppPrefix()}/assets/css/switch-btn.css" rel="stylesheet" type="text/css" />
                    <link href="${CommonModule.getAppPrefix()}/assets/css/groupbuy.css" rel="stylesheet" type="text/css" />
                    <link href="${CommonModule.getAppPrefix()}/assets/toastr/toastr.min.css" rel="stylesheet" type="text/css" />
                    <link href="${CommonModule.getAppPrefix()}/assets/slick-carousel/slick.css" rel="stylesheet" type="text/css" />
                    <link href="${CommonModule.getAppPrefix()}/assets/slick-carousel/slick-theme.css" rel="stylesheet" type="text/css" />
                    <link href="${CommonModule.getAppPrefix()}/assets/css/sol.css" rel="stylesheet" type="text/css" />
                    <link href="${CommonModule.getAppPrefix()}/assets/css/daterangepicker.css" rel="stylesheet" type="text/css" />
                    <link href="${CommonModule.getAppPrefix()}/assets/css/lightbox.min.css" rel="stylesheet" type="text/css" />
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.13.18/css/bootstrap-select.min.css" />
                   
                    ${styles.join('')}
                    ${styleCss}
                    ${responsiveCss}
                    ${clarivateCss}

                    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" rel="stylesheet" type="text/css" />
                    <link href="${CommonModule.getAppPrefix()}/assets/css/fa-all.css" rel="stylesheet" type="text/css" />
                    <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,700" rel="stylesheet" />
                    <script type="text/javascript" src="${CommonModule.getAppPrefix()}/assets/js/lazysizes.min.js" async ></script>
                    <script type="text/javascript" src="${CommonModule.getAppPrefix()}/assets/js/plugins/unveilhooks/ls.unveilhooks.min.js" async ></script>
                </head>
                <body class='${bodyClass}'>
                    <div id="root">${body}</div>
                    <script type="text/javascript" src="${CommonModule.getAppPrefix()}/assets/js/jquery.min.js"></script>
                    <script type="text/javascript" src="${CommonModule.getAppPrefix()}/assets/js/jquery-migrate.min.js"></script>
                    <script type="text/javascript" src="${CommonModule.getAppPrefix()}/assets/js/bootstrap.min.js"></script>
                    <script type="text/javascript" src="${CommonModule.getAppPrefix()}/assets/js/jquery.nicescroll.min.js"></script>
                    <script type="text/javascript" src="${CommonModule.getAppPrefix()}/assets/js/jquery.ddslick.js"></script>
                    <script type="text/javascript" src="${CommonModule.getAppPrefix()}/assets/js/bootstrap-slider.js"></script>
                    <script type="text/javascript" src="${CommonModule.getAppPrefix()}/assets/js/item-pagination.js"></script>
                    <script type="text/javascript" src="${CommonModule.getAppPrefix()}/assets/js/jquery.canvasCrop.js"></script>
                    <script type="text/javascript" src="${CommonModule.getAppPrefix()}/assets/js/sol.js"></script>
                    <script src="https://cdn.ckeditor.com/4.11.4/full/ckeditor.js"></script>
                    <script type="text/javascript" src="${CommonModule.getAppPrefix()}/assets/slick-carousel/slick.min.js"></script>
                    <script type="text/javascript" src="${CommonModule.getAppPrefix()}/assets/js/lightbox.min.js"></script>
                    <script type="text/javascript" src="${CommonModule.getAppPrefix()}/assets/twilio-chat/twilio-chat.min.js"></script>
                    <script type="text/javascript" src="${CommonModule.getAppPrefix()}/assets/js/daterangepicker.js"></script>
                    <script type="text/javascript" src="${CommonModule.getAppPrefix()}/assets/js/codex-fly.js"></script>
                    <script type="text/javascript" src="${CommonModule.getAppPrefix()}/assets/js/jquery.shorten.1.0.js"></script>
                    <script type="text/javascript" src="${CommonModule.getAppPrefix()}/assets/js/jquery-ui.sortable.min.js"></script>
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.13.18/js/bootstrap-select.min.js"></script>
                    <script type="text/javascript" src="${CommonModule.getAppPrefix()}/assets/js/px-pagination.js"></script>
                    ${js.join('')}
                    <script>window.REDUX_DATA = ${JSON.stringify(reduxState)}</script>
                    <script>window.APP = "${app}"</script>
                    <script type="text/javascript" src="${CommonModule.getAppPrefix()}/scripts/bundle.js"></script>
                    <script src="https://apis.google.com/js/client.js?onload=initAnalytics" async="true"></script>
                    <script>console.log(jQuery.migrateWarnings)</script>
                    <script>
                    function initAnalytics() {
                     }
                    </script>
                    <script type="module" src="${CommonModule.getAppPrefix()}/assets/js/snowplow/init.js" async="true"></script>
                    <script type="module" src="${CommonModule.getAppPrefix()}/assets/js/pendo/init.js" async="true"></script>                    
                    
                    <!-- OneTrust Cookies Consent Notice start for cortellis.com/supplychain/ -->
                    <script type="text/javascript" src="https://cdn.cookielaw.org/consent/9a9a3cd1-2732-4bfc-bb15-49719801baf8-test/OtAutoBlock.js" ></script>
                    <script src="https://cdn.cookielaw.org/scripttemplates/otSDKStub.js" type="text/javascript" charset="UTF-8" data-domain-script="9a9a3cd1-2732-4bfc-bb15-49719801baf8-test" ></script>
                    <script type="text/javascript">
                    function OptanonWrapper() { }
                    </script>
                    <!-- OneTrust Cookies Consent Notice end for cortellis.com/supplychain/ -->
                </body>
            </html>`;
}
module.exports = template;
