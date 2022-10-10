import React, { Component } from 'react';

export class TagList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showAll: false
        };
    }

    showMore() {
        this.setState({ showAll: true });
    }

    render() {
        const { dataArray } = this.props;
        const initialCount = 15;
        let visibleData;
        if (!this.state.showAll) {
            visibleData = dataArray.slice(0, initialCount);
        } else {
            visibleData = [...dataArray];
        }
        return (
            <>
                <div className='product-profile__components-list'>
                    {
                        visibleData.length &&
                        visibleData.map(item => (
                            <div className='product-profile__component'>{item}</div>
                        )) || <div className='product-profile__not-available'>Not availaible</div>
                    }
                </div>
                {!this.state.showAll && (dataArray.length > initialCount) &&
                    (
                        <div className='company-profile__show-more'>
                            <div className='company-profile__show-more-btn' onClick={() => { this.showMore(); }}>+ Show more</div>
                        </div>
                    )}
            </>
        );
    }
}
