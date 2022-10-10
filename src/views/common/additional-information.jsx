import React from 'react';

const File = ({ file }) => {
    if (!file) return null;
    return (
        <div className="pdf-list-con">
            <a className="storefront-pdf-name" href={file.link} target='_blank' rel='noreferrer'>
                <i className="icon icon-pdf-circle" />
                <span className="pdf-name">{file.fileName}</span>
            </a>
        </div>
    );
}

const AdditionalInformation = ({ type = '', files = [] }) => {
    const hasFiles =  files && files.length > 0;
    return (
        <div className="store-new-con-pdf">
            <p className="right-title">{`Additional ${type} Information`}</p>
            {
                hasFiles ? 
                    <>
                        <p className="supporting-message-present">
                            Supporting documents have been uploaded by the supplier
                        </p>
                        {files.map((file, index) => <File key={index} />)}
                    </>
                :
                    <p className="supporting-message-absent">
                        No supporting documents have been shared
                    </p>
            }
        </div>
    );
}


export default AdditionalInformation;