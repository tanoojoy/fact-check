import React from 'react';
import { getAppPrefix } from '../../../../public/js/common';

const loginLink = `${process.env.CLARIVATE_LOGIN_IFRAME_URL}/login?app=scn&refferer=%2F${getAppPrefix()}`;

const LoginButton =  () => (
	<li className="h-username">
		<span>
			<a href={loginLink}>
	           Log In
	        </a>
		</span>
    </li>
);

export default LoginButton;