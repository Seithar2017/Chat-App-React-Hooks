import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import Message from './Message';
import Skeleton from './Skeleton';

import {setUserPosts} from '../../actions/'

import React, {useState, useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {Segment, Comment} from 'semantic-ui-react';

import firebase from "../../firebase"
import Typing from "./Typing";

const Messages = () => {
    const dispatch = useDispatch();
    const messagesDatabaseRef = firebase.database().ref('messages');
    const privateMessagesDatabaseRef = firebase.database().ref('privateMessages');
    const usersDatabaseRef = firebase.database().ref('users');
    const typingDbRef = firebase.database().ref('typing');

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
    const [typingUsers, setTypingUsers] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState([]);
    const connectedRef = firebase.database().ref('.info/connected');
    const messagesEnd = useRef (null);

    
    useEffect(()=>{
        if(messagesEnd.current){
            scrollToBottom();
    }
    },[channel, messages, typingUsers])
    
    useEffect(()=>{
        const usersDatabaseRef = firebase.database().ref('users');
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
            else if(!isChannelStarred){
                usersDatabaseRef
                .child(`${user.uid}/starred`)
                .child(channel.id)
                .remove(err=>{
                    if(err!== null) {
                        console.error(err);
                    }
                })
            }
        
        }else{
            didMountRef.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isChannelStarred])

    useEffect(()=>{
        if(channel&&user){
            addListeners();
            addUserStarsListener(channel.id, user.uid);
        }
        return () => {
            if(channel&&user){
            messagesDatabaseRef.off();
            getMessagesRef().child(channel.id).off('child_added');
            typingDbRef.child(channel.id).off('child_added');
            typingDbRef.child(channel.id).off('child_removed');
            connectedRef.off();
            }
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
            if((message.content && message.content.match(regex) )|| message.user.name.match(regex)) {
                acc.push(message)
            }
            return acc;
        }, []);
        setSearchResults(searchResults);
        setTimeout(()=>{setSearchLoading(false)}, 250);
    }, [searchTerm, messages])

    const scrollToBottom = () => {
        messagesEnd.current
        .scrollIntoView()
    }
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
        usersDatabaseRef.child(messageUserId).once('value', snap =>{
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
            setMessagesLoading(false);
        })

        if(!loadedMessages.length){
            setMessagesLoading(false);
        }
    }


    const countUniqueUsers = (messages) => {
        //filter method is going to return only one message sent by each user
       const messagesWithUniqueUsers =  messages.filter((message,index,msgs)=>msgs.findIndex(msg=>(msg.user.name === message.user.name))===index);
       
       const uniqueUsersData = [] ;
       messagesWithUniqueUsers.map(message => uniqueUsersData.push({name: message.user.name, onChannel: message.onChannel}));

       setUniqueUsers(uniqueUsersData);
    }
    
    
    const addTypingListener = () => {
        let typingUsers = [];
        setTypingUsers([]); // clears typing users after channel change
        typingDbRef
            .child(channel.id).on('child_added', snap=>{
                if(snap.key !== user.uid){
                    typingUsers = typingUsers.concat({
                        id: snap.key,
                        name: snap.val()
                    })
                    setTypingUsers([...typingUsers]);
                }
            })

        typingDbRef
            .child(channel.id).on('child_removed', snap=>{
                const index = typingUsers.findIndex(user => user.id === snap.key);
                if (index !== -1){
                    typingUsers.splice(index, 1);
                    setTypingUsers([...typingUsers]);
                }
            })
        
        connectedRef.on('value', snap => {
            if(snap.val() === true){
                typingDbRef
                    .child(channel.id)
                    .child(user.uid)
                    .onDisconnect()
                    .remove(err => {
                        if(err!==null) console.error(err);
                    })
            }
        })


    }

    const addListeners = () => {
        addMessageListener();
        addTypingListener();
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
                }else return null;  
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
            return null;
        })

        return reducedUsers.length;
    }

    const displayTypingUsers = users => {
        return users.length > 0 && users.map(user =>{
            return(
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.2em'}} key={user.id}>
                    <span className="user__typing">{user.name} is typing</span> <Typing />
                </div>
            )
        })
    }

    const displayMessagesSkeleton = loading => {
        return loading ? (
            <>
                {[...Array(10)].map((_, i) =>(
                    <Skeleton key={i}/>
                ))}
            </>
        ) : null;
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
                   {displayMessagesSkeleton(messagesLoading)} 
                   {searchTerm 
                   ? displayMessages(searchResults) 
                   : displayMessages(messages)}
                    {displayTypingUsers(typingUsers)}
                    <div></div>
                    <div className="messagesEnd" ref = {messagesEnd}></div>
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