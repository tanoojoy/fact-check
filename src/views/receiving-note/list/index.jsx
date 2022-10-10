'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const BaseComponent = require('../../shared/base');
const HeaderLayoutComponent = require('../../../views/layouts/header/index').HeaderLayoutComponent;
const SidebarLayout = require('../../../views/layouts/sidebar').SidebarLayoutComponent;
const PaginationComponent = require('../../common/pagination');
const FilterComponent = require('./filter');
const ItemsPerPageComponent = require('./items-per-page');
const ListComponent = require('./list');
const ModalCreateComponent = require('./modal-create');
const ReceivingNoteActions = require('../../../redux/recevingNoteActions');
const CommonModule = require('../../../public/js/common');

class ReceivingNoteListComponent extends BaseComponent {
    constructor(props) {
        super(props);

        this.goToPage = this.goToPage.bind(this);
        this.getItems = this.getItems.bind(this);
    }

    goToPage(pageNumber) {
        this.props.filterReceivingNotes({ pageNumber: pageNumber });
    }

    getItems(pageSize) {
        const options = {
            pageNumber: 1,
            pageSize: pageSize
        };

        this.props.filterReceivingNotes(options);
    }

    render() {
        const { user, receivingNotes, suppliers, orders, filters } = this.props;

        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayoutComponent categories={null} user={user} />
                </div>
                <aside className="sidebar" id="sidebar-section">
                    <SidebarLayout user={user} />
                </aside>
                <div className="main-content">
                    <div className="main" style={{ paddingTop: '45px' }}>
                        <div className="orderlist-container">
                            <div className="container-fluid">
                                <div className="sc-upper">
                                    <div className="sc-u title-sc-u sc-u-mid full-width m-change">
                                        <span className="sc-text-big ">Receiving Notes List <a href="https://support.arcadier.com/hc/en-us?_ga=2.30517176.604704954.1584322281-1532453158.1572448843"><img src={CommonModule.getAppPrefix() + "/assets/images/Info.svg"} /></a></span>
                                        <a className="top-title mobile-only createReceipt" href="#" id="createReceipt"><i className="fas fa-plus fa-fw" /> Create new Receiving Note</a>
                                        <small>{receivingNotes.TotalRecords} entries</small>
                                        <div className="mobile-only">
                                            <div className="sassy-r">
                                                <ItemsPerPageComponent
                                                    itemsCount={filters.pageSize}
                                                    getItems={this.getItems} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="sc-tops desktop-only">
                                        <a className="top-title createReceipt" href="#" id="createReceipt"><i className="fas fa-plus fa-fw" /> Create new Receiving Note</a>
                                    </div>
                                </div>
                                <div className="sassy-filter lg-filter">
                                    <form id="search" onSubmit={(e) => this.filterComponent.applyFilter(e)}>
                                        <div className="sassy-flex">
                                            <FilterComponent
                                                ref={(ref) => this.filterComponent = ref}
                                                suppliers={suppliers}
                                                filterReceivingNotes={this.props.filterReceivingNotes} />
                                            <div className="sassy-r desktop-only">
                                                <ItemsPerPageComponent
                                                    itemsCount={filters.pageSize}
                                                    getItems={this.getItems} />
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <div className="subaccount-data-table table-responsive">
                                    <ListComponent
                                        receivingNotes={receivingNotes.Records} />
                                    <PaginationComponent
                                        totalRecords={receivingNotes.TotalRecords}
                                        pageNumber={parseInt(filters.pageNumber)}
                                        pageSize={parseInt(filters.pageSize)}
                                        goToPage={this.goToPage} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <ModalCreateComponent
                    orders={orders} />
                <div id="cover"></div>
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        receivingNotes: state.receivingNoteReducer.receivingNotes,
        suppliers: state.receivingNoteReducer.suppliers,
        orders: state.receivingNoteReducer.orders,
        filters: state.receivingNoteReducer.filters
    };
}

function mapDispatchToProps(dispatch) {
    return {
        filterReceivingNotes: (options, callback) => dispatch(ReceivingNoteActions.filterReceivingNotes(options, callback)),
    };
}

const ReceivingNoteListHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(ReceivingNoteListComponent);

module.exports = {
    ReceivingNoteListHome,
    ReceivingNoteListComponent
};
