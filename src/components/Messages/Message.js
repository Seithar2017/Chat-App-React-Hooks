import React, {useState} from 'react';
import moment from 'moment'
import {Comment, Image, Modal} from 'semantic-ui-react'

const Message = ({message, user, avatar}) => {    
    const [imagePreview, setImagePreview] = useState(false);
    const isOwnMessage = (message, user) => {
        return message.user.id === user.uid ? 'message__self' : '';
    }
    const isImage = (message) => {
        return message.hasOwnProperty('image') && !message.hasOwnProperty('content');
    }

    const timeFromNow = (timestamp) => moment(timestamp).fromNow();
    const openImage = () => {
        setImagePreview(true);
    }
    const closeImage = () => {
        setImagePreview(false);
    }
    return ( 
        <>
        <Comment>
            <Comment.Avatar src = {avatar} />
            <Comment.Content className = {isOwnMessage(message, user)}>

                <Comment.Author as ="a">
                    {message.user.name}
                </Comment.Author>

                <Comment.Metadata>
                    {timeFromNow(message.timestamp)}
                </Comment.Metadata>
            {
                isImage(message) 
                ? 
                <Image
                style={{cursor: 'pointer'}}
                src={message.image} 
                className="message__image"
                onClick = {openImage}
                />
                :
                <Comment.Text>
                    {message.content}
                </Comment.Text>
            }
            </Comment.Content>
        </Comment>
            <Modal
            basic
            onClose={closeImage}
            onOpen={openImage}
            open={imagePreview}
            size = "large"
            closeIcon
            dimmer = "blurring"
            centered = {true}
            >
                <Modal.Content image>
                    <Image 
                    size='huge' 
                    src={message.image} 
                    centered ={true}
                    wrapped />
                </Modal.Content>
            </Modal>
        
        </>
     );
}
 
export default Message;