import React from 'react';
import { string, bool, func, arrayOf, shape } from 'prop-types';

const Tabs = ({ tabs, selectTab }) => {
    return (
        <ul className='horizon-tabs'>
            {
                tabs.map((tab, ix) => {
                    return (
                        <li
                            key={`${tab.name}-${ix}`}
                            className={`tab ${tab.selected ? 'select-tab' : ''}`}
                            onClick={() => selectTab(tab.value)}
                        >
                            {tab.name}
                        </li>
                    );
                })
            }
        </ul>
    );
};

Tabs.propTypes = {
    tabs: arrayOf(
        shape({
            name: string,
            value: string,
            selected: bool
        })
    ),
    selectTab: func
};

export default Tabs;
