import React, { useState, useEffect } from 'react';
import { getAppPrefix } from '../../../../../public/js/common';
import { object, bool, func, string, number } from 'prop-types';
import SubsidiaryType from '../components/profile-tab-components/subsidiary-type';
import { ProfileBlock, InfoItem } from '../components/common-components';
import TextInput from '../components/profile-tab-components/text-input';
import Address from '../components/profile-tab-components/address';
import CompanyAlerts from '../components/profile-tab-components/company-alerts';
import ManufacturingCapabilities from '../components/profile-tab-components/manufacturing-capabilities';
import OtherServices from '../components/profile-tab-components/other-services';
import { NO_ALERTS_VALUE, alertFields } from '../../../../../consts/company-products';
import axios from 'axios';
import { ConfirmModalWindow, windowSizes } from '../../../horizon-components/confirm-modal-window';
import { FooterConfirmModal } from '../../product-profile/components/footer-confirm-modal';

const FILE_EXT = '.pdf';
const FILE_SIZE_LIMIT = 10000000; // 10MB

const ModalBody = () => {
    return (
        <div className='company-profile__additional-supplier-info-error-modal'>
            <img src={getAppPrefix() + '/assets/images/horizon/exclamation.svg'} alt='warning icon' />
            <span className='company-profile__additional-supplier-info-error-message'>You can upload PDF files only. Maximum file size 10MB.</span>
        </div>
    );
};

