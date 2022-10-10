var React = require('react');
var EnumCoreModule = require('../../public/js/enum-core');

import { generateTempId } from '../../scripts/shared/common';

class FileUploadComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            fileName: props.fileName ? props.fileName : '',
            fileUploaded: null,
            fileId: generateTempId()
        }        
    }

    getFile = () => {
        return this.state.fileUploaded;
    }

    browseFile() {
        //$(`#${controlName}[type="file"]`).click();
        $(`#${this.props.fileId}[type="file"]`).click();
    }

    onFileRemoved = (e) => {
        if (this.state.fileName && this.props.onFileRemoved) {
            this.props.onFileRemoved(this.state.fileName);
        }
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

    render() {
        console.log('this.props.fileName', this.props.fileName);
        const { fileId } = this.state;
        return (
            <div class="input-container flex-item">
                <input type="text" class="input-text" placeholder="" value={this.state.fileName} />
                <div class="btn-upload btn pdf-button-upload">
                    <i class="icon icon-upload">
                        <input id={this.props.fileId} onChange={(e) => { this.onFileChange(e) }} type="file" accept="application/pdf" value="" />
                    </i>
                </div>
                <a onClick={this.onFileRemoved} href="javascript:void(0)"><i class="icon icon-delete-entry"></i></a>
            </div>
            //<div className="input-container flex-item">
            //    <input type="text" className="input-text" placeholder="" value={this.state.fileName} />
            //    {/*<a onClick={(e) => this.browseFile()} className="pdf-button-upload">Upload</a>*/}
            //    <div style={{ display: 'none' }}>
            //        <input id={this.props.fileId} type="file" accept="application/pdf" onChange={(e) => { this.onFileChange(e) }} />
            //    </div>
            //    <a onClick={this.onFileRemoved}><i class="icon icon-delete-entry"></i></a>
            //</div>
        )
    }
};

module.exports = FileUploadComponent;