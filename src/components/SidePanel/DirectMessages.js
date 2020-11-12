import React, {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import { Menu, Icon} from 'semantic-ui-react';
import firebase from '../../firebase';
import {setPrivateChannel} from "../../actions";
const DirectMessages = () => {
    const currentUser = useSelector(store => store.user.currentUser);
    const dispatch = useDispatch();
    const [users, setUsers] = useState([]);
    const [lastUser, setLastUser] = useState(null);
    const [readyToListen, setReadyToListen] = useState(false);
    const [activeChannel, setActiveChannel] = useState(null);
    
    useEffect(()=>{
        const usersDbRef = firebase.database().ref('users');
        if(currentUser && lastUser === null){
            usersDbRef.limitToLast(1).on('child_added', snap => {
                setLastUser(snap.val());
                //the value of lastUser is necessary to check when
                //the program has finished loading all currently
                //registered users
            
        })}

        return ()=>{
            usersDbRef.off();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[currentUser])

    useEffect(()=>{
        const usersDbRef = firebase.database().ref('users');
        if(currentUser){
            let loadedUsers = [];
            usersDbRef.on("child_added", snap => {
                
                let user = snap.val();
                user["uid"] = snap.key;
                user["status"] = "offline";
                loadedUsers.push(user);
                setUsers([...loadedUsers]);
                
        });
        }

        return ()=>{
            usersDbRef.off();
        }
    }, [currentUser])


    useEffect(()=>{
        const connectedRef = firebase.database().ref('.info/connected');
        const presenceDbRef = firebase.database().ref('presence');
        //addListeners function suppose to run only after all of the users from the
        //firebase database are loaded into users state

        //readyToListen indicates the readiness and its state is going to be
        //changed only once, which ensures that this effect won't be 
        //executed multiple times
        if(currentUser && readyToListen){
                const addListeners = currentUserUid => {

        //1st listener
        //while logging into the app, adds user's ID into database >> presence
        connectedRef.on('value', snap => {
            if(snap.val() === true){
                const ref = presenceDbRef.child(currentUserUid);
                ref.set(true);
                ref.onDisconnect().remove(err => {
                    if(err!==null){
                        console.error(err);
                    }
                })
            }
        })

        //2nd listener
        //checks when the first listener adds user's ID into database >> presence, then executes function which changes user's status to ONLINE
        presenceDbRef.on('child_added', snap => {
            if(currentUserUid !== snap.key) {
                addStatusToUser(snap.key);
            }
        })

        //3rd listener
        //same as 2nd listener but it checks when the ID from database is removed, then it executes the addStatusToUser to change user's status to OFFLINE
        presenceDbRef.on('child_removed', snap => {
            if(currentUserUid !== snap.key) {
                addStatusToUser(snap.key, false);
            }
        })
    }

            addListeners(currentUser.uid)
        }

        return ()=>{
            connectedRef.off();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser, readyToListen])

    if(users.length>0 && lastUser !== null && !readyToListen){
        if(users[users.length-1].uid === lastUser.uid){
        setReadyToListen(true);
    }}



    const addStatusToUser = (userId, connected = true) => {
        const updatedUsers = users.reduce((acc, user) => {
            if(user.uid === userId){
                user['status'] = `${connected ? 'online' : 'offline'}`
            }
            return acc.concat(user);
        }, [])
        setUsers([...updatedUsers]);
    }

    const isUsersOnline = (user) => {
        return user.status === 'online' ;
    }

    const getChannelId = userId => {
        const currentUserId = currentUser.uid;
        return userId < currentUserId 
        ? `${userId}/${currentUserId}`
        : `${currentUserId}/${userId}`

    }
    const changeChannel = (user) => {
        const channelId = getChannelId(user.uid);
        const channelData = {
            id: channelId,
            name: user.name,
        };
        dispatch(setPrivateChannel(true, channelData));
        setActiveChannel(user.uid);
    }
    const displayUsers = () =>{
        return users.map(user => {
            if(user.uid!==currentUser.uid) return (
            <Menu.Item
            key={user.uid}
            onClick = {()=>changeChannel(user)}
            style={{opacity: 0.7, fontStyle: 'italic'}}
            active = {user.uid === activeChannel}
            
            >
                <Icon
                name='circle'
                color={isUsersOnline(user) ? 'green' : 'blue'}
                />

                @ {user.name}
            </Menu.Item>
        )
        else return null;
        })
    }
    return ( 
        <Menu.Menu className="menu">
            <Menu.Item>
                <span>
                    <Icon name = "mail" /> DIRECT MESSAGES
                </span>
                ({users.length - 1})
            </Menu.Item>
            {displayUsers()}
        </Menu.Menu>
     )
}
 
export default DirectMessages;