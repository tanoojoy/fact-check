import React from 'react';
import { getAppPrefix } from '../../public/js/common';

const PageHeader = ({
	currentStep = null,
	title = ''
}) => (
	<div className="landing-box">
		<img src={`${getAppPrefix()}/assets/images/cortellis-landing-logo.svg`} />
		<span className="landing-title">Supply Chain Network</span>
		{
			title &&
			currentStep &&
			<div className="clearfix">
				<div className="select-con pull-left">{title}</div>
				<div className="step-con pull-right">
					Step <span>{currentStep}</span> of 2
				</div>
			</div>
		}
	</div>
)

export default PageHeader;