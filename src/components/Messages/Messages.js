import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import Message from './Message';

import {setUserPosts} from '../../actions/'

import React, {useState, useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {Segment, Comment} from 'semantic-ui-react';

import firebase from "../../firebase"

const Messages = () => {
    const dispatch = useDispatch();
    const messagesDatabaseRef = firebase.database().ref('messages');
    const privateMessagesDatabaseRef = firebase.database().ref('privateMessages');
    const usersDatabaseRef = firebase.database().ref('users');
    const channel = useSelector(store=>store.channel.currentChannel);
    const privateChannel = useSelector(store => store.channel.isPrivateChannel);
    const user = useSelector(store=>store.user.currentUser);

    const [isChannelStarred, setIsChannelStarred] = useState(false);
    const didMountRef = useRef(false)
    const [messages, setMessages] = useState([]);
    const [progressBar, setProgressBar] = useState(false);
    const [uniqueUsers, setUniqueUsers] = useState([])
    const [searchTerm, setSearchTerm] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    

    useEffect(()=>{
        if(didMountRef.current){
            if(isChannelStarred){
                usersDatabaseRef
                .child(`${user.uid}/starred`).update({
                    [channel.id]: {
                        name: channel.name,
                        details: channel.details,
                        createdBy: {
                            name: channel.createdBy.name,
                            avatar: channel.createdBy.avatar,
                        }
                    }
                })
            }
            else{
                usersDatabaseRef
                .child(`${user.uid}/starred`)
                .child(channel.id)
                .remove(err=>{
                    if(err!== null) {
                        console.error(err);
                    }
                })
            }
        
    }
        else{
            didMountRef.current = true;
    }
    }, [isChannelStarred])

    useEffect(()=>{
        if(channel&&user){
            addListeners();
            addUserStarsListener(channel.id, user.uid);
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

    const handleStar = () => setIsChannelStarred(prevState => !prevState);

    const getMessagesRef = () => {
        return privateChannel ? privateMessagesDatabaseRef : messagesDatabaseRef;
    }

    const addUserStarsListener = (channelId, userId) => {
        usersDatabaseRef
            .child(userId)
            .child('starred')
            .once('value')
            .then(data => {
                if(data.val() !== null){
                    const channelIds = Object.keys(data.val());
                    const prevStarred = channelIds.includes(channelId);
                    setIsChannelStarred(prevStarred);
                }
            })
    }

    const getCurrentAvatar = (message) =>{
        const messageUserId = message.user.id;
        let avatar = '';
        usersDatabaseRef.child(messageUserId).on('value', snap =>{
            avatar = snap.val().avatar;
        })
        return avatar;
    }
    const countUserPosts = (messages) =>{
        let userPosts = messages.reduce((acc, message)=>{
            if(message.user.name in acc){
                acc[message.user.name].count +=1;
            }
            else{
                    
                acc[message.user.name] = {
                    avatar: getCurrentAvatar(message),
                    count: 1
                }
            }
            return acc;
        }, {});
        dispatch(setUserPosts(userPosts));
        
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
            countUserPosts(loadedMessages);
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
                    return (
                        <Message
                            key={message.timestamp}
                            message = {message}
                            user={user}
                            avatar = {getCurrentAvatar(message)}
                        />
                    )
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
            if(user.onChannel === channel.id){
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
            handleStar = {handleStar}
            isChannelStarred = {isChannelStarred}
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