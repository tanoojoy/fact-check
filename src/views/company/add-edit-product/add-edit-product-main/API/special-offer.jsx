import React, { useState } from 'react';
import ItemCard from '../../common/item-card';
import ItemCheckboxForm from '../../common/item-checkbox-form';
import { capitalize } from '../../../../../scripts/shared/common';

const AdditionalMessage = ({ disabled = false, note = '', updateNote = () => null }) => {
    return (
        <div className="additional-message">
            <input 
                name="Special offer / Bulk deal notes"
                type="text"
                maxLength="100"
                disabled={disabled}
                onChange={(e) => updateNote(e.target.value)}
            />
            <span className="char-counter"><span id="sessionNum_counter">{note.length || 0}</span>/100</span>
        </div>
    );
}

const SpecialOfferBulkDeal = ({ specialOfferOptions = [], specialOffer = { value: '', note: ''}, handleStateChange = () => null }) => {

    const isAdditionalMessageInputFieldDisabled = specialOffer.value !== 'yes';
    const data = specialOfferOptions.map(option => ({
        label: capitalize(option),
        value: option,
        containerClass: (option === 'yes' && 'display-Flex width-whole') || '',
        content: (option === 'yes' && 
            <AdditionalMessage 
                disabled={isAdditionalMessageInputFieldDisabled}
                updateNote={(text) => handleStateChange('specialOffer', { ...specialOffer,  note: text })}
            />
        ) || ''
    }))

    const addedCheckboxContainerClass = 'flex-direction-column width-whole max-width-whole';
    
    const onChange = (event) => {
        setSelected(event.target.value);
    }

    return (
        <ItemCard title='Special offer / Bulk deal'>
            <ItemCheckboxForm
                id='special-offer'
                formName='Special Offer'
                data={data}
                onChange={(e) => handleStateChange('specialOffer', { ...specialOffer,  value: e.target.value})}
                selected={specialOffer.value}
                addedCheckboxContainerClass={addedCheckboxContainerClass}
            />
        </ItemCard>
    );
}

export default SpecialOfferBulkDeal;