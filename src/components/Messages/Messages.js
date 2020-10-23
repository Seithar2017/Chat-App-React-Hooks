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
    const [progressBar, setProgressBar] = useState(false);
    const [uniqueUsers, setUniqueUsers] = useState([])
    // const [isLoading, setIsLoading] = useState(true);
    
    useEffect(()=>{
        if(channel&&user){
            addListeners()
        }
        return () => {
            messagesDatabaseRef.off();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channel, user])

    const addMessageListener = () => {
        setMessages([]); // clears messages in case current channel database is empty, as it's not gonna go inside snap callback block nor clear messages saved on previous channel
        setUniqueUsers([]) //same as setMessages

        let loadedMessages = [];
        messagesDatabaseRef.child(channel.id).on('child_added', snap=>{
            loadedMessages.push(snap.val());
            setMessages([...loadedMessages]);
            // setIsLoading(false)
            countUniqueUsers(loadedMessages);
        })
        
    }

    const countUniqueUsers = (messages) => {
        const uniqueUsers = [];
        messages.map(message => {
            if(!uniqueUsers.includes(message.user.name)){
                uniqueUsers.push(message.user.name);
            }
        })
        setUniqueUsers(uniqueUsers);
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

   const isProgressBarVisible = percent => {
       if(percent > 0 && percent < 100) setProgressBar(true);
       else setProgressBar(false)
   }

   const displayChannelName = () => channel ? `#${channel.name}` : '';
    return (  
        <>
            <MessagesHeader 
            channelName = {displayChannelName()}
            numberOfUniqueUsers = {uniqueUsers.length}
            />
            <Segment>
                <Comment.Group className={progressBar ? "messages__progress" : "messages"}>
                   {displayMessages()}
                </Comment.Group>
            </Segment>
            <MessageForm
            messagesDbRef = {messagesDatabaseRef}
            isProgressBarVisible ={isProgressBarVisible}
            />
        </>
    );
}
 
export default Messages;