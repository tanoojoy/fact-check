import 'jsdom-global/register';
import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { CompanySettingsPage, TABS } from '../index';

configure({ adapter: new Adapter() });

describe('tests for company settings page', () => {
    beforeEach(() => {
        window.history.pushState = jest.fn();
    });

    describe('TABS', () => {
        it(`should set default tab to ${TABS.profile}`, () => {
            const companySettingsComponent = shallow(<CompanySettingsPage />);
            expect(companySettingsComponent.instance().state.activeTab).toBe(TABS.profile);
        });

        it('should set tab according to the passed prop', () => {
            let companySettingsComponent = shallow(<CompanySettingsPage activeTab={TABS.profile} />);
            expect(companySettingsComponent.instance().state.activeTab).toBe(TABS.profile);

            companySettingsComponent = shallow(<CompanySettingsPage activeTab={TABS.productsList} />);
            expect(companySettingsComponent.instance().state.activeTab).toBe(TABS.productsList);

            companySettingsComponent = shallow(<CompanySettingsPage activeTab={TABS.regulatoryInformation} />);
            expect(companySettingsComponent.instance().state.activeTab).toBe(TABS.regulatoryInformation);
        });

        it('should has 3 tabs', () => {
            const companySettingsComponent = shallow(<CompanySettingsPage />);
            const tabs = companySettingsComponent.find('.company-settings__tab-titles');
            expect(tabs.children().length).toBe(Object.values(TABS).length);
        });

        it('should has class "company-settings__tab--active" for active tab and company-settings__tab--non-active for anther tabs', () => {
            const companySettingsComponent = shallow(<CompanySettingsPage />);
            const tabs = companySettingsComponent.find('.company-settings__tab-titles');
            const activeTab = companySettingsComponent.find('.company-settings__tab--active');
            expect(activeTab.text()).toEqual(TABS.profile);

            const nonActiveTabs = tabs.children().filterWhere(tab => tab.prop('className') === 'company-settings__tab--non-active');
            expect(nonActiveTabs.length).toBe(tabs.children().length - 1);
        });
    });
});
