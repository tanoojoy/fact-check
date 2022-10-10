'use strict';
import React from 'react';
import { getAppPrefix } from '../../../../public/js/common';

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class Logo extends React.Component {
	render() {
		const appPrefix = getAppPrefix();
		return (
			<div className="h-logo">
				<a href={`${appPrefix}/`}>
					<img 
						src={`${appPrefix}/assets/images/CSCN-logo.svg`}
						alt='Clarivate Supply Chain Network' 
					/>
				</a> 
			</div>
		);
	}
}

export default Logo;