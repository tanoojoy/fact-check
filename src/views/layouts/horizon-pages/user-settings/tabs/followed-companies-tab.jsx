import React from 'react';
import HorizonSearchResultsContent from '../../../horizon-components/search-results/content';
import { userFollowersMap } from '../../../../../consts/user-followers';
import { arrayOf, number, shape, string } from 'prop-types';

const FollowedCompaniesTab = ({ followerCompanies }) => {
    const { count = 0, followers = [] } = followerCompanies;
    const formatted = followers?.map((follower, ix) => {
        follower.index = ix + 1;
        return { fields: follower };
    });
    return (
        <div className='user-settings__follower'>
            <div className='user-settings__common-followers-data'>
                <div className='user-settings__follower-count'>{`${count} Companies Total`}</div>
            </div>
            {!!followers.length &&
            <div className='company-settings__products-table'>
                <HorizonSearchResultsContent config={userFollowersMap} items={formatted} additionalClassesContent='company-settings__table-row' />
            </div>}
        </div>
    );
};

FollowedCompaniesTab.propTypes = {
    followerCompanies: shape({
        count: number,
        followers: arrayOf({
            id: number,
            userId: string,
            companyId: number,
            createdAt: string,
            updatedAt: string,
            companyName: string
        })
    })
};

export default FollowedCompaniesTab;