const AdditionalSupplierInfo = ({ filesList = [], companyId }) => {
    const [files, setFiles] = useState(filesList);
    const [uploadError, setUploadError] = useState(false);
    const [buttonEnabled, setButtonEnabled] = useState(true);

    useEffect(() => {
        setFiles(filesList);
        filesList.length > 2 ? setButtonEnabled(false) : setButtonEnabled(true);
    }, [filesList]);

    const fileHasProperExtAndSize = (filename, fileSize) => {
        const lastDotPosition = filename.lastIndexOf('.');
        const fileExt = filename.slice(lastDotPosition);
        return fileExt === FILE_EXT && FILE_SIZE_LIMIT > fileSize;
    };

    const deleteFile = async(filename) => {
        try {
            await axios.delete(`${getAppPrefix()}/company/files/${companyId}/${filename}`);
            const filesWithoutDeleted = files.filter(file => file.fileName !== filename);
            filesWithoutDeleted.length > 2 ? setButtonEnabled(false) : setButtonEnabled(true);
            setFiles(filesWithoutDeleted);
        } catch (e) {
            console.log(e);
        }
    };

    const uploadFile = async(file) => {
        let filesLength = 0;
        if (!file) return;
        if (!fileHasProperExtAndSize(file.name, file.size)) {
            setUploadError(true);
            return;
        }

        try {
            setButtonEnabled(false);

            const formData = new FormData();
            formData.append('file', file);
            const { data } = await axios.post(
                `${getAppPrefix()}/company/files/${companyId}/upload`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            filesLength = data?.files?.length;

            setFiles(data?.files);
        } catch (e) {
            console.log('Error during file upload:', e);
        } finally {
            filesLength > 2 ? setButtonEnabled(false) : setButtonEnabled(true);
        }
    };

    const renderFiles = () => {
        return files?.map(file => {
            return (
                <div key={file.href} className='file-custom-input-container'>
                    <span className='file-custom-input'>{file.fileName}</span>
                    <img src={getAppPrefix() + '/assets/images/horizon/delete.svg'} alt='Delete button' onClick={() => deleteFile(file?.fileName).catch(console.log)} />
                </div>
            );
        });
    };

    return (
        <div className='company-profile__additional-supplier-info-wrapper'>
            <ConfirmModalWindow
                title='File Upload Error'
                show={uploadError}
                size={windowSizes.xs}
                hideModal={() => setUploadError(false)}
                body={<ModalBody />}
                footer={
                    <FooterConfirmModal
                        approveText='OK'
                        onApproveChanges={() => setUploadError(false)}
                    />
                }
            />
            <div className='company-profile__additional-supplier-info-container'>
                {renderFiles()}
                <label className='file'>
                    <input
                        type='file'
                        accept='.pdf'
                        id='file'
                        className='file-input'
                        aria-label='File browser opener'
                        disabled={!buttonEnabled}
                        onChange={(e) => uploadFile(e?.target?.files[0]).catch(console.log)}
                    />
                    <div className={`company-settings__button ${buttonEnabled ? '' : 'company-settings__button--disabled'}`}>
                        <img
                            src={getAppPrefix() + '/assets/images/horizon/round_plus_blue.svg'} alt='add row'
                            className='company-settings__link-icon'
                        />
                        Add Document
                    </div>
                </label>
            </div>
        </div>
    );
};

AdditionalSupplierInfo.propTypes = {
    filesList: string,
    companyId: number
};

const ProfileTab = ({
    companyInfo = {},
    onProfileDataChange,
    onFormReset,
    resetForm,
    predefinedValues = {},
    premium = false
}) => {
    const [company, setCompany] = useState(companyInfo);
    useEffect(() => {
        if (resetForm) {
            setCompany({ ...companyInfo });
            onProfileDataChange({ ...companyInfo });
            onFormReset();
        }
    }, [resetForm]);

    useEffect(() => {
        setCompany({ ...companyInfo });
    }, [companyInfo]);

    const handleProfileDataChange = (key, newData) => {
        if (key === alertFields[0]) {
            if (newData === NO_ALERTS_VALUE) {
                company.alerts = [];
            } else {
                company.alerts = company.alerts || [];
                company.alerts[0] = newData;
            }
        } else if (key === alertFields[1]) {
            if (newData === NO_ALERTS_VALUE) {
                company.alerts = [company.alerts[0]];
            } else {
                company.alerts[1] = newData;
            }
        }
        company[key] = newData;
        onProfileDataChange(company);
    };

    const additionalTitleText = premium ? 'Upload up to three documents to share on your company profile page' : 'Supporting documents have been uploaded by the supplier';
    const { filesList = [] } = company;

    return (
        <>
            <div className='company-settings__company-info'>
                <div className='company-settings__company-info-column'>
                    <ProfileBlock title='General'>
                        <InfoItem title='Subsidiary Name'>
                            <img
                                src={getAppPrefix() + '/assets/images/horizon/link.svg'}
                                alt='subsidiary name' className='company-settings__link-icon'
                            />
                            {company.name}
                        </InfoItem>

                        <InfoItem title='Corporate Group Name'>
                            <img
                                src={getAppPrefix() + '/assets/images/horizon/link.svg'}
                                alt='Corporate Group name' className='company-settings__link-icon'
                            />
                            {company.relationGroupName}
                        </InfoItem>

                        <SubsidiaryType
                            keyStr='subsidiaryType'
                            selectedSubsidiaryTypes={company.subsidiaryType ? company.subsidiaryType.slice() : []}
                            subsidiaryTypes={predefinedValues.subsidiaryTypes}
                            onChange={handleProfileDataChange}
                        />

                        <TextInput title='Website URL' keyStr='webPage' webPage={company.webPage} onChange={handleProfileDataChange} />
                    </ProfileBlock>
                    <ProfileBlock title='Location'>
                        <TextInput
                            title='Country/Territory' keyStr='country' webPage={company.country}
                            onChange={handleProfileDataChange}
                        />
                        <TextInput
                            title='City' keyStr='city' webPage={company.city}
                            onChange={handleProfileDataChange}
                        />
                        <Address
                            keyStr='addresses' addresses={company.addresses}
                            onChange={handleProfileDataChange}
                        />
                    </ProfileBlock>
                    <ProfileBlock title='Company Alerts'>
                        <CompanyAlerts
                            selectedAlerts={company.alerts}
                            alerts={predefinedValues.predefinedAlerts}
                            keyStr='companyAlerts'
                            onChange={handleProfileDataChange}
                        />
                    </ProfileBlock>
                </div>
                <div className='company-settings__company-info-column'>
                    <ManufacturingCapabilities
                        company={company}
                        predefinedValues={predefinedValues}
                        handleProfileDataChange={handleProfileDataChange}
                    />
                    <OtherServices
                        company={company}
                        predefinedValues={predefinedValues}
                        handleProfileDataChange={handleProfileDataChange}
                    />

                    <ProfileBlock
                        title='Additional Supplier Information' locked={!premium}
                        additionalTitle={additionalTitleText}
                    >
                        <AdditionalSupplierInfo filesList={filesList} companyId={company.id} />
                    </ProfileBlock>
                </div>
            </div>
        </>);
};

ProfileTab.propTypes = {
    companyInfo: object,
    predefinedValues: object,
    onFormReset: func,
    resetForm: bool,
    onProfileDataChange: func,
    premium: bool
};

export default ProfileTab;
