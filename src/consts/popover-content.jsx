import { EXPLORE_MODE_LINK } from './clarivate-links';

const INFO_ICON_CLASS = 'icon-password-alerts';
const QUESTION_ICON_CLASS = 'icon-question-alerts';

const POPOVER_TRIGGERS = {
	CLICK: 'click',
	MANUAL: 'manual',
}

const POPOVER_PLACEMENTS = {
	TOP: 'top',
	LEFT: 'left',
	RIGHT: 'right',
	BOTTOM: 'bottom',
}

const manufacturingStatusPopoverContent = 'The current manufacturing status, or relationship, between the API and the ' +
    'manufacturing site, according to Cortellis Generics Intelligence data.' +
    '<br/><br/><a href="https://clarivate.com/cortellis/download/49093" target="_blank" rel="noopener noreferrer">Learn More ></a>';

export const SEARCH_RESULTS_POPOVER = {
	MANUFACTURER_ICON: {
		autoHide: true,
		containerId: 'manufacturer-icon-popover-container',
		id: 'manufacturer-icon-popover',
		content: '<strong>Companies with this icon have active buyers and/or sellers</strong> ' +
		    'on Cortellis Supply Chain Network and are boosted to the top of search results.' +
		    '<br /><br /> You can engage with these companies from their company and product profiles at any time.',
		iconClass: INFO_ICON_CLASS,
		trigger: POPOVER_TRIGGERS.MANUAL,
		placement: POPOVER_PLACEMENTS.RIGHT,
	},
	MANUFACTURING_STATUS: {
		autoHide: true,
		containerId: 'manufacturing-status-popover-container',
		id: 'manufacturing-status-popover',
		content: manufacturingStatusPopoverContent,
		iconClass: INFO_ICON_CLASS,
		trigger: POPOVER_TRIGGERS.MANUAL,
		placement: POPOVER_PLACEMENTS.BOTTOM,
	},
	VERIFIED_MANUFACTURER_FILTER: {
		autoHide: true,
		containerId: 'verified-manufacturer-filter-popover-container',
		id: 'verified-manufacturer-filter-popover',
		content: 'Verified according to <strong>Cortellis Generics Intelligence</strong> data.',
		iconClass: INFO_ICON_CLASS,
		trigger: POPOVER_TRIGGERS.MANUAL,
		placement: POPOVER_PLACEMENTS.BOTTOM,
	},
	MANUFACTURING_STATUS_FILTER: {
		autoHide: true,
		containerId: 'manufacturing-status-filter-popover-container',
		id: 'manufacturing-status-filter-popover',
		content: manufacturingStatusPopoverContent,
		iconClass: INFO_ICON_CLASS,
		trigger: POPOVER_TRIGGERS.MANUAL,
		placement: POPOVER_PLACEMENTS.RIGHT,
	},
	API_RATING_FILTER: {
		autoHide: true,
		containerId: 'api-rating-filter-popover-container',
		id: 'api-rating-filter-popover',
		content: `A proprietary Cortellis Generics Intelligence analytic that indicates how capable the corporate group 
			is of supplying bulk to regulated markets like Europe and North America.<br /><br /><a href='#'>Learn more ></a>`,
		iconClass: INFO_ICON_CLASS,
		trigger: POPOVER_TRIGGERS.MANUAL,
		placement: POPOVER_PLACEMENTS.RIGHT,	
	}
}

const requestNewProductMailLink = 'mailto:dl-genericscscnproductrequest@clarivate.com?subject=Cortellis Supply Chain Network - New Product Request' + 
    '&body=I would like to add a new product to my Cortellis Supply Chain Network profile.' + 
    '%0D%0A%0D%0A' +
    'Product Name: \n' +
    '%0D%0A%0D%0A' +
    'Product Type: \n' +
    '%0D%0A%0D%0A' +
    'Additional Comments: \n';

export const ADD_EDIT_PRODUCT_POPOVER = {
	DOSE_FORM_CATEGORY: {
		autoHide: false,
		id:'dose-form-popover',
		content: '<strong>Coming Soon.</strong>',
		iconClass: INFO_ICON_CLASS,
		trigger: POPOVER_TRIGGERS.MANUAL,
		placement: POPOVER_PLACEMENTS.TOP,
	},
	PRODUCT_NOT_FOUND: {
		autoHide: false,
		id: 'product-not-found-popover',
		content: `If you would like to <strong>add a product that does not appear in the list</strong>,
            please <a href='${requestNewProductMailLink}' target='_blank' rel='noopener noreferrer'>let us know</a>.`,
		iconClass: QUESTION_ICON_CLASS,
		trigger: POPOVER_TRIGGERS.CLICK,
		placement: POPOVER_PLACEMENTS.RIGHT,
	}
}


export const UPSTREAM_SUPPLY_POPOVER = {
	autoHide: true,
	id: 'upstream-supply-popover',
	containerId: 'upstream-supply-popover-container',
	content: '<strong>Coming Soon!</strong><br />The manufacturer can share information about the upstream supply for this product.',
	iconClass: INFO_ICON_CLASS,
	trigger: POPOVER_TRIGGERS.MANUAL,
	placement: POPOVER_PLACEMENTS.RIGHT,
}

export const HEADER_POPOVER = {
	PENDING_COMPANY_APPROVAL: {
		autoHide: true,
		containerId: 'pending-company-popover-container',
		id: 'pending-company-popover',
		content: `<strong>Clarivate users have access to Explore Mode only</strong>.
			Your company request as a Clarivate user will not be processed.
			<br><br>
			If you need your user account to be linked to the Clarivate or Cortellis record,
			please contact gareth.moore@clarivate.com
			<br><br>
			<a target="_blank" rel="noopener noreferrer" href='${EXPLORE_MODE_LINK}'>What is Explore Mode?</a>`,
		iconClass: INFO_ICON_CLASS,
		trigger: POPOVER_TRIGGERS.MANUAL,
		placement: POPOVER_PLACEMENTS.BOTTOM,
	},
	CHANGE_PASSWORD: {
		autoHide: false,
		id: 'change-password-popover',
		content: 'To reset your password <strong>Log Out</strong> and select the <strong>Forgot Password</strong> option.',
		iconClass: INFO_ICON_CLASS,
		trigger: POPOVER_TRIGGERS.MANUAL,
		placement: POPOVER_PLACEMENTS.LEFT,

	}
}