import { prepareTrackData } from './utils.js';

(async function() {
    const pendoAppId = 'cfd246fa-604e-4527-6a13-c97c70a76aef';
    const userData = window.REDUX_DATA.userReducer.user;

    const initializePendo = (apiKey, trackData) => {
        if (trackData) {
            (function(p, e, n, d, o) {
                var v, w, x, y, z;
                o = p[d] = p[d] || {};
                o._q = o._q || [];
                v = ['initialize', 'identify', 'updateOptions', 'pageLoad', 'track'];
                for (w = 0, x = v.length; w < x; ++w) {
                    (function(m) {
                        o[m] = o[m] || function() {
                            o._q[m === v[0] ? 'unshift' : 'push']([m].concat([].slice.call(arguments, 0)));
                        };
                    })(v[w]);
                }
                y = e.createElement(n);
                y.async = !0;
                y.src = 'https://cdn.pendo.io/agent/static/' + apiKey + '/pendo.js';
                z = e.getElementsByTagName(n)[0];
                z.parentNode.insertBefore(y, z);
            })(window, document, 'script', 'pendo');
            // Call this whenever information about your visitors becomes available
            // Please use Strings, Numbers, or Bools for value types.
            pendo.initialize(trackData);
        }
    };

    const preparedData = await prepareTrackData(userData);
    initializePendo(pendoAppId, preparedData);
})().catch(e => console.log(e));
