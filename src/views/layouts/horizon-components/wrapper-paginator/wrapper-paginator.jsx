import React, { useState, useEffect } from 'react';
import Pagination from 'react-bootstrap/Pagination';
import { arrayOf, node, number, oneOfType, func, bool } from 'prop-types';
import { Select } from '../components-of-form';
import CentralPartOfPaginator from './central-part-of-paginator';

export const PAGE_TYPES = {
    FIRST: 'first',
    PREV: 'prev',
    ORDINAL: 'ordinal',
    NEXT: 'next',
    LAST: 'last'
};

export const getDisabledStatus = (page = 1, countOfPages = 1, type = PAGE_TYPES.ORDINAL, isFreemiumUser = false) => {
    switch (type) {
    case PAGE_TYPES.FIRST:
    case PAGE_TYPES.PREV:
        return isFreemiumUser || page === 1;
    case PAGE_TYPES.NEXT:
    case PAGE_TYPES.LAST:
        return isFreemiumUser || page === countOfPages;
    case PAGE_TYPES.ORDINAL:
        return isFreemiumUser && page !== 1;
    default:
        return false;
    }
};

export const WrapperPaginator = ({
    count = 0,
    selectedPage = 1,
    callback = () => { console.log('"callback" function not defined'); },
    isFreemiumUser = false,
    children
}) => {
    const arrayRowsPerPage = [5, 10, 15];

    const [selectedPageState, setSelectedPageState] = useState(null);
    const [rowsPerPage, setRowsPerPage] = useState(arrayRowsPerPage[1]);
    const [countOfPages, setCountOfPages] = useState(null);

    useEffect(() => {
        choosePage(selectedPage);
        setRowsPerPage(arrayRowsPerPage[1]);
        setCountOfPages(getArrayOfPages(count, rowsPerPage));
    }, []);

    useEffect(() => {
        choosePage(selectedPage);
        setCountOfPages(getArrayOfPages(count, rowsPerPage));
    }, [rowsPerPage]);

    const getArrayOfPages = (fullCount, rowsPerPage) => {
        const countOfFillPages = (fullCount - fullCount % rowsPerPage) / rowsPerPage;
        return fullCount % rowsPerPage > 0 ? countOfFillPages + 1 : countOfFillPages;
    };

    const choosePage = (page) => {
        if (selectedPageState !== 1 && isFreemiumUser) return null;
        setSelectedPageState(page);
        callback(page, rowsPerPage);
    };

    const setFirstPage = () => {
        if (selectedPageState === 1) return null;
        choosePage(1);
        callback(1, rowsPerPage);
    };

    const decreasePage = () => {
        if (selectedPageState === 1) return null;
        choosePage(selectedPageState - 1);
        callback(selectedPageState - 1, rowsPerPage);
    };

    const increasePage = () => {
        if (selectedPageState === countOfPages) return null;
        choosePage(selectedPageState + 1);
        callback(selectedPageState + 1, rowsPerPage);
    };

    const setLastPage = () => {
        if (selectedPageState === countOfPages) return null;
        choosePage(countOfPages);
        callback(countOfPages, rowsPerPage);
    };

    if (!count) return null;

    return (
        <>
            {children}
            <div className='horizon-paginator'>
                <div className='horizon-paginator__rows-per-page'>
                    <span>Rows per page :&nbsp;</span>
                    <Select
                        className='horizon-paginator__rows-per-page__select'
                        options={arrayRowsPerPage.map((value) => ({ label: value, value: value }))}
                        onChangeValue={setRowsPerPage}
                        value={{ label: rowsPerPage, value: rowsPerPage, selected: true }}
                    />
                </div>
                <Pagination>
                    <Pagination.First disabled={getDisabledStatus(selectedPageState, countOfPages, PAGE_TYPES.FIRST, isFreemiumUser)} onClick={setFirstPage} />
                    <Pagination.Prev disabled={getDisabledStatus(selectedPageState, countOfPages, PAGE_TYPES.PREV, isFreemiumUser)} onClick={decreasePage} />

                    <CentralPartOfPaginator
                        selectedPage={selectedPageState}
                        countOfPages={countOfPages}
                        choosePage={choosePage}
                        isFreemiumUser={isFreemiumUser}
                    />

                    <Pagination.Next disabled={getDisabledStatus(selectedPageState, countOfPages, PAGE_TYPES.NEXT, isFreemiumUser)} onClick={increasePage} />
                    <Pagination.Last disabled={getDisabledStatus(selectedPageState, countOfPages, PAGE_TYPES.LAST, isFreemiumUser)} onClick={setLastPage} />
                </Pagination>
            </div>
        </>
    );
};

WrapperPaginator.propTypes = {
    count: number,
    selectedPage: number,
    callback: func,
    isFreemiumUser: bool,
    children: oneOfType([
        arrayOf(node),
        node
    ])
};
