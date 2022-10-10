export const utils = (() => {
    // private utils configuration
    const CLARIVATE_IGLU_SCHEMA = 'iglu:ne.clarivate.com/usage/jsonschema/2-0-0';
    const NO_TRACK_CLASS = 'snowplow-no-track';

    let SNOWPLOW_CONTEXT_DATA = {};

    return {
        getUserInfo: () => {
            const { userInfo, companyInfo } = window.REDUX_DATA?.userReducer?.user || {};
            const userRole = userInfo?.role?.replace('SubAccount', '').replace('Merchant', 'seller').toLowerCase();
            const userCompanyId = companyInfo?.id;
            const userCompanyName = companyInfo?.name;
            const userScnSku = userInfo?.sku?.toLowerCase();
            const userSteamSku = userInfo?.clarivate_sku;

            return { userRole, userCompanyId, userCompanyName, userSku: userSteamSku || `scn_e${userScnSku}` };
        },

        /**
         * Get the usage context for the snowplow call
         *
         * @returns {object} containg a schema and context data
         */
        getUsageContext: () => {
            if (!Object.keys(SNOWPLOW_CONTEXT_DATA).length) {
                return [];
            }

            return [{
                schema: CLARIVATE_IGLU_SCHEMA,
                data: SNOWPLOW_CONTEXT_DATA
            }];
        },

        /**
         * Set the snowplow context data for each tracked event. Refer to the custom context data
         * governance spreadsheet for all allowable fields
         * @see https://clarivate.sharepoint.com/:x:/s/LSBusinessIntelligenceteam/Eewvau-GylxAtnlgx5y_J6wBVLvZ-181zqvS7yeBTTCC8A?e=ekPUd0
         *
         * @returns {void}
         */
        setUsageContext: (contextData) => {
            if (contextData && Object.keys(contextData).length) {
                SNOWPLOW_CONTEXT_DATA = contextData;
            }
        },

        /**
         * Track a full event
         * @see https://github.com/snowplow/snowplow/wiki/2-Specific-event-tracking-with-the-Javascript-tracker-v2.12#381-trackstructevent
         *
         * @param {string} category Name you supply for the group of objects you want to track e.g. 'media', 'ecomm'
         * @param {string} action Name which defines the type of user interaction for the web object e.g. 'play-video', 'add-to-basket'
         * @param {string} label Name which identifies the specific object being actioned e.g. ID of the video being played
         * @param {string} property Optional value describing the object or the action performed on it. This might be the quantity of an item to add
         * @param {number} value An optional float to quantify or further describe the action being tracked. E.g. a quantity or price
         *
         * @returns {void}
         */
        trackEventFull: (category, action, label = '', property = '', value = 0) => {
            console.debug(`ENTER trackEventFull ${category} : ${action}`); // eslint-disable-line no-console

            window.snowplow(
                'trackStructEvent', category, action, label, property, value, utils.getUsageContext()
            );
        },

        /**
         * Track a page event
         * @param {string} pageName Name of the page to be tracked
         */
        trackPage: (pageName) => {
            console.debug(`ENTER trackPage => ${pageName}`); // eslint-disable-line no-console

            window.snowplow('trackPageView', pageName, utils.getUsageContext());
        },

        /**
         * Check an HTMLElment for a 'analytics-no-track' class selector
         * @param {HTMLElement} el - The HTMLElment to check
         *
         * @returns {boolean} true if the 'analytics-no-track' exists, otherwise false
         */
        containsNoTrackingSelector: (el) => {
            if (el) {
                return el.className.indexOf(NO_TRACK_CLASS) > -1;
            }
            return false;
        },

        /**
         * Check if an HTMLElment belongs to a subset of form elements (anchors, buttons, inputs etc..)
         * @param {HTMLElement} el - The HTMLElment to check
         *
         * @returns {boolean} true if form element, otherwise false
         */
        isFormElement: (el) => {
            const tagName = el.tagName.toLowerCase();

            return [
                'a',
                'button',
                'div',
                'input',
                'label',
                'span'
            ].indexOf(tagName) !== -1;
        },

        /**
         * Check for only input types with static values
         * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
         *
         * @returns {boolean} true if HTMLInput is trackable, otherwise false
         */
        isInputTrackable: (el) => {
            const inputType = el.type.toLowerCase();

            return [
                'button',
                'checkbox',
                'file',
                'image',
                'radio',
                'reset',
                'submit'
            ].indexOf(inputType) > -1;
        },

        /**
         * Check if a "click" MouseEvent target is trackable
         * @param {MouseEvent} $event The triggered "click" MouseEvent
         *
         * @returns {boolean} true if MouseEvent target is trackable, otherwise false
         */
        isMouseEventTrackable: ($event) => {
            const el = $event.target;

            return utils.isFormElement(el);
        },

        /**
         * Gathers data from a HTMLElement to pass to trackEventFull
         * @param {MouseEvent} $event The triggered "click" MouseEvent
         *
         * @returns {void}
         */
        trackMouseClickEvent: ($event) => {
            const elt = $event.target;
            const tagName = elt.tagName.toLowerCase();
            const { eventCategory, eventValue, eventAction, eventLabel } = elt.dataset;

            let el = elt;
            let value = '';

            switch (tagName) {
            case 'a':
                el = elt;
                value = el.href;
                break;
            case 'button':
            case 'span':
                el = elt;
                value = el.textContent;
                break;
            case 'input':
                if (utils.isInputTrackable(elt)) {
                    el = elt;
                    value = el.value;
                }
                break;
            default:
                break;
            }

            if (el) {
                if (!utils.containsNoTrackingSelector(el)) {
                    const category = eventCategory || (el.tagName.toLowerCase() + el.type ? ':' + el.type : '');
                    const action = eventAction || $event.type;
                    const label = eventLabel || el.id || el.title;
                    const val = eventValue || value;
                    const property = el.checked;
                    utils.trackEventFull(category, action, label, property, val);
                }
            }
        },

        setUserId: (userId) => {
            if (window.snowplow) {
                window.snowplow('setUserId', userId);
            }
        }

    };
})();
