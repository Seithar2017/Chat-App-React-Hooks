import React, { useState } from 'react';
import { Modal, Input, Button, Icon} from 'semantic-ui-react';

const FileModal = ({modal, closeModal}) => {
    const [file, setFile] = setState(null);

    const addFile = () => {
        
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