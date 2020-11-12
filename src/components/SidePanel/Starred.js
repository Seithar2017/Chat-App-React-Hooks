import React, {useState, useEffect, useRef} from 'react';
import {Menu, Icon} from 'semantic-ui-react';
import {useDispatch, useSelector} from 'react-redux';
import {setCurrentChannel} from "../../actions";
import firebase from '../../firebase';

const Starred = () => {
    const dispatch = useDispatch();
    const [starredChannels, _setStarredChannels] = useState([]);
    const starredChannelsRef = useRef(starredChannels)
    const [activeChannel, setActiveChannel] = useState('');
    const user = useSelector(store => store.user.currentUser);
    const currentChannel = useSelector(store => store.channel.currentChannel)
    const usersDbRef = firebase.database().ref('users');
    const typingDbRef = firebase.database().ref('typing');
    useEffect(()=>{
        if(user){
            addListeners(user.uid);
        }

        
        return ()=>{
            usersDbRef.child(user.uid).child('starred').off('child_added');
            usersDbRef.child(user.uid).child('starred').off('child_removed');
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    const setStarredChannels = (data) => {
        starredChannelsRef.current = data;
        _setStarredChannels(data);
    }
    const addListeners = (userId) => {
        
        usersDbRef
            .child(userId)
            .child('starred')
            .on('child_added', snap => {
                const starredChannel = {id: snap.key, ...snap.val()};
                const updatedChannels = [...starredChannelsRef.current, starredChannel]
                setStarredChannels(updatedChannels);
            })

        usersDbRef
            .child(userId)
            .child('starred')
            .on('child_removed', snap => {
                const channelToRemove = {id: snap.key, ...snap.val()}
                const filteredChannels = starredChannelsRef.current.filter(channel => {
                    return channel.id !== channelToRemove.id
                })
                setStarredChannels(filteredChannels)
            })
    }
    const handleChannelChange = (channel) => {
        //clearTyping must occur before setChannel call, before ID is updated
        if(currentChannel) clearTyping(currentChannel.id, user.uid);
        dispatch(setCurrentChannel(channel, false))
        setActiveChannel(channel.id);
    }

    const clearTyping = (channelId, userId) => {
        return typingDbRef
            .child(channelId)
            .child(userId)
            .remove();
    }
    const displayChannels = (channels) => {
        if(channels.length>0)
        {
            return starredChannels.map(channel => (
                    <Menu.Item
                    key={channel.id}
                    onClick = {()=>{handleChannelChange(channel)}}
                    name = {channel.name}
                    style = {{opacity: '0.7'}}
                    active = {channel.id === activeChannel}
                    >   
                        # {channel.name}
                    </Menu.Item>)
            )
        }
    }

    return (
            <Menu.Menu className = "menu">
                <Menu.Item>
                    <span>
                        <Icon name="star"/> STARRED
                    </span>
                    ({starredChannels.length})
                    
                </Menu.Item>
                {displayChannels(starredChannels)} 
            </Menu.Menu>
    )
    }
export default Starred;