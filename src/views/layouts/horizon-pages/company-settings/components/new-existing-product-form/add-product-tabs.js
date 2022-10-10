import { productTabs } from '../../../../../../consts/product-tabs';
import ApiTab from './api-tab';
import DoseFormTab from './dose-form-tab';
import IntermediateTab from './intermediate-tab';
import InactiveIngredientsTab from './inactive-ingredients-tab';

const addProductTabs = { ...productTabs };
addProductTabs.API.content = ApiTab;
addProductTabs.DOSE_FORM.content = DoseFormTab;
addProductTabs.INTERMEDIATE.content = IntermediateTab;
addProductTabs.INACTIVE_INGREDIENTS.content = InactiveIngredientsTab;

export default addProductTabs;
