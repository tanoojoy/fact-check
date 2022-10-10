'use strict';
var React = require('react');

var BaseComponent = require('../../../../shared/base');
const CommonModule = require('../../../../../public/js/common.js');

class SearchItemViewComponent extends BaseComponent {

    renderRating(item) {
        return (
            <div className="item-rating">
                <span className="stars"><span style={{ width: `${item.AverageRating != null ? item.AverageRating * 20 : 0}px` }} /></span>
            </div>
        );
    }
    render() {
        var self = this;
        return (
            <div className="items-content behavior2" id="items-list">
                {Array.from(self.props.items).map(function (item, index) {
                    // let price = item.ChildItems && item.ChildItems[0] ? item.ChildItems[0].Price : 0;
                    // //ARC8602
                    // if (!self.props.user || !self.props.userPreferredLocationId) {
                    //     price = 0;
                    // }

                    return (
                        <div className='item-box' key={item.id}>
                             <a href={CommonModule.getAppPrefix()+'/items/' + (item.type === 'products' ? item.fields.api_grp_id[0] : self.generateSlug(item.fields.co_name[0]))}>
                                 <div className='item-image'>
                                     <img src={item.Media && item.Media.length > 0 ? item.Media[0].MediaUrl : ''} />
                                 </div>
                                 <div className='item-info'>
                                     <div className='item-price'>
                                         {self.renderFormatMoney(item.Price, 0)}
                                     </div>
                                     <div className='item-desc'>
                                         <p className='item-name'>{item.type === 'products' ? item.fields.api_main_name[0] : item.fields.co_name }</p>
                                         {self.props.ReviewAndRating === true ? self.renderRating(item) : ''}
                                         {/*<p className="item-seller">{item.MerchantDetail.DisplayName} </p>*/}
                                     </div>
                                 </div>
                             </a>
                         </div>
                     );
                })}
            </div>
        );
    }
}

module.exports = SearchItemViewComponent;
