'use strict';
var React = require('react');
var BaseClassComponent = require('../../shared/base.jsx');


var $ = require('jquery');

class ChangePasswordSettingsComponent extends BaseClassComponent {
    constructor(props) {
        super(props);

        
    }

    render() {
        return (
            <React.Fragment>
                <div id="ChangePassword" className="tab-pane fade in active" >
                    <div className="set-content clearfix">
                        <p className="coming-soon">Coming soon</p>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

module.exports = ChangePasswordSettingsComponent;