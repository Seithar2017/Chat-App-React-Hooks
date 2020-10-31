import React, {useState, useEffect, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Button, Form, Icon, Input, Label, Menu, Modal } from 'semantic-ui-react';
import firebase from '../../firebase';
import {setCurrentChannel} from "../../actions";

const Channels = () => {
    
    const dispatch = useDispatch();
    const [channel, _setChannel] = useState(null);
    const channelRef = useRef(channel);
    const [notifications, setNotifications] = useState([]);
    const [channels, setChannels] = useState([]);
    const [modal, setModal] = useState(false);
    const [activeChannel, setActiveChannel] = useState('');
    const [inputsValue, setInputsValue] = useState({
        channelName: "",
        channelDetails: ""
    })
    const {channelName, channelDetails} = inputsValue;
    const user = useSelector(store => store.user.currentUser);
    const channelsDatabaseRef = firebase.database().ref('channels');
    const messagesDatabaseRef = firebase.database().ref('messages')
    const isChannelInitialized = useRef(false);
    
    useEffect(()=>{
        addListeners();

        return () => {
            channelsDatabaseRef.off();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(()=>{
        if(channels.length>0 && isChannelInitialized.current === false){
            //setting active channel of first load
            handleChannelChange(channels[0]);
        
            setChannel(channels[0]);
            isChannelInitialized.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channels])


    const setChannel = (data) => {
        //This function is implemented here, as listener on firebase database doesn't
        //see the current value of channel's state. It remembers the first seen value instead.
        //The reference to the channel's state helps to avoid the issue.
        channelRef.current = data;
        _setChannel(data);
    }

    const handleNotifications = (channelId, currentChannelId, notifications, snap ) =>{
    // channelId - ID of channel on which the new message has been occured
    // currentChannelId - ID of the channel which is already displayed on user's browser
    // notifications - global array to which we gonna add necessary information to display notification
    // snap - snapshot of the new message
        let lastKnownTotal = 0;
        let index = notifications.findIndex(notification => notification.id === channelId)
        
        if(index !== -1){
            
            if(channelId!==currentChannelId){
            //We come here only if an user displays in his browser a different channel than the one on which
            //message has been received.

                //lastKnownTotal stands for the number of all the messages that
                //were already read in the momment user has opened the channel or app.
                lastKnownTotal = notifications[index].lastKnownTotal; 
                
                if(snap.numChildren() - lastKnownTotal > 0) {
                //We come here only if there is actually more messages in database, than we have
                //seen on our last visit on the channel or in the moment we have opened App.
                    notifications[index].count = snap.numChildren() - lastKnownTotal;
                }
            }
            //The notofication[index].total gonna be updated everytime the message has been sent.
            //To differ it from lastKnownTotal we update the lastKnownTotal only when we click
            //on the channel on which the notification has appeared(see clearNotification())
            notifications[index].total = snap.numChildren();
        }else{
            // that's the initial state of notification for each channel
            // the program gonna enter here only once for each channel we have created
            notifications.push({
                id: channelId,
                total: snap.numChildren(),
                lastKnownTotal: snap.numChildren(),
                count: 0,
            })
        }
    
        setNotifications([...notifications]);
    }

    const addNotificationListener = (channelId) => {
    
        messagesDatabaseRef.child(channelId).on('value', snap => {
        
            if(channelRef.current){
            
                handleNotifications(channelId, channelRef.current.id, notifications, snap);
            }
        })
    }

    const addListeners = () =>{
        channelsDatabaseRef.on('child_added', snap=>{
            setChannels(prevState => [...prevState, snap.val()]);
        
            addNotificationListener(snap.key)
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

    const clearNotifications = (channel) => {
        let index = notifications.findIndex(notification => notification.id === channel.id);
    
        if(index!==-1){
            let updatedNotifications = [...notifications];
            updatedNotifications[index].lastKnownTotal = notifications[index].total;
            updatedNotifications[index].count = 0;
            setNotifications([...updatedNotifications])
        }
    }

    const handleChannelChange = (channel) => {
        clearNotifications(channel);
        dispatch(setCurrentChannel(channel, false))
        setActiveChannel(channel.id);
    
        setChannel(channel);
        
    }

    const getNotificationCount = (channel) =>{
        let count = 0;                  
        
        notifications.forEach(notification => {
            if(notification.id === channel.id){
                count = notification.count;
            }
        })

        if(count>0) return count;
        
    }

    const displayChannels = () => {
        if(channels.length>0)
        {
            return channels.map(channel => (
                    <Menu.Item
                    key={channel.id}
                    onClick = {()=>{handleChannelChange(channel)}}
                    name = {channel.name}
                    style = {{opacity: '0.7'}}
                    active = {channel.id === activeChannel}
                    >   

                        
                        {getNotificationCount(channel) && (
                            <Label color = "red">
                                {getNotificationCount(channel)}
                            </Label>
                        )}
                        # {channel.name}
                    </Menu.Item>)
            )
        }
    }
    const isFormValid = () => inputsValue.channelName && inputsValue.channelDetails;

    return ( 
        <>
            <Menu.Menu className = "menu">
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