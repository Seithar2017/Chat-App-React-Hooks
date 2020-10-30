import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import Message from './Message';

import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';

import {Segment, Comment} from 'semantic-ui-react';

import firebase from "../../firebase"

const Messages = () => {
    const messagesDatabaseRef = firebase.database().ref('messages');
    const privateMessagesDatabaseRef = firebase.database().ref('privateMessages');

    const channel = useSelector(store=>store.channel.currentChannel);
    const privateChannel = useSelector(store => store.channel.isPrivateChannel);
    const user = useSelector(store=>store.user.currentUser);

    const [messages, setMessages] = useState([]);
    const [progressBar, setProgressBar] = useState(false);
    const [uniqueUsers, setUniqueUsers] = useState([])
    const [searchTerm, setSearchTerm] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    
    useEffect(()=>{
        if(channel&&user){
            addListeners()
        }
        return () => {
            messagesDatabaseRef.off();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channel, user])


    useEffect(()=>{
        setSearchResults([]);
    },[channel])
    
    useEffect(()=>{
        const channelMessages = [...messages];
        const regex = new RegExp(searchTerm, 'gi');
        const searchResults = channelMessages.reduce((acc, message) =>{
            if(message.content && message.content.match(regex) || message.user.name.match(regex)) {
                acc.push(message)
            }
            return acc;
        }, []);
        setSearchResults(searchResults);
        setTimeout(()=>{setSearchLoading(false)}, 250);
    }, [searchTerm])

    const getMessagesRef = () => {
        return privateChannel ? privateMessagesDatabaseRef : messagesDatabaseRef;
    }

    const addMessageListener = () => {
        setMessages([]); // clears messages in case current channel database is empty, as it's not gonna go inside snap callback block nor clear messages saved on previous channel
        setUniqueUsers([]) //same as setMessages
        let loadedMessages = [];
        const ref = getMessagesRef();
        ref.child(channel.id).on('child_added', snap=>{
            loadedMessages.push(snap.val());
            setMessages([...loadedMessages]); 
            countUniqueUsers(loadedMessages);
        })
        
    }


    const countUniqueUsers = (messages) => {
        //filter method is going to return only one message sent by each user
       const messagesWithUniqueUsers =  messages.filter((message,index,msgs)=>msgs.findIndex(msg=>(msg.user.name === message.user.name))===index);
       
       
       const uniqueUsersData = [] ;
       messagesWithUniqueUsers.map(message => uniqueUsersData.push({name: message.user.name, onChannel: message.onChannel}));

       setUniqueUsers(uniqueUsersData);
    
    }
    
    

    const addListeners = () => {
        addMessageListener();
    }

    const displayMessages = (messages) => {
        if(messages.length > 0 ){
        const msg = messages.map(message=>{
            if(message.onChannel === channel.id){
            return <Message
            key={message.timestamp}
            message = {message}
            user={user}
            />
        }
        })
        return msg;
    }
    }

   const isProgressBarVisible = percent => {
       if(percent > 0 && percent < 100) setProgressBar(true);
       else setProgressBar(false)
   }

   const displayChannelName = () => {
       return channel ? `${privateChannel ? '@' : '#'}${channel.name}` : ''
   }
   const handleSearchChange = e => {
       setSearchTerm(e.target.value);
       setSearchLoading(true);
    }

    const reduceUniqueUsers = (uniqueUsers) => {
        const reducedUsers = [];
        uniqueUsers.map( user => {
            debugger;
            if(user.onChannel === channel.id){
                debugger;
                reducedUsers.push(user.name)
            }
        })

        return reducedUsers.length;
    }
    return (  
        <>
            <MessagesHeader 
            channelName = {displayChannelName()}
            numberOfUniqueUsers = {reduceUniqueUsers(uniqueUsers)}
            handleChange = {handleSearchChange}
            search = {searchTerm}
            searchLoading={searchLoading}
            isPrivateChannel = {privateChannel}
            />
            <Segment>
                <Comment.Group className={progressBar ? "messages__progress" : "messages"}>
                   {searchTerm ? displayMessages(searchResults) : displayMessages(messages)}
                </Comment.Group>
            </Segment>
            <MessageForm
            messagesDbRef = {messagesDatabaseRef}
            isProgressBarVisible ={isProgressBarVisible}
            isPrivateChannel = {privateChannel}
            getMessagesRef = {getMessagesRef}
            />
        </>
    );
}
 
export default Messages;