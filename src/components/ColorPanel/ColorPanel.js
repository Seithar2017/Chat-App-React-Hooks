import React, {useState} from 'react';
import {Sidebar, Menu, Divider, Button, Modal, Icon, Label, Segment} from 'semantic-ui-react';
import {SliderPicker} from 'react-color';

const ColorPanel = () => {

    const [modal, setModal] = useState(false);
    const [primary, setPrimary] = useState('#40bfbe');
    const [secondary, setSecondary] = useState('#40bfbe');
    const openModal = () => setModal(true);
    const closeModal = () => setModal(false);

    const handleChangePrimary = (color) => {
            setPrimary(color.hex)
    }

    const handleChangeSecondary = (color) => {
            setSecondary(color.hex)
    }
    return (  
        <Sidebar
        as={Menu}
        icon="labeled"
        inverted
        vertical
        visible
        width='very thin'
        >
            <Divider />
            <Button 
                icon="add" 
                size="small" 
                color="blue" 
                onClick={openModal}
            />

            {/* Color Picker Modal */}
            <Modal basic open = {modal} onClose = {closeModal}>
                <Modal.Header>
                    Choose App Colors
                </Modal.Header>
                
                <Modal.Content>
                    <Segment inverted>
                        <Label content="Primary Color" />
                        <SliderPicker color = {primary} onChange = {handleChangePrimary}/>
                    </Segment>
                    <Segment inverted>
                        <Label content="Secondary Color"/>
                        <SliderPicker color = {secondary} onChange = {handleChangeSecondary}/>
                    </Segment>
                </Modal.Content>

                <Modal.Actions>
                    <Button color="green" inverted>
                        <Icon name="checkmark"/>Save colors
                    </Button>
                    
                    <Button color="red" inverted onClick={closeModal}>
                        <Icon name="remove"/>Cancel
                    </Button>
                </Modal.Actions>

            </Modal>
        </Sidebar>
    );
}
 
export default ColorPanel;