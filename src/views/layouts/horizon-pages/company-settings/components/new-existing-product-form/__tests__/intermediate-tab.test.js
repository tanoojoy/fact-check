import 'jsdom-global/register';
import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { searchResults } from '../../../../../../../__mocks__/new-existing-product-form/search-results.intermediate-tab';
import IntermediateTab from '../intermediate-tab';

configure({ adapter: new Adapter() });

describe('Intermediate tab in "Add Product" modal window', () => {
    let chooseProduct, setSearchString;
    beforeEach(() => {
        chooseProduct = jest.fn();
        setSearchString = jest.fn();
    });

    it('should be render', () => {
        const IntermediateTabComponent = mount(<IntermediateTab
            chooseProduct={chooseProduct}
            chosenProduct={searchResults.products[0].name}
            searchResults={searchResults}
            searchString={searchResults.products[0].name}
            setSearchString={setSearchString}
        />);

        expect(IntermediateTabComponent.find('div.intermediate-tab__name').text()).toEqual('Intermediate Name');
        expect(IntermediateTabComponent.find('input').length).toBe(1);
        expect(IntermediateTabComponent.find('input').instance().value).toEqual(searchResults.products[0].name);
    });

    it('should clear input after click by cross', () => {
        const IntermediateTabComponent = mount(<IntermediateTab
            chooseProduct={chooseProduct}
            chosenProduct={searchResults.products[0].name}
            searchResults={searchResults}
            searchString='qwe'
            setSearchString={setSearchString}
        />);

        expect(IntermediateTabComponent.find('input').instance().value).toEqual(searchResults.products[0].name);

        const clearBtn = IntermediateTabComponent.find('div.clear-btn');
        clearBtn.simulate('click');
        expect(IntermediateTabComponent.find('input').instance().value).toEqual('');
    });
});
