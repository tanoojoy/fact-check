'use strict';

var React = require('react');

import BaseComponent from '../../shared/base';
import { generateTempId, capitalize } from '../../../scripts/shared/common';
import { useState } from 'react';
import { getAppPrefix } from '../../../public/js/common';

const CompanyDetailsHeaderComponent = ({ companyInfo, customFields, isSelfCompany, userInfo, createChat, toggleShareCompanyProfileModal, followCompany }) => {
    console.log('companyInfo', companyInfo);
    const [otherInfo] = customFields;
    console.log('otherInfo', otherInfo);
    const commentPlaceholder = 'Hello! I thought you might find this pharmaceutical company information useful. If you don’t already have access to Cortellis Supply Chain Network, you can register for free to view this content.';
    
    const openChatClicked = (e) => {
        if (isSelfCompany) return;
        if (!otherInfo.companyUsers.sellers || otherInfo.companyUsers.sellers.length < 1) return;
        const chatId = `chatcommon${companyInfo.id}${Date.now()}`;
        //window.location = `${getAppPrefix()}/chat/${chatId}?interlocutor=${companyInfo.id}`;

        createChat(userInfo.userid, userInfo.horizon_user.ID, chatId, true, Number(userInfo.clarivate_company_id), Number(companyInfo.id));
    }

    const onfollowCompany = (e) => {
        console.log(e.currentTarget.checked);
        followCompany({
            followCompanyId: companyInfo.id,
            isFollow: e.currentTarget.checked
        });
        
    }

    let address = '';
    if (companyInfo.address.length > 0) {
        address = companyInfo.address[0];
    }
    let address2 = '';
    if (companyInfo.address.length > 1) {
        address += ', ';
        address += companyInfo.address[1];
    }
    if (companyInfo.city) {
        address += ', ';
        address += companyInfo.city;
    }
    if (otherInfo.state) {
        address += ', ';
        address += otherInfo.state;
    }
    if (otherInfo.postalCode) {
        address += ', ';
        address += otherInfo.postalCode;
    }
    if (otherInfo.country) {
        address += ', ';
        address += otherInfo.country;
    }
    let cgiUrl = '';
    if (companyInfo.id) {
        cgiUrl = `/generics/subsidiary/${companyInfo.id}/keyinsights`;
    }
    else {
        cgiUrl = `/generics/`;
    }

    const canOpenChat = otherInfo.companyUsers.sellers && otherInfo.companyUsers.sellers.length > 0 && !isSelfCompany;
    console.log('canOpenChat', canOpenChat);
    
    return (        
        <React.Fragment>
            <div className="storefront-top-sec">
                <div className="container">
                    <div className="tableWrapper">                        
                        <div className="storefron-top-left">
                            <div className="store-merchant-profile-img">
                                <img src="images/default_user.svg" alt="" style={{marginBottom: '0.25em', verticalAlign: 'middle'}} />
                            </div>
                            <div className="store-merchant-info">
                                <h4>{companyInfo.name}</h4>
                                <p>
                                    {/*TODO: Check if company is verified*/}
                                    <img src="images/verified-01.svg" alt="" style={{ marginBottom: '0.50em', verticalAlign: 'middle' }} /></p>
                                {!!otherInfo.alerts && otherInfo.alerts.length > 0 && otherInfo.alerts.map(alert => {
                                    return (
                                        <div className="item-alerts">
                                            <i className="icon icon-attention-alerts"></i>{alert}
                                        </div>        
                                    )
                                })}
                                {!otherInfo.alerts &&
                                    (
                                    <div className="no-alerts">No Alerts Reported</div>
                                    )
                                }
                                <div className="store-rating" id="MerchantAverageRating">
                                    <span className="stars" style={{float: 'left'}} data-is-rendered="true">
                                        <span></span>
                                    </span>
                                    <span className="item-voted-percent">(Avg Rating:0.0)</span>
                                </div>
                                <p>
                                    {/*TODO: Check if there is a company description field*/}
                                    gca_company description
                                </p>
                            </div>
                        </div>
                        <div className="storefron-top-right">
                            <div className="store-location-box pull-right custom-property-values">
                                <p className="title-caption">City</p>
                                <p className="location">{companyInfo.city}</p>
                                <p className="title-caption website-title">Location</p>
                                <p class="location">
                                    {address}
								</p>
                            </div>
                            <div className="subsidary-corporate-con">
                                <p className="title-caption">Subsidiary Type</p>
                                {
                                    otherInfo.subsidiaryType && otherInfo.subsidiaryType.length > 0 && 
                                    (
                                        otherInfo.subsidiaryType.map(subType => {
                                            return (
                                                <p className="subsidary-name">{subType}</p>
                                            )
                                        })                                        
                                    )
                                }
                                <p className="title-caption">Corporate Group Name</p>
                                <p className="corporate-group-name">{otherInfo.relationGroupName}</p>
                            </div>
                            <div className="website-info-con">
                                <p className="title-caption">Website</p>
                                <p class="website-name">
                                    <i class="icon icon-globe-blue"></i>
                                    <a href={`https://${otherInfo.webPage}`} target="_blank">{otherInfo.webPage}</a>
                                </p>
                                <p className="title-caption">More Info</p>
                                {/*TODO: Check if text Cortellis Generics Intelligence is static or not*/}
                                <p className="info-name">
                                    <i className="icon icon-info-blue"></i>
                                    <a href={cgiUrl} target="_blank">Cortellis Generics Intelligence</a>
                                    
                                </p>
                            </div>
                            <div className="contact-stay-con">
                                <div className="blue-con-for-contact">
                                    <p className="title-caption">Contact Supplier</p>
                                    <p className="contact-chat">
                                        <i className="icon icon-chat-blue"></i><a href='#' onClick={openChatClicked} disabled={!canOpenChat}>Open Chat</a>
                                    </p>

                                    {/*TODO: Check if there is a functionality for this*/}
                                    <p className="title-caption">Share Company Profile</p>
                                    <p className="contact-chat">
                                        <i className="icon icon-share-blue"></i><a style={{ cursor: "pointer" }} onClick={() => toggleShareCompanyProfileModal(true)}>Share</a>
                                    </p>
                                </div>
                                <div class="blue-con-for-contact">
                                    <p className="title-caption">Stay Tuned</p>
                                    <div className="follow-con-name">
                                        <div className="onoffswitch">
                                            <input type="checkbox" name="onoffswitch" className="onoffswitch-checkbox" id="follow" value="Follow" status="not-following" defaultChecked={companyInfo.isFollowCompany} onChange={onfollowCompany} />
                                            <label className="onoffswitch-label" for="follow" id="field_mand_toggle">
                                                <span className="onoffswitch-inner"></span> <span className="onoffswitch-switch"></span>
                                            </label>
                                        </div>
                                        {/* TODO: Trace code from horizon */}
                                        <span className="follow-label">Follow</span> <span className="active-followers hide"> Active Users</span>
                                    </div>
                                </div>
                            </div>
                            <div className="clearfix"></div>
                        </div>
                        <div className="clearfix"></div>
                    </div>
                    <div id="dvAvtmTop"></div>
                    <div className="storefront-top-action">
                        <div className="pull-left">
                            <ul className="item-link">
                                <li className="active"><a data-toggle="tab" href="#item-for-sell">ITEMS FOR SALE <span id="itemCountBaseOnSearch">(<span>5</span>)</span></a></li>
                                <li><a data-toggle="tab" href="#item-reviews">ITEM REVIEWS <span id="reviewCount">(<span>0</span>)</span></a></li>
                            </ul>
                        </div>
                        <div className="pull-right">
                            <div className="item-filter">
                                <form method="get">
                                    {/* <!-- HIDDEN FIELDS START -->
                                    <input type="hidden" id="marketplaceTheme" name="marketplaceTheme" value="theme-1">
                                    <input type="hidden" id="storefrontMerchantId" name="merchantid" value="53359">
                                    <input type="hidden" id="storefrontMerchantGuid" name="merchantGuid" value="726a8b7a-30bf-4330-880a-1a1b7d3f34ce">
                                    <input type="hidden" id="page-no" value="5">
                                    <!-- HIDDEN FIELDS END --> */}
                                    <ul>
                                        <li>
                                            <label>Sort by :</label>
                                            <select name="sortby" id="sortby">
                                                <option value="Lowest Price">Lowest Price</option>
                                                <option value="Highest Price">Highest Price</option>
                                            </select>
                                        </li>
                                        <li>
                                            <div className="search-group">
                                                <input type="text" className="form-control" placeholder="Search store" name="search-item" id="search-item" />
                                                <input type="button" value="" id="go-search" className="btn-search" />
                                            </div>
                                        </li>
                                    </ul>
                                </form>
                            </div>
                        </div>
                        <div className="clearfix"></div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}

export default CompanyDetailsHeaderComponent;