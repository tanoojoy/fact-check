var React = require('react');
var EnumCoreModule = require('../../public/js/enum-core');

import { generateTempId } from '../../scripts/shared/common';
import FileUploadComponent from './file-upload';

class FileUploadGroupComponent extends React.Component {
    constructor(props) {
        super(props);

        //this.state = {
        //    fileName: props.fileName ? props.fileName : '',
        //    fileUploaded: null,
        //    fileId: generateTempId()
        //}        
    }

    getFile = () => {
        //return this.state.fileUploaded;
    }

    browseFile() {
        //$(`#${controlName}[type="file"]`).click();
        //$(`#${this.props.fileId}[type="file"]`).click();
    }

    onFileChange(e) {
        const self = this;
        const file = e.target.files[0];
        const fileReader = new FileReader();
        //let label = $(`#${e.target.getAttribute("data-file-label")}`);

        const getMimetype = (signature) => {
            switch (signature) {
                case '89504E47':
                    return 'image/png';
                case '47494638':
                    return 'image/gif';
                case '25504446':
                    return 'application/pdf';
                case 'FFD8FFDB':
                case 'FFD8FFE0':
                case 'FFD8FFE1':
                    return 'image/jpeg';
                case '504B0304':
                    return 'application/zip';
                default:
                    return 'Unknown filetype';
            }
        };

        fileReader.onloadend = function (evt) {
            if (evt.target.readyState === FileReader.DONE) {
                const uint = new Uint8Array(evt.target.result);
                let bytes = [];
                uint.forEach((byte) => {
                    bytes.push(byte.toString(16));
                });
                const hex = bytes.join('').toUpperCase();

                if (EnumCoreModule.GetOrderDiaryValidFileTypes().includes(getMimetype(hex))) {
                    //label.val(file.name);
                    self.setState({
                        fileName: file.name,
                        fileUploaded: evt.target.result
                    });
                    if (self.props.onFileSelected) {
                        self.props.onFileSelected(file.name, file);
                    }                    
                    //self.props.setUploadFile(file.name, true);
                } else {
                    //self.props.setUploadFile('Invalid file selected.', false);
                    file.value = '';
                }
            }
        };

        if (file != undefined && file != null) {
            const blob = file.slice(0, 4);
            fileReader.readAsArrayBuffer(blob);
        }
    }

    renderFileUpload = () => {
        let fileUploads = [];
        const { filesList } = this.props;
        if (filesList && filesList.length > 0) {
            for (var i = 0; i < this.fileUploadLimit; i++) {
                const key = generateTempId();
                let fileName = '';
                if (filesList.length > i) {
                    const file = filesList[i];
                    fileName = file.name;
                    fileUploads.push(<FileUploadComponent fileName={fileName} onFileSelected={this.onFileSelected} key={`file${i+1}`} fileId={`file${i+1}`} />);
                }
                else {
                    break;
                }
            }
        }
        else {
            fileUploads.push(<FileUploadComponent onFileSelected={this.onFileSelected} key={'file0'} fileId={'file0'} />);
        }
        return fileUploads;
    }

    render() {        
        return (
            <React.Fragment>
                <div className="input-container flex-item">
                    <input type="text" className="input-text" placeholder="" value={this.state.fileName} />
                    <a onClick={(e) => this.browseFile()} className="pdf-button-upload">Upload</a>
                    <div style={{ display: 'none' }}>
                        <input id={this.props.fileId} type="file" accept="application/pdf" onChange={(e) => { this.onFileChange(e) }} />
                    </div>
                </div>
            </React.Fragment>
        )
    }
};

module.exports = FileUploadGroupComponent;