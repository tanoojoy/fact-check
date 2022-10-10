import React, { useState, useEffect } from 'react';
import { productTabs } from '../../../../../consts/product-tabs';
import { UPSTREAM_SUPPLY_POPOVER } from '../../../../../consts/popover-content';
import { ModalTypes } from '../../../../../consts/modal-types';
import { Search } from '../../../../../consts/search-categories';
import { getCustomFieldValues } from '../../../../../utils';
import ItemCard from '../../common/item-card';
import ItemCheckboxForm from '../../common/item-checkbox-form';
import Popover from '../../../../common/popover';


export const UpstreamSupplySectionLabel = () => (
	<h4 className="row-title" id={UPSTREAM_SUPPLY_POPOVER.containerId}>
		Upstream Supply
		&nbsp;
		<Popover
	        id={UPSTREAM_SUPPLY_POPOVER.id}
	        iconClass={UPSTREAM_SUPPLY_POPOVER.iconClass}
	        trigger={UPSTREAM_SUPPLY_POPOVER.trigger}
	        autoHideIcon={UPSTREAM_SUPPLY_POPOVER.autoHide}
	        content={UPSTREAM_SUPPLY_POPOVER.content}
	        placement={UPSTREAM_SUPPLY_POPOVER.placement}
	        containerId={UPSTREAM_SUPPLY_POPOVER.containerId}
	    />
	</h4>
);

const ManufacturerInputField = ({
	id = '',
	disabled = false,
	manufacturers = [],
	handleContainerClick  = () => null,
	updateItemData  = () => null,
}) => {

	const inputId = `additional-input-tags-${id}`;

	useEffect(() => {
		$(`#${inputId}`).tagsinput({
			itemValue: 'id',
  			itemText: 'name',
		});

		$(`#${inputId}`).tagsinput('removeAll');

		manufacturers.forEach(manufacturer => $(`#${inputId}`).tagsinput('add', manufacturer));
	}, [manufacturers]);

	useEffect(() => {

		$(`#${inputId}`).tagsinput({
			itemValue: 'id',
  			itemText: 'name',
		});

		$(`#${inputId}`).on('itemRemoved', (event) => {
			updateItemData(id, manufacturers.filter(val => val.id !== event.item.id), true);
		});
	})

	useEffect(() => {
		$(`#additional-message-${id} .bootstrap-tagsinput input`).attr("disabled", disabled);
	}, [disabled]);

	return (
		<div className="additional-message" id={`additional-message-${id}`} onClick={handleContainerClick} >
            <input id={inputId} name="Manufacturer" type="text" defaultValue={manufacturers} data-role="tagsinput" disabled={disabled} style={{ display: 'none' }}/>
        </div>
	)
}

const UpstreamSupply = ({ 
	item = {},
	updateItemData = () => null,
	updateModalVisibility = () => null,
	manufacturerOfIntermediatesActive = false,
	manufacturerOfRawMaterialsActive = false,
	handleStateChange  = () => null,
}) => {

	const { CustomFields = [] } = item;
    const intermediates = getCustomFieldValues(CustomFields, 'upstreamSupply-intermediates', 'Code') || [];
    const intermediateReagentManufacturers = getCustomFieldValues(CustomFields, 'upstreamSupply-intermediateReagentManufacturers', 'Code') || [];
    const rawMaterialManufacturers = getCustomFieldValues(CustomFields, 'upstreamSupply-rawMaterialManufacturers', 'Code') || [];

	const addedCheckboxContainerClass = 'flex-direction-column width-whole max-width-whole';

	useEffect(() => {
		$('#intermediatesTagsInput').tagsinput({
			itemValue: 'id',
  			itemText: 'name',
		});
		
		$('#intermediatesTagsInput').tagsinput('removeAll');
		intermediates.forEach(intermediate => {
			if (intermediate.id) {
				$('#intermediatesTagsInput').tagsinput('add', intermediate)
			}
		});
	}, [intermediates]);

	useEffect(() => {

		$('#intermediatesTagsInput, #reagentsTagsInput').tagsinput({
			itemValue: 'id',
  			itemText: 'name',
		});

		$('#intermediatesTagsInput').on('itemRemoved', (event) => {
			updateItemData('upstreamSupply-intermediates', intermediates.filter(intermediate => intermediate.id !== event.item.id), true);
		});
	})

	useEffect(() => {
		handleStateChange('manufacturerOfIntermediatesActive', intermediateReagentManufacturers.length > 0);
	}, [intermediateReagentManufacturers.length]);

	useEffect(() => {
		handleStateChange('manufacturerOfRawMaterialsActive', rawMaterialManufacturers.length > 0);
	}, [rawMaterialManufacturers.length]);

	const manufacturerCheckboxOptions = [{ label: 'Manufacturer', value: true }, { label: 'Unknown', value: false }];
	const intermediatesManufacturerData = manufacturerCheckboxOptions.map(option => ({
        label: option.label,
        value: option.value,
        containerClass: (option.label === 'Manufacturer' && 'display-Flex width-whole') || '',
        content: (option.label === 'Manufacturer' && 
        	<ManufacturerInputField
        		id='upstreamSupply-intermediateReagentManufacturers'
        		disabled={!manufacturerOfIntermediatesActive}
        		manufacturers={intermediateReagentManufacturers}
        		updateItemData={updateItemData}
        		handleContainerClick={() => manufacturerOfIntermediatesActive ? updateModalVisibility(ModalTypes.I_R_MANUFACTURERS, true) : null}
        	/>) || ''
    }))

	const rawMaterialsManufacturerData = manufacturerCheckboxOptions.map(option => ({
        label: option.label,
        value: option.value,
        containerClass: (option.label === 'Manufacturer' && 'display-Flex width-whole') || '',
        content: (option.label === 'Manufacturer' && 
        	<ManufacturerInputField
        		id='upstreamSupply-rawMaterialManufacturers'
        		disabled={!manufacturerOfRawMaterialsActive}
        		manufacturers={rawMaterialManufacturers}
        		updateItemData={updateItemData}
        		handleContainerClick={() => manufacturerOfRawMaterialsActive ? updateModalVisibility(ModalTypes.R_MANUFACTURERS, true) : null}
        	/>) || ''
    }))

	return (
		<>
			<UpstreamSupplySectionLabel />
	        <div className="section-description new-cortellis-design">
	            <div className="h-body display-Flex">
	           		<ItemCard 
			    		colWidth={12}
			    		title="Intermediates/Reagents"
        				handleContainerClick={() => updateModalVisibility(ModalTypes.INTERMEDIATES_AND_REAGENTS, true)}
			    	>
			      		<input
			      			id="intermediatesTagsInput"
			      			name="Intermediates"
			      			type="text"
			      			defaultValue={intermediates}
			      			style={{ display: 'none' }}
			      		/>
			    	</ItemCard>
	            </div>
	        </div>
			<div className="section-description new-cortellis-design">
	            <div className="h-body display-Flex">
	            	<ItemCard 
	            		title='Manufacturer of Intermediates'
	            		innerContainerClass='two-options'
	            	>
			            <ItemCheckboxForm
			                id='upstreamSupply-intermediateReagentManufacturers'
			                formName='Manufacturer of Intermediates'
			                data={intermediatesManufacturerData}
			                onChange={(e) => {
			                	if (e.target.value === 'false') {
			                		updateItemData('upstreamSupply-intermediateReagentManufacturers', [], true);
			             		}
			             		handleStateChange('manufacturerOfIntermediatesActive', e.target.value === 'true')
			                }}
			                selected={manufacturerOfIntermediatesActive}
			                addedCheckboxContainerClass={addedCheckboxContainerClass}
			            />
			        </ItemCard>
	            	<ItemCard 
	            		title='Manufacturer of Raw Materials'
	            		innerContainerClass='two-options'
	            	>
			            <ItemCheckboxForm
			                id='upstreamSupply-rawMaterialManufacturers'
			                formName='Manufacturer of Raw Materials'
			                data={rawMaterialsManufacturerData}
			                onChange={(e) => {
			                	if (e.target.value === 'false') {
			                		updateItemData('upstreamSupply-rawMaterialManufacturers', [], true);
			                	}
			                	handleStateChange('manufacturerOfRawMaterialsActive', e.target.value === 'true');
			                }}
			                selected={manufacturerOfRawMaterialsActive}
			                addedCheckboxContainerClass={addedCheckboxContainerClass}
			            />
			        </ItemCard>
	            </div>
	        </div>
        </>
	);
}

export default UpstreamSupply;