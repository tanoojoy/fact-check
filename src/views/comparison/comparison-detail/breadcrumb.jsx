'use strict';
var React = require('react');
const CommonModule = require('../../../public/js/common');

class ComparisonBreadcrumbComponent extends React.Component {
    render() {
        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-sm-6">
                        <div className="h-parent-child-txt full-width">
                            <p><a href={CommonModule.getAppPrefix()+"/"}>Home</a></p>
                            <i className="fa fa-angle-right"/>
                            <p><a href={CommonModule.getAppPrefix()+"/comparison/list"}>My Comparison Table</a></p>
                            <i className="fa fa-angle-right"/>
                            <p className="active">Compare Product</p>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}
module.exports = ComparisonBreadcrumbComponent;
