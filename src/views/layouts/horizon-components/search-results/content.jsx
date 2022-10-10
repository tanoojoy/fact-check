import React, { useEffect, useRef, useState } from 'react';
import SearchResultsColumnsHeaders from './columns-headers';
import SearchResultsColumnsData from './columns-data';
import { arrayOf, object, any } from 'prop-types';
import UnlockMoreResultsBanner from '../unlock-more-results-banner';
import { isFreemiumUserSku } from '../../../../utils';
import { itemSearch as itemSearchPPs } from '../../../../consts/page-params';

const HorizonSearchResultsContent = ({
    user,
    items,
    config,
    additionalClassesHeader,
    additionalClassesContent,
    sortResults,
    sortColumn,
    sortDirection
}) => {
    const [tableWidth, setTableWidth] = useState(1000);

    const columnsHeaderContainerRef = useRef(null);

    const getHeaderInitialWidth = () => {
        if (columnsHeaderContainerRef.current) return columnsHeaderContainerRef.current.offsetWidth;
    };

    useEffect(() => {
        const tableInitialWidth = getHeaderInitialWidth();
        if (tableInitialWidth) setTableWidth(tableInitialWidth + 10);
    });

    return items?.length ? (
        <div className='search-results__data'>
            <div className='search-results__column-header-container' ref={columnsHeaderContainerRef}>
                <SearchResultsColumnsHeaders
                    sortResults={sortResults}
                    columnsMap={config}
                    additionalClasses={additionalClassesHeader}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                />
            </div>
            <div className={`search-results__content-data${isFreemiumUserSku(user) ? '-freemium-user' : ''}`} style={{ width: tableWidth }}>
                <SearchResultsColumnsData items={items} columnsMap={config} additionalClasses={additionalClassesContent} />
            </div>
            <div className='unlock-more-results-banner__wrapper-search-results'>
                <UnlockMoreResultsBanner user={user} page={itemSearchPPs.appString} />
            </div>
        </div>) : '';
};

HorizonSearchResultsContent.propTypes = {
    items: arrayOf(object),
    config: any
};

export default HorizonSearchResultsContent;
