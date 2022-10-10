import { utils } from './utils.js';

export default function() {
    /**
     * Optional snowplow context data. Refer to the custom context data governance spreadsheet for all
     * allowable fields
     * @see https://clarivate.sharepoint.com/:x:/s/LSBusinessIntelligenceteam/Eewvau-GylxAtnlgx5y_J6wBVLvZ-181zqvS7yeBTTCC8A?e=ekPUd0
     */

    const { userSku, userCompanyName, userCompanyId, userRole } = utils.getUserInfo();

    const SNOWPLOW_CONTEXT_DATA = {
        user1: userSku,
        user2: userRole,
        account1: userCompanyId,
        account2: userCompanyName
    };

    const getUserId = () => {
        return document.cookie?.split('; ')
            .find(row => row.startsWith('clarivateUserId='))?.split('=')[1];
    };

    window.addEventListener('load', () => {
        const pageName = window.location.pathname === '/'
            ? '/home'
            : window.location.pathname;

        console.log('SNOWPLOW HAS BEEN LOADED');

        // set the snowplow context data for each tracked event
        utils.setUsageContext(SNOWPLOW_CONTEXT_DATA);

        const clarivateUserId = getUserId();
        if (clarivateUserId) {
            utils.setUserId(clarivateUserId);
        }
        // track page view
        utils.trackPage(pageName);

        // track all common HTMLElements (anchors, buttons, inputs etc..)
        document.addEventListener('click', ($event) => {
            if (utils.isMouseEventTrackable($event)) {
                utils.trackMouseClickEvent($event);
            }
        });
    });
}
