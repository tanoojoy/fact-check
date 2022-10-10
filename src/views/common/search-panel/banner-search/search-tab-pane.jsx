'use strict';
import React from 'react';

class SearchTabPane extends React.Component {
    render() {
        const self = this;
        return (
        	<div className="tab">
				{
                    this.props.tabs && this.props.tabs.map((tab, index) =>
                        <button 
                            key={index}
                            className={`tablinks ${(tab.active && 'active') || ''}`}
                            onClick={() => self.props.setActiveTab(tab.value)}
                        >
                            {tab.name}
                        </button>
                    )
                }
			</div>
        );
    }
}

export default SearchTabPane;