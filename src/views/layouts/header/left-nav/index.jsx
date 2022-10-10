'use strict';
import React from 'react';
import Logo from './logo';


if (typeof window !== 'undefined') {
    var $ = window.$;
}

class LeftNavigationMenu extends React.Component {
	render() {
		return (
			<div className='pull-left flexing'>
				<Logo />
			</div>
		);
	}
}

export default LeftNavigationMenu;