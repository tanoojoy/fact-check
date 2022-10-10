const prefix = location.hostname?.search('localhost') !== -1 ? '' : '/arcadier_supplychain';

export const prepareTrackData = async(user) => {
    const { token, userid } = JSON.parse(localStorage.getItem('ls.token')) || {};
    const userScnSku = user.userInfo?.sku?.toLowerCase();
    const userSteamSku = user.userInfo?.clarivate_sku;
    const userData = {
        visitor: {
            id: user.ID,
            email: user.Email,
            firstName: user.FirstName,
            lastName: user.LastName,
            Connect_registered: user.DateJoined,
            SCN_Roles: user?.userInfo?.role?.replace('SubAccount', '').replace('Merchant', 'seller').toLowerCase(),
            CompanyId: user.companyId,
            companyName: user.companyInfo?.name,
            userSku: userSteamSku || `scn_e${userScnSku}`
        },
        account: {}
    };

    try {
        const [
            subscriptionResponse,
            userProfileResponse
        ] = await Promise.allSettled([getClarivateSubscriptionData(token, userid), getClarivateProfileUser(token, userid)]);

        const { lsc_job_role: jobRole, lsc_job_area: jobArea, work_location_country: country } = userProfileResponse?.value || {};
        const { customer_name: accountName, enterprise_id: id } = (subscriptionResponse?.value?.subscriptions || [])[0] || {};
        userData.visitor.jobRole = jobRole;
        userData.visitor.jobArea = jobArea;
        userData.visitor.country = country;
        userData.account.accountName = accountName;
        userData.account.id = id;
        return userData;
    } catch (e) {
        console.log(e);
        return userData;
    }
};

export const getClarivateSubscriptionData = async(token, userId) => {
    const authToken = `Bearer ${token}`;

    try {
        const userSubscriptionEndpointResponse = await fetch(`${prefix}/userinfo/subscriptions-link`);
        const userSubscriptionEndpoint = await userSubscriptionEndpointResponse.json();

        if (userSubscriptionEndpoint?.link) {
            const userSubscriptionResponse = await fetch(`${userSubscriptionEndpoint.link}/${userId}`,
                {
                    headers: {
                        Authorization: authToken
                    }
                });
            return await userSubscriptionResponse.json();
        }
    } catch (e) {
        console.log(e);
    }
};

export const getClarivateProfileUser = async(token, userId) => {
    const authToken = `Bearer ${token}`;

    try {
        const userProfileEndpointResponse = await fetch(`${prefix}/userinfo/profile-link`);
        const userProfileEndpoint = await userProfileEndpointResponse.json();

        if (userProfileEndpoint?.link) {
            const userProfileResponse = await fetch(`${userProfileEndpoint.link}/${userId}?app=lsc`,
                {
                    headers: {
                        Authorization: authToken
                    }
                });
            return await userProfileResponse.json();
        }
    } catch (e) {
        console.log(e);
    }
};
