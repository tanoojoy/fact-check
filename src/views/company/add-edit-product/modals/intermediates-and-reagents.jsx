import React, { useState, useEffect } from 'react';
import ConfirmationModal from '../../../common/confirmation-modal';
import { productTabs } from '../../../../consts/product-tabs';
import { Search } from '../../../../consts/search-categories';
import { debounce } from '../../../../utils';

const { INTERMEDIATE } = productTabs;

const { SEARCH_BY } = Search;

const ProductModalBody = ({
	id = '',
	selectedItems = [],
	setSelectedItems = () => null,
	getSearchResults = () => null,
}) => {
	const [searchStr, setSearchStr] = useState('');
	const [suggestions, setSuggestions] = useState();
	const inputId = `intermediateModalTagsInput-${id}`;
	
	const handleSearchStrChange = (e) => {
		setSearchStr(e.target.value);
	}

	const isSelected = (idStr) => {
		const id = idStr?.split(',')[0];
		return selectedItems.some(item => item.id === id);
	}

	const onClick = (e) => {
		setSelectedItems([]);
		$(`#${inputId}`).tagsinput('removeAll');
		e.preventDefault();
	}

	const onOptionClick = (e, item) => {
		const itemID = item.dictId?.split(',')[0];
		if (!selectedItems.some(selected => selected.id === itemID)) {
			setSelectedItems([
				...selectedItems,
				{ 
					id: itemID,
					name: item.name,
					isScnOnly: false 
				}
			]);
		}
		e.preventDefault();
	}

	useEffect(() => {
		$(`#${inputId}`).tagsinput({
			itemValue: 'id',
  			itemText: 'name',
		});

		selectedItems.forEach(item => $(`#${inputId}`).tagsinput('add', item));

	}, [selectedItems])

	useEffect(() => {
		if (searchStr.length >= 1) {
			debounce(() =>
				getSearchResults(searchStr, SEARCH_BY.INTERMEDIATE, INTERMEDIATE.productType, ({ searchResults = {} }) => {
					const { products = [] } = searchResults;
					setSuggestions(products);
					$(".dropdown-options").niceScroll({
	                    cursorcolor: "#9D9D9C",
	                    cursorwidth: "6px",
	                    cursorborderradius: "5px",
	                    cursorborder: "1px solid transparent",
	                    touchbehavior: true,
	                });
				})
			, 1000)();
		} else {
			setSuggestions([]);
		}
	}, [searchStr]);

	useEffect(() => {

		$(`#${inputId}`).on('itemRemoved', (event) => {
			setSelectedItems(selectedItems.filter(item => item.id !== event.item.id));
		});
  	})

	return (
		<>
			<div className="col-md-6 modal-border-right">
                <div className="set-content">
                    <div className="pdc-inputs">
                        <div className="set-inputs">
                            <div className="input-container full-width">
                                <input 
                                	id="intermediateName"
                                	type="text"
                                	className="input-text get-text"
                                	name="intermediateName"
                                	placeholder="Search Intermediates/Reagents"
                                	value={searchStr}
                                	onChange={handleSearchStrChange}
                            	/>
                            </div>
                        </div>
                    </div>
                    <div className="dropdown-options">
                        <ul className="small-options">
                        	{
                        		suggestions && suggestions.map((suggestion, ix) => 
                        			<li key={ix}>
		                                <a
		                                	href="#"
		                                	className={(isSelected(suggestion.dictId) && 'selected') || ''}
		                                	onClick={(e) => onOptionClick(e, suggestion)}
		                                >
		                                    {suggestion.name}
		                                </a>
		                            </li>
                    			)
                        	}
                        </ul>
                    </div>
                </div>
       		</div>
       		<div className="col-md-6 tags-input">
                <div>
                    <h3>Selection <a className="pull-right" onClick={onClick} href="#">Clear all</a></h3>
                    <input id={inputId} name="Selection" type="text" name="txt-field" defaultValue={selectedItems} style={{ display: 'none' }}/>
                </div>
			</div>
		</>
	)
}

const IntermediatesAndReagentsModal = ({
	showModal = false,
	setShowModal = () => null,
	updateItemData = () => null,
	getSearchResults = () => null,
	data = [],
	id = ''
}) => {
	const [selectedItems, setSelectedItems] = useState();

	useEffect(() => {
		setSelectedItems(data.filter(i => i.id && i.name));
	}, [data]);

	const ModalBody = (
		<ProductModalBody
			id={id}
			selectedItems={selectedItems}
			setSelectedItems={setSelectedItems}
			getSearchResults={getSearchResults}
		/>
	);
	return (
		<ConfirmationModal
			title='Intermediates/Reagents'
			show={showModal}
			body={ModalBody}
			onCancel={() => {
				setSelectedItems(data);
				setShowModal(false);
			}}
			onConfirm={() => {
				updateItemData('upstreamSupply-intermediates', selectedItems, true);
				setShowModal(false);
			}}
			cancelLabel="Cancel"
			confirmLabel="Apply"
			wrapperClass='common'
			bodyClass='flex-direction-row'
			id='intermediatesReagentsModal'
		/>
	);
}
export default IntermediatesAndReagentsModal;