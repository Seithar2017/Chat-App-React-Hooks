import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {Button, Form, Icon, Input, Menu, Modal } from 'semantic-ui-react';
import firebase from '../../firebase';

const Channels = () => {
    
    const [channels, setChannels] = useState([]);
    const [modal, setModal] = useState(false);
    const [inputsValue, setInputsValue] = useState({
        channelName: "",
        channelDetails: ""
    })
    const {channelName, channelDetails} = inputsValue;
    const user = useSelector(store => store.user.currentUser);
    const channelsDatabaseRef = firebase.database().ref('channels');
    
    useEffect(()=>{
        addListeners();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const addListeners = () =>{
        channelsDatabaseRef.on('child_added', snap=>{
            setChannels(prevState => [...prevState, snap.val()]);
        })
    }

    const handleModalOpen = () => setModal(true);
    const handleModalClose = () => {
        setModal(false)
        setInputsValue(
            {
                ...inputsValue,
                channelName: "",
                channelDetails: ""
            }
        )
    };
    const handleInputsChange = (e) => {
        setInputsValue({
            ...inputsValue,
            [e.target.name]: e.target.value
        })
    }

    const addChannel = () => {
        const key = channelsDatabaseRef.push().key;
        const newChannel = {
            id: key,
            name: channelName,
            details: channelDetails,
            createdBy: {
                name: user.displayName,
                avatar: user.photoURL
            }
        }
        channelsDatabaseRef
        .child(key)
        .update(newChannel)
        .then(()=>{
            handleModalClose();
        })
        .catch(err => {
            console.error(err);
        })
    }

    const handleAddChannel = (e) =>{
            e.preventDefault();
            if(isFormValid()){
                addChannel();
            }
    }
    const displayChannels = () => {
        if(channels.length>0)
        {
            return channels.map(channel => (
                    <Menu.Item
                    key={channel.id}
                    onClick = {()=>console.log(channel)}
                    name = {channel.name}
                    style = {{opacity: '0.7'}}
                    >
                        # {channel.name} dupa
                    </Menu.Item>)
            )
        }
    }
    const isFormValid = () => inputsValue.channelName && inputsValue.channelDetails;

    return ( 
        <>
            <Menu.Menu style = {{paddingBottom: '2em'}}>
                <Menu.Item>
                    <span>
                        <Icon name="exchange"/> CHANNELS 
                    </span>
                    ({channels.length})
                    <Icon name ="add" onClick={handleModalOpen} style={{cursor: 'pointer'}}/>
                </Menu.Item>
                {displayChannels()} 
            </Menu.Menu>

            {/* Add Channel Modal */}
            <Modal basic open={modal} onClose = {handleModalClose}>
                <Modal.Header>
                    Add a Channel
                </Modal.Header>

                <Modal.Content>
                    <Form onSubmit = {handleAddChannel}>
                        <Form.Field>
                            <Input 
                            fluid
                            label = "Name of channel"
                            name ="channelName"
                            onChange={handleInputsChange}
                            value={inputsValue.channelName}
                            />
                        </Form.Field>

                        <Form.Field>
                            <Input 
                            fluid
                            label = "About the channel"
                            name ="channelDetails"
                            onChange={handleInputsChange}
                            value={inputsValue.channelDetails}
                            />
                        </Form.Field>
                    </Form>
                </Modal.Content>

                <Modal.Actions>
                    <Button color = "green" inverted onClick = {handleAddChannel}>
                        <Icon name="checkmark"/> Add
                    </Button>

                    <Button color = "red" inverted onClick ={handleModalClose}>
                        <Icon name="remove"/>
                        Cancel
                    </Button>
                </Modal.Actions>
            </Modal>
        </>
     );
}
 
export default Channels;