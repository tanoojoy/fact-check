import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import HeaderMenuComponentTemplate from '../header-menu';
import LeftBlock from '../left-block';
import RightBlock from '../right-block';

configure({ adapter: new Adapter() });

describe('HeaderMenuComponentTemplate', () => {
    it('should be render', () => {
        const component = shallow(<HeaderMenuComponentTemplate />);
        expect(component).toMatchSnapshot();
    });

    it('should check rendering of LeftBlock', () => {
        const component = shallow(<HeaderMenuComponentTemplate />);
        expect(component.find(LeftBlock).length).toEqual(1);
    });

    it('should check rendering of RightBlock', () => {
        const component = shallow(<HeaderMenuComponentTemplate />);
        expect(component.find(RightBlock).length).toEqual(1);
    });
});
