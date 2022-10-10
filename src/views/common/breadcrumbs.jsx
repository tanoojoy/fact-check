'use strict';
import React from 'react';
import CommonModule from '../../public/js/common';

class BreadcrumbsComponent extends React.Component {

    renderSections() {
        const { trails } = this.props;
        if (trails && trails.length > 0) {
            return trails
                .map((trail, index) => 
                    <p key={`trail-${index}`}  className={trails.length - 1 === index ? '' : 'active'}>
                        { 
                            trail.redirectUrl ? 
                                <a href={`${CommonModule.getAppPrefix()}${trail.redirectUrl}`}> {trail.name} </a> 
                            : trail.name 
                        }
                    </p>
                )
                .reduce((prev, curr) => [prev, <i key={`arrow-${curr.key}`} className="icon icon-chevron-right-new" />, curr]);
        }
    }

    render() {
        return (
            <div className="search-top sc-u sc-u-top h-parent-child-txt full-width">
                <p>
                    <a href={`${CommonModule.getAppPrefix()}/`}>
                        <i className="icon icon-homepage-cor" />
                    </a>
                </p>
                <i className="icon icon-chevron-right-new" />
                {this.renderSections()}
            </div>
        );
    }
}

module.exports = BreadcrumbsComponent;