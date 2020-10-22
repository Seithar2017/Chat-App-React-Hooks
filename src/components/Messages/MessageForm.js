import React,{useState} from 'react';
import {useSelector} from 'react-redux';
import {Segment, Button, Input} from 'semantic-ui-react';
import firebase from '../../firebase';

import FileModal from "./FileModal";

const MessageForm = ({messagesDbRef}) => {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [modal, setModal] = useState(false);

    const user = useSelector(store=> store.user.currentUser);

    const channel = useSelector(store=>store.channel.currentChannel);

    const openModal = () => setModal(true);
    const closeModal = () => setModal(false);


    const handleChange = (e) => {
        setMessage(e.target.value)
    }
    const createMessage = () => {
        const msg = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: user.uid,
                avatar: user.photoURL,
                name: user.displayName,
            },
            content: message,
        }

        return msg;
    }
    const sendMessage = () => {
        if(message){
            setIsLoading(true);
            messagesDbRef
            .child(channel.id)
            .push()
            .set(createMessage())
            .then(()=>{
                setIsLoading(false)
                setMessage('');
                setErrors([]);
            })
            .catch(err=>{
                console.error(err);
                setIsLoading(false);
                setErrors(errors.concat(err));
            })
        }
        else{
            setErrors(errors.concat({message: 'Add a message'}));
        }
    }

    return (  
            <Segment className ="message__form">
                <Input
                onChange = {handleChange}
                value={message}
                fluid
                name="message"
                style={{marginBottom: '.7em'}}
                label = {<Button icon={'add'} />}
                labelPosition ="left"
                className ={
                    errors.some(error => error.message.includes('message')) ? 'error' : ''
                }
                placeholder ="Write your message"
                />

                <Button.Group icon widths="2">
                    <Button
                    disabled = {isLoading}
                    onClick = {sendMessage}
                    color="orange"
                    content="Add Reply"
                    labelPosition="left"
                    icon="edit"
                    />
                    <Button
                    onClick = {openModal}
                    color="teal"
                    content="Upload Media"
                    labelPosition="right"
                    icon="cloud upload"
                    />
                    <FileModal 
                    modal = {modal}
                    closeModal = {closeModal}
                    />
                </Button.Group>
            </Segment>
    );
}
 
export default MessageForm;