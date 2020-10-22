import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import Message from './Message';

import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';

import {Segment, Comment} from 'semantic-ui-react';

import firebase from "../../firebase"

const Messages = () => {
    const messagesDatabaseRef = firebase.database().ref('messages');
    const channel = useSelector(store=>store.channel.currentChannel);
    const user = useSelector(store=>store.user.currentUser)
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(()=>{
        if(channel&&user){
            addListeners()
        }
        return () => {
            messagesDatabaseRef.off();
        }
    }, [channel, user])

    const addMessageListener = () => {
        setMessages([]); // clears messages in case current channel database is empty, as it's not gonna go inside snap callback block nor clear messages saved on previous channel

        let loadedMessages = [];
        messagesDatabaseRef.child(channel.id).on('child_added', snap=>{
            loadedMessages.push(snap.val());
            setMessages([...loadedMessages]);
            setIsLoading(false)
            
        })
    }

    const addListeners = () => {
        addMessageListener();
    }

    const displayMessages = () => {
        if(messages.length > 0){
        const msg = messages.map(message=>{
            return <Message
            key={message.timestamp}
            message = {message}
            user={user}
            />
        })
        return msg;
    }
    }

   
    return (  
        <>
            <MessagesHeader />
            <Segment>
                <Comment.Group className="messages">
                   {displayMessages()}
                </Comment.Group>
            </Segment>
            <MessageForm
            messagesDbRef = {messagesDatabaseRef}
            />
        </>
    );
}
 
export default Messages;