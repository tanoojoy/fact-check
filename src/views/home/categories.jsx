'use strict';
import React from 'react';
import { getAppPrefix } from '../../public/js/common';
import { Categories } from '../../consts/search-categories';

class CategoriesHomeComponent extends React.Component {

    renderCategory(category, index) {
        const imgSrc = (category.Media[0]?.MediaUrl) || '';

        return (
            <div key={index} className="col-md-3 col-sm-6 col-xs-12 xs-mb-15">                          
                <a className="category-box">
                    <div className="img-box">
                        <div className="background-image-holder" style={{ background: `url(${imgSrc})`, width: '100%', height: '100%', left: '24px' }} >
                            <img src={imgSrc} alt={category.Name} title={category.Name} style={{ display: 'none' }} />
                        </div>
                    </div>
                    <h4 className="category-name">{category.Name}</h4>
                </a>
            </div>
        );
    }

    render() {
        return (
            <div className="section-category-list">
                {
                   this.props.categories.map((category, index) => this.renderCategory(category, index))
                }
            </div>
        );
    }
}

export default CategoriesHomeComponent;