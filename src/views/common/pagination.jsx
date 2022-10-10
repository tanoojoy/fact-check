'use strict';

import { useEffect, useState } from 'react';

var React = require('react');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class PaginationComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showPaging: true
        };
    }

    pageSizes = [5, 10, 15];

    componentDidMount() {
        this.initializePagination();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps && this.props) {
            if (prevProps.pageSize !== this.props.pageSize) {
                this.initializePagination();
            }
        }
    }

    initializePagination = () => {
        const { totalRecords, pageSize, pageNumber, onPageNumberClicked, pagingId } = this.props;
        const totalPageCount = Math.ceil(totalRecords / pageSize);
        const maxBtnCount = totalPageCount <= 5 ? totalPageCount - 1 : 5;

        if (totalPageCount > 0) {
            this.setState(() => ({ showPaging: true }));
            $(`#${pagingId}`).pxpaginate({
                currentpage: pageNumber,
                totalPageCount: totalPageCount,
                maxBtnCount: maxBtnCount,
                align: 'center',
                nextPrevBtnShow: true,
                firstLastBtnShow: true,
                prevPageName: '<i class="icon-pagination-arrow-left"></i>',
                nextPageName: '<i class="icon-pagination-arrow-left rotate-180"></i>',
                lastPageName: '<i class="icon-pagination-arrow-left"></i><i class="icon-pagination-arrow-left"></i>',
                firstPageName: '<i class="icon-pagination-arrow-left rotate-180"></i><i class="icon-pagination-arrow-left rotate-180"></i>',
                callback: function (pagenumber) {
                    if (onPageNumberClicked) {
                        onPageNumberClicked(Number(pagenumber));
                    }
                }
            });
        }
        else {
            this.setState(() => ({ showPaging: false }));
        }
    }

    pageSizeChanged = (e) => {
        const { value } = e.currentTarget;
        if (this.props.onPageSizeChanged) {
            this.props.onPageSizeChanged(Number(value));
        }        
    }

    render() {
        const { pageSize, pagingId } = this.props;
        const { showPaging } = this.state;
        console.log('paging props', this.props);
        return (
            <nav className="text-right row-reverse">
                <div className="myPages" id={pagingId}></div>
                <div className="per-page-con">
                    Rows per page:
                    <select name="per-page" id="per-page" onChange={this.pageSizeChanged} defaultValue={pageSize}>
                        {this.pageSizes.map(size => {
                            return (
                                <option key={size} value={size} >{size}</option>
                            )
                        })}
                    </select>
                </div>
            </nav>
        )
        //if (showPaging) {
        //    return (
        //        <nav className="text-right row-reverse">
        //            <div className="myPages" id={pagingId}></div>
        //            <div className="per-page-con">
        //                Rows per page:
        //                <select name="per-page" id="per-page" onChange={this.pageSizeChanged} defaultValue={pageSize}>
        //                    {this.pageSizes.map(size => {
        //                        return (
        //                            <option key={size} value={size} >{size}</option>
        //                        )
        //                    })}
        //                </select>
        //            </div>
        //        </nav>
        //    )
        //}
        //else {
        //    return null;
        //}
    }    
};

export default PaginationComponent;