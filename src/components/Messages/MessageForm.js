import React,{useState, useEffect, useRef} from 'react';
import { v4 as uuidv4 } from 'uuid'
import {useSelector} from 'react-redux';
import {Segment, Button, Input} from 'semantic-ui-react';
import firebase from '../../firebase';

import FileModal from "./FileModal";
import ProgressBar from "./ProgressBar"
import {Picker, emojiIndex} from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';

const MessageForm = ({isProgressBarVisible, isPrivateChannel, getMessagesRef}) => {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [modal, setModal] = useState(false);
    const [uploadState, setUploadState] = useState('')
    const [percentUploaded, setPercentUploaded] = useState(0);
    const [uploadTask, setUploadTask] = useState(null);
    const [emojiPicker, setEmojiPicker] = useState(false);
    const isInitialMount = useRef(true);
    const messagesDbRef = getMessagesRef();
    const typingDbRef = firebase.database().ref('typing');
    const storageRef = firebase.storage().ref();

    const inputRef = useRef(null);

    const user = useSelector(store=> store.user.currentUser);

    const channel = useSelector(store=>store.channel.currentChannel);

    const openModal = () => setModal(true);
    const closeModal = () => setModal(false);

    useEffect(()=>{
        if(isInitialMount.current){
            isInitialMount.current = false;
        }
        else if(uploadState === 'uploading'){
        const pathToUpload = channel.id;
        uploadTask.on('state_changed', snap => {
            const percentUploaded = Math.round (snap.bytesTransferred /snap.totalBytes *100);
            isProgressBarVisible(percentUploaded);
            setPercentUploaded(percentUploaded);
        },
        err => {
            console.error(err);
            setErrors(prevValue => prevValue.concat(err));
            setUploadState('error');
            setUploadTask(null);
        },
        ()=>{
            uploadTask.snapshot.ref.getDownloadURL()
            .then(downloadUrl => {
                sendFileMessage(downloadUrl, messagesDbRef, pathToUpload);
            })
            .catch(err=>{
                console.error(err);
                setErrors(prevValue => prevValue.concat(err));
                setUploadState('error');
                setUploadTask(null);
            })
        }
        )}
    }, [uploadState, uploadTask])

    const sendFileMessage = (fileUrl, messagesDbRef, pathToUpload) => {
        messagesDbRef.child(pathToUpload)
        .push()
        .set(createMessage(fileUrl))
        .then(()=>{
            setUploadState('done');
        })
        .catch(err=>{
            console.error(err);
            setErrors(prevValue => prevValue.concat(err));
        })
    }
    const handleChange = (e) => {
        setMessage(e.target.value)
    }
    const createMessage = (fileUrl = null) => {
        const msg = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            onChannel: channel.id,
            user: {
                id: user.uid,
                avatar: user.photoURL,
                name: user.displayName,
            },
            
        }
        if(fileUrl !== null){
            msg['image'] = fileUrl; //msg.image = fileUrl
        }
        else{
            msg['content'] = message; //msg.content = message
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
                clearTyping(channel.id, user.uid);
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
    const getPath = () => {
        if(isPrivateChannel){
            return `chat/private-${channel.id}`;
        }
        else{
            return 'chat/public';
        }
    }
    const uploadFile = (file, metadata) => {
        const filePath = `${getPath()}/${uuidv4()}.jpg`;
        setUploadState('uploading');
        setUploadTask(storageRef.child(filePath).put(file, metadata));
    }
    const setUpTyping = (channel, user) => {
        return typingDbRef
                .child(channel.id)
                .child(user.uid)
                .set(user.displayName)
    }
    const clearTyping = (channelId, userId) => {
        return typingDbRef
            .child(channelId)
            .child(userId)
            .remove();
    }

    const handleKeyDown = e => {
        if(e.keyCode === 13)
        {
            sendMessage();
        }
    }
    const handleKeyUp = () =>{
        if(message){
            setUpTyping(channel, user);
        }
        else {
            clearTyping(channel.id, user.uid);
        }
    }

    const handleTogglePicker = () => {
        setEmojiPicker(!emojiPicker);
    }

    const colonToUnicode = message => {
        return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
          x = x.replace(/:/g, "");
          let emoji = emojiIndex.emojis[x];
          if (typeof emoji !== "undefined") {
            let unicode = emoji.native;
            if (typeof unicode !== "undefined") {
              return unicode;
            }
          }
          x = ":" + x + ":";
          return x;
        });
      };
    

    const handleAddEmoji = (emoji) => {
        const oldMessage = message;
        const newMessage = colonToUnicode(`${oldMessage} ${emoji.colons}`);
        setMessage(newMessage);
        setEmojiPicker(false);
        inputRef.current.focus();
    }
    return (  
            <Segment className ="message__form">
                {emojiPicker && (
                    <Picker 
                        set="apple"
                        onSelect = {handleAddEmoji}
                        className = "emojipicker"
                        title = "Pick your emoji"
                        emoji = "point_up"
                    />
                )}
                <Input
                onChange = {handleChange}
                onKeyDown ={handleKeyDown}
                onKeyUp = {handleKeyUp}
                value={message}
                ref = {inputRef}
                fluid
                name="message"
                style={{marginBottom: '.7em'}}
                label = {
                    <Button 
                        icon={emojiPicker ? 'close' : 'add'} 
                        content = {emojiPicker ? "Close" : null}
                        onClick={handleTogglePicker}

                    />}
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
                    disabled={uploadState === "uploading"}
                    color="teal"
                    content="Upload Media"
                    labelPosition="right"
                    icon="cloud upload"
                    />
                </Button.Group>
                <FileModal 
                    modal = {modal}
                    closeModal = {closeModal}
                    uploadFile={uploadFile}
                />
                <ProgressBar
                uploadState = {uploadState}
                percentUploaded = {percentUploaded}
                />
            </Segment>
    );
}
 
export default MessageForm;