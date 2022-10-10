import 'jsdom-global/register';
import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import ProductsTab from '../product-tab';
import { generateMockCompanyProducts } from '../../../../../../__mocks__/utils';
import { ConfirmModalWindow } from '../../../../horizon-components/confirm-modal-window';

configure({ adapter: new Adapter() });

describe('Product tab in company settings page', () => {
    describe('"Add New Product" button', () => {
        let addNewProduct;
        let productsTabComponent;

        beforeEach(() => {
            addNewProduct = jest.fn();
            productsTabComponent = mount(<ProductsTab
                addNewProduct={addNewProduct}
                companyProducts={[]}
                user={{}}
            />);
        });

        it('should be render', () => {
            expect(productsTabComponent.find('button.primary-btn').length).toBe(1);
        });

        it('should has icon and text', () => {
            const addNewProductBtn = productsTabComponent.find('button.primary-btn');

            expect(addNewProductBtn.find('i.company-settings__icon-plus').length).toBe(1);
            expect(addNewProductBtn.find('span.company-settings__add-new-btn-txt').text()).toEqual('Add New Product');
        });

        it('should verify open modal window after click by button ', () => {
            expect(productsTabComponent.find(ConfirmModalWindow).prop('show')).toBe(false);

            const addNewProductBtn = productsTabComponent.find('button.primary-btn');

            addNewProductBtn.simulate('click');
            expect(productsTabComponent.find(ConfirmModalWindow).prop('show')).toBe(true);
            expect(productsTabComponent.find(ConfirmModalWindow).find('div.modal-title').text()).toEqual('Add Product');
        });
    });

    describe('Products Total', () => {
        it('should be render with current counter', () => {
            const productCount = 27;
            const addNewProduct = jest.fn();
            const productsTabComponent = mount(<ProductsTab
                addNewProduct={addNewProduct}
                companyProducts={generateMockCompanyProducts(productCount)}
                user={{}}
            />);

            expect(productsTabComponent.find('div.company-settings__products-count').text()).toEqual(`${productCount} Products Total`);

            const productsTabComponentEmpty = mount(<ProductsTab
                addNewProduct={addNewProduct}
                user={{}}
            />);

            expect(productsTabComponentEmpty.find('div.company-settings__products-count').text()).toEqual('0 Products Total');
        });
    });

    describe("product's table", () => {
        let addNewProduct;

        beforeEach(() => {
            addNewProduct = jest.fn();
        });

        it('should be render if companyProducts exist', () => {
            const productsTabComponent = mount(<ProductsTab
                addNewProduct={addNewProduct}
                companyProducts={generateMockCompanyProducts(27)}
                user={{}}
            />);

            expect(productsTabComponent.find('div.company-settings__products-table').length).toBe(1);
            expect(productsTabComponent.find('div.search-results__data').length).toBe(1);
        });

        it('should should not be if companyProducts not transferred or is an empty array', () => {
            const productsTabComponentNotTransferred = mount(<ProductsTab
                addNewProduct={addNewProduct}
                user={{}}
            />);

            const productsTabComponentEmpty = mount(<ProductsTab
                addNewProduct={addNewProduct}
                companyProducts={[]}
                user={{}}
            />);

            expect(productsTabComponentNotTransferred.find('div.company-settings__products-table').length).toBe(0);
            expect(productsTabComponentNotTransferred.find('div.search-results__data').length).toBe(0);

            expect(productsTabComponentEmpty.find('div.company-settings__products-table').length).toBe(0);
            expect(productsTabComponentEmpty.find('div.search-results__data').length).toBe(0);
        });
    });
});
