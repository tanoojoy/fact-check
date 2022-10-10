import initializeSnowplowHandlers from './main.js';

(function() {
    const ANALYTICS_CONFIG = {
        APP_ID: 'scn'
    };

    const ENV_PREFIX = {
        LOCAL: 'localhost',
        SNAPSHOT: 'snapshot',
        STABLE: 'stable'
    };

    const SNOWPLOW_COLLECTOR = {
        DEV: 'snowplow.apps.dev-snapshot.clarivate.com',
        STABLE: 'snowplow.apps.dev-stable.clarivate.com',
        PROD: 'snowplow.apps.clarivate.com'
    };

    function getSnowplowHostName() {
        const currentHost = location.host.replace('www.', '');
        const envPrefix = currentHost.split('.')[0];
        switch (envPrefix) {
        case ENV_PREFIX.LOCAL:
        case ENV_PREFIX.SNAPSHOT:
            return SNOWPLOW_COLLECTOR.DEV;
        case ENV_PREFIX.STABLE:
            return SNOWPLOW_COLLECTOR.STABLE;
        default:
            return SNOWPLOW_COLLECTOR.PROD;
        }
    }

    const isRuntimeEnv = Boolean(globalThis?.window);
    if (isRuntimeEnv) {
        (function(windowObj, documentObj, tagName, tagSource, snowplowProp, newElement, newElementChild) {
            if (!windowObj[snowplowProp]) {
                windowObj.GlobalSnowplowNamespace = windowObj.GlobalSnowplowNamespace || [];
                windowObj.GlobalSnowplowNamespace.push(snowplowProp);
                windowObj[snowplowProp] = function() {
                    windowObj[snowplowProp].q = windowObj[snowplowProp]?.q || [];
                    windowObj[snowplowProp].q.push(arguments);
                };

                windowObj[snowplowProp].q = windowObj[snowplowProp]?.q || [];
                newElement = documentObj.createElement(tagName);
                newElementChild = documentObj.getElementsByTagName(tagName)[0];
                newElement.async = 1;
                newElement.src = tagSource;
                newElementChild.parentNode.insertBefore(newElement, newElementChild);
            }
        })(window, document, 'script', '//d3rm6si6l6yzgk.cloudfront.net/webui/sp/sp-2.16.3.js', 'snowplow');

        window.snowplow('newTracker', 'cf', getSnowplowHostName(), {
            encodeBase64: false, // Default is true
            appId: ANALYTICS_CONFIG.APP_ID,
            platform: 'web',
            discoverRootDomain: true,
            contexts: {
                gaCookies: true,
                performanceTiming: true
            }
        });

        initializeSnowplowHandlers();
    }
})();
