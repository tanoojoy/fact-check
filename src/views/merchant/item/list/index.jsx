'use strict';
let React = require('react');
let ReactRedux = require('react-redux');
if (typeof window !== 'undefined') {
    var $ = window.$;
}
let HeaderLayout = require('../../../layouts/header/index').HeaderLayoutComponent;
let SidebarLayout = require('../../../layouts/sidebar').SidebarLayoutComponent;
let FooterLayout = require('../../../layouts/footer').FooterLayoutComponent;
let ItemListTableComponent = require('../../../features/pricing_type/' + process.env.PRICING_TYPE +'/item-list');
let ModalDeleteComponent = require('./modal-delete');
let PaginationComponent = require('../../../common/pagination');
let BaseComponent = require('../../../shared/base');
let MerchantItemActions = require('../../../../redux/merchantItemActions');
let PageItemCountComponent = require('../../../common/page-item-count');

class MerchantItemListComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.search = this.search.bind(this);
        this.confirmDelete = this.confirmDelete.bind(this);
        this.handlePageSizeChange = this.handlePageSizeChange.bind(this);
        this.state = {
            keyword: '',
            pageCount: 20
        };
    }

    handlePageSizeChange(value) {
        this.setState({ pageCount: parseInt(value) });
        this.props.searchItemName(this.state.keyword, value);
    }
    onWordChange(event) {
        this.setState({ keyword: event.target.value });
    }
    search(event) {
        if (event.target.tagName.toLowerCase() == 'input') {
            if (event.which === 13 || event.keyCode == 13) {
                this.props.searchItemName(event.target.value, false);
            }
            else if (event.target.value.toLowerCase() == "apply") {
                this.props.searchItemName(this.state.keyword, false);
            }
        } else {
            this.props.searchItemName($('#keywords').val(),false);
        }
    }

    confirmDelete(itemId) {
        this.props.setItemToDelete(itemId);
    }

    componentDidMount() {
        
    }

    render() {
        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayout user={this.props.user} />
                </div>
                <aside className="sidebar" id="sidebar-section">
                    <SidebarLayout user={this.props.user} />
                </aside>
                <div className="main-content">
                    <div className="main">
                        <div className="orderlist-container">
                            <div className="container-fluid">
                                <div className="sc-upper">
                                    <div className="sc-u title-sc-u sc-u-mid full-width m-change">
                                        <span className="sc-text-big">Inventory</span>
                                        <a className="top-title mobile-only" href="/merchants/upload"><i className="fas fa-plus fa-fw" /> Create new listing</a>
                                        <div className="mobile-only">
                                            <div className="sassy-r ">
                                                <span className="select-sassy-wrapper sassy-arrow">
                                                    <select name="per-page" id="per-page" className="sassy-select" defaultValue={20}>
                                                        <option value={10}>10</option>
                                                        <option value={20}>20</option>
                                                        <option value={50}>50</option>
                                                        <option value={100}>100</option>
                                                    </select>
                                                </span>
                                                <label className="sassy-label">Items per page</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="sc-tops desktop-only">
                                        <a className="top-title" href="/merchants/upload"><i className="fas fa-plus fa-fw" /> Create new listing</a>
                                    </div>
                                </div>
                                {/* filter */}
                                <div className="sassy-filter lg-filter">
                                        <div className="sassy-flex">
                                            <div className="sassy-l">
                                                <div>
                                                    <div className="group-search">
                                                        <div className="group-search-flex">
                                                            <label className="sassy-label">Filter by:</label>
                                                        <span className="sassy-search" onClick={(e) => this.search(e)}>
                                                            <input className="form-control" onKeyPress={(e) => this.search(e)} onChange={(e) => this.onWordChange(e)} name="keywords" id="keywords" placeholder="Search..." />
                                                            </span>
                                                            <input type="button" onClick={(e) => this.search(e)} className="btn btn-sassy" defaultValue="Apply" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="sassy-r desktop-only">
                                            <PageItemCountComponent onChange={this.handlePageSizeChange} value={this.state.pageCount} />
                                            </div>
                                        </div>
                                </div>
                                {/* filter */}
                                <div className="oreder-data-table tb-up table-responsive">
                                    <ItemListTableComponent
                                        items={this.props.items}
                                        editItemPurchasable={this.props.editItemPurchasable}
                                        confirmDelete={this.confirmDelete}
                                        createLogForItemVisibilityUpdate={this.props.createLogForItemVisibilityUpdate}
                                        deleteItem={this.props.deleteItem}
                                        getItemDetails={this.props.getItemDetails}
                                        controlFlags={this.props.controlFlags}/>
                                    <PaginationComponent
                                        totalRecords={this.props.totalRecords}
                                        pageNumber={this.props.pageNumber}
                                        pageSize={this.props.pageSize}
                                        goToPage={this.props.goToPage} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="footer" id="footer-section">
                        <FooterLayout panels={this.props.panels} />
                    </div>
                </div>
                <ModalDeleteComponent
                    itemToDelete={this.props.itemToDelete}
                    setItemToDelete={this.props.setItemToDelete}
                    deleteItem={this.props.deleteItem} />
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        items: state.itemsReducer.items,
        pageSize: state.itemsReducer.pageSize,
        pageNumber: state.itemsReducer.pageNumber,
        totalRecords: state.itemsReducer.totalRecords,
        itemToDelete: state.itemsReducer.itemToDelete,
        controlFlags: state.itemsReducer.controlFlags
    }
}

function mapDispatchToProps(dispatch) {
    return {
        searchItemName: (keyword, pageSize) => dispatch(MerchantItemActions.searchItemName(keyword, pageSize)),
        goToPage: (pageNumber) => dispatch(MerchantItemActions.goToPage(pageNumber)),
        editItemPurchasable: (itemId, isAvailable, callback) => dispatch(MerchantItemActions.editItemPurchasable(itemId, isAvailable, callback)),
        setItemToDelete: (itemId) => dispatch(MerchantItemActions.setItemToDelete(itemId)),
        deleteItem: () => dispatch(MerchantItemActions.deleteItem()),
        getItemDetails: (itemId) => dispatch(MerchantItemActions.getItemDetails(itemId)),
        createLogForItemVisibilityUpdate: (itemId, isAvailable) => dispatch(MerchantItemActions.createLogForItemVisibilityUpdate(itemId, isAvailable)),
    }
}

const MerchantItemListHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(MerchantItemListComponent)

module.exports = {
    MerchantItemListHome,
    MerchantItemListComponent
}