import React, { useState } from 'react';
import { Modal, Input, Button, Icon} from 'semantic-ui-react';
import mime from 'mime-types';

const FileModal = ({modal, closeModal, uploadFile}) => {
    const [file, setFile] = useState(null);
    const authorized = ['image/jpeg', ['image/png']]
    const addFile = (e) => {
        const file = e.target.files[0];
        if(file){
            setFile(file);
        }
    }

    const isAuthorized = (filename) => authorized.includes(mime.lookup(filename));
    const clearFile = () => setFile(null);
    const sendFile = () => {
        if(file!==null){
            if(isAuthorized(file.name)){
                const metadata =  { contentType: mime.lookup(file.name)};
                uploadFile(file, metadata);
                closeModal();
                clearFile();
            }
        }
    }
    return ( 
        <Modal basic open={modal} onClose = {closeModal}>

            <Modal.Header>
                Select an Image File
            </Modal.Header>

            <Modal.Content>
                <Input
                onChange = {addFile}
                fluid
                label="File types: jpg, png"
                name="file"
                type="file"
                />
            </Modal.Content>
                <Button 
                onClick = {sendFile}
                color="green"
                inverted
                >
                        <Icon name ="checkmark"/>Send
                </Button>

                <Button 
                color="red"
                inverted
                onClick={closeModal}
                >
                        <Icon name ="remove"/>Cancel
                </Button>

        </Modal>
     );
}
 
export default FileModal;