import React, { useEffect, useState } from 'react';
import Pagination from 'react-bootstrap/Pagination';
import { bool, func, number } from 'prop-types';
import range from 'lodash/range';
import { getDisabledStatus, PAGE_TYPES } from './wrapper-paginator';

let prevListOfPages = null;
let prevSelectedPage = null;

const LineOfVisiblePages = ({ pagesCount, selectedPage, choosePage, isFreemiumUser }) => {
    // ToDo: @Vinokurov not clear, should be reworks in future with unit tests
    const getArray = (pagesCount, selectedPage) => {
        if (selectedPage >= 1 && selectedPage < 5) {
            const leftBound = pagesCount - 5 <= 1 ? 1 : pagesCount - 5;
            const rightBound = pagesCount + 1;
            return range(leftBound, rightBound);
        } else if (pagesCount - selectedPage < 5) {
            const leftBound = pagesCount - 5 <= 1 ? 1 : pagesCount - 5;
            const rightBound = pagesCount + 1;
            return range(leftBound, rightBound);
        } else {
            let leftBound, rightBound;
            if (selectedPage === prevListOfPages[0]) {
                leftBound = selectedPage - 3;
                rightBound = selectedPage + 2;
            } else if (selectedPage === prevListOfPages[prevListOfPages.length - 1]) {
                leftBound = selectedPage - 1;
                rightBound = selectedPage + 4;
            } else {
                if (selectedPage > prevSelectedPage) { // to right
                    if (selectedPage === prevListOfPages[prevListOfPages.length - 1]) {
                        leftBound = selectedPage - 1;
                        rightBound = selectedPage + 4;
                    } else {
                        leftBound = prevListOfPages[0];
                        rightBound = prevListOfPages[prevListOfPages.length - 1] + 1;
                    }
                } else { // to left
                    if (selectedPage === prevListOfPages[0]) {
                        rightBound = selectedPage + 1;
                        leftBound = selectedPage - 4;
                    } else {
                        leftBound = prevListOfPages[0];
                        rightBound = prevListOfPages[prevListOfPages.length - 1] + 1;
                    }
                }
            }
            return range(leftBound, rightBound);
        }
    };

    const listOfPages = getArray(pagesCount, selectedPage);
    prevListOfPages = listOfPages.slice();
    prevSelectedPage = selectedPage;

    return (
        listOfPages.map((index) => {
            return (
                <Pagination.Item
                    disabled={getDisabledStatus(index, pagesCount, PAGE_TYPES.ORDINAL, isFreemiumUser)}
                    key={`pagination.item-${index}`}
                    active={index === selectedPage}
                    onClick={() => choosePage(index)}
                >
                    {index}
                </Pagination.Item>
            );
        })
    );
};

const CentralPartOfPaginator = ({ countOfPages, selectedPage, choosePage, isFreemiumUser }) => {
    const [countOfPagesState, setCountOfPagesState] = useState(null);
    const [selectedPageState, setSelectedPageState] = useState(null);

    useEffect(() => {
        setCountOfPagesState(countOfPages);
        setSelectedPageState(selectedPage);
    }, [countOfPages, selectedPage]);

    if (countOfPagesState <= 6) { // 1,2,3,4,5,6,7
        return <LineOfVisiblePages
            pagesCount={countOfPagesState}
            selectedPage={selectedPage}
            choosePage={choosePage}
            isFreemiumUser={isFreemiumUser}
        />;
    } else if (countOfPagesState > 6 && selectedPageState < 5) { // 1,2,3,4,5...m
        return (
            <>
                <LineOfVisiblePages
                    pagesCount={5}
                    selectedPage={selectedPageState}
                    choosePage={choosePage}
                    isFreemiumUser={isFreemiumUser}
                />
                <Pagination.Ellipsis disabled />
                <Pagination.Item
                    disabled={getDisabledStatus(countOfPagesState, countOfPagesState, PAGE_TYPES.ORDINAL, isFreemiumUser)}
                    key={`pagination.item-${countOfPagesState}`}
                    onClick={() => choosePage(countOfPagesState)}
                >{countOfPagesState}
                </Pagination.Item>
            </>
        );
    } else if (countOfPagesState > 6 && (selectedPageState === countOfPagesState || selectedPageState >= (countOfPagesState - 4))) { // 1...m-4,m-3,m-2,m-1,m
        return (
            <>
                <Pagination.Item
                    disabled={getDisabledStatus(1, countOfPagesState, PAGE_TYPES.ORDINAL, isFreemiumUser)}
                    key={`pagination.item-${1}`}
                    onClick={() => choosePage(1)}
                >{1}
                </Pagination.Item>
                <Pagination.Ellipsis disabled />
                <LineOfVisiblePages
                    pagesCount={countOfPagesState}
                    selectedPage={selectedPageState}
                    choosePage={choosePage}
                    isFreemiumUser={isFreemiumUser}
                />
            </>
        );
    } else { // 1...n-2,n-1,n,n+1,n+2...m
        return (
            <>
                <Pagination.Item
                    disabled={getDisabledStatus(1, countOfPagesState, PAGE_TYPES.ORDINAL, isFreemiumUser)}
                    key={`pagination.item-${1}`}
                    onClick={() => choosePage(1)}
                >{1}
                </Pagination.Item>
                <Pagination.Ellipsis disabled />
                <LineOfVisiblePages
                    pagesCount={countOfPagesState}
                    selectedPage={selectedPageState}
                    choosePage={choosePage}
                    isFreemiumUser={isFreemiumUser}
                />
                <Pagination.Ellipsis disabled />
                <Pagination.Item
                    disabled={getDisabledStatus(countOfPagesState, countOfPagesState, PAGE_TYPES.ORDINAL, isFreemiumUser)}
                    key={`pagination.item-${countOfPagesState}`}
                    onClick={() => choosePage(countOfPagesState)}
                >{countOfPagesState}
                </Pagination.Item>
            </>
        );
    }
};

CentralPartOfPaginator.propTypes = {
    countOfPages: number,
    selectedPage: number,
    choosePage: func,
    isFreemiumUser: bool
};

export default CentralPartOfPaginator;
