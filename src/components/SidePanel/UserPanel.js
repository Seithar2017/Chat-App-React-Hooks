import React, {useState, useRef, useEffect} from 'react';
import {Grid, Header, Icon, Dropdown, Image, Input,  Modal, Button} from 'semantic-ui-react';
import firebase from '../../firebase';
import {useSelector} from 'react-redux';
import AvatarEditor from 'react-avatar-editor';

const UserPanel = () => {
    const user = useSelector(store => store.user.currentUser);
    const colors = useSelector(store=>store.colors);
    const [modal, setModal] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [croppedImage, setCroppedImage] = useState('');
    const [blob, setBlob] = useState('');
    const [uploadedCroppedImage, setUploadedCroppedImage] = useState('');
    const [metadata, setMetadata] = useState({
        contentType: 'image/jpeg'
    })
    const avatarEditor = useRef(null);
    const storageRef = firebase.storage().ref();
    const userRef = firebase.auth().currentUser;
    const usersDbRef = firebase.database().ref('users');

    useEffect(()=>{     
        if(uploadedCroppedImage){
            changeAvatar();
        }
    }, [uploadedCroppedImage])

    const changeAvatar = () => {
        userRef
            .updateProfile({
                photoURL: uploadedCroppedImage
            })
            .then(()=>{
                console.log('PhotoURL updated');
                closeModal();
            })
            .catch(err=>{
                console.error(err);
                
            })

        usersDbRef
        .child(user.uid)
        .update({avatar: uploadedCroppedImage})
        .then(()=>{
            console.log('User avatar updated');
        })
        .catch(err => {
            console.error(err);
            
        })
    }
    if(!user){
        return <p>You are currently signed out. Would you like to <a href="http://localhost:3000/login">log in?</a></p>
    }

    const openModal = () => setModal(true);
    const closeModal = () => {
        setModal(false)
        setPreviewImage('');
        setCroppedImage('');
        setBlob('');

    };
    

    const dropdownOptions = () =>[        
        {
            key: 'user',
            text: <span>Signed in as <strong>{user.displayName}</strong></span>,
            disabled: true,
        },

        {
            key: 'avatar',
            text: <span onClick = {openModal}>Change Avatar</span>
        },

        {
            key: 'signout',
            text: <span onClick = {handleSignout}>Sign Out</span>
        },
    ];

    const handleSignout = () => {
        firebase
            .auth()
            .signOut()
            .then(()=> console.log('Signed Out!'))
    }

    const handleChange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        if(file){
            reader.readAsDataURL(file);
            reader.addEventListener('load', () => {
                setPreviewImage(reader.result);
            });
        }
    }

    const handleCropImage = () => {
        if(avatarEditor.current){
            avatarEditor.current.getImageScaledToCanvas().toBlob(blob => {
                let imageUrl = URL.createObjectURL(blob);
                setCroppedImage(imageUrl);
                setBlob(blob);
            })
        }
    }

    const uploadCroppedImage = () => {
        storageRef
            .child(`avatars/user-${userRef.uid}`)
            .put(blob, metadata)
            .then(snap => {
                snap.ref.getDownloadURL().then(downloadURL => {
                    setUploadedCroppedImage(downloadURL)
                })
            })
    }
    return (
        <Grid style ={{background: colors.primaryColor}}>
        <Grid.Column>
            <Grid.Row style={{padding: '1.2em', margin: 0}}>
                {/* App Header */}
                <Header inverted floated="left" as="h2">
                    <Icon name="code" />
                    <Header.Content>
                        DevChat
                    </Header.Content>
                </Header>
            </Grid.Row>

            {/* User Dropdown */}
            <Header style ={{padding: '0.25em'}} as='h4' inverted>
            
                <Dropdown trigger={
                   <span>
                       <Image src={user.photoURL} spaced ='right' avatar/>
                       {user.displayName}
                       </span>
                } options={dropdownOptions()}/>
                

            </Header>

            {/* Change User Avatar Modal */}
            <Modal
                basic
                open={modal}
                onClose={closeModal}
            >
                <Modal.Header>Change Avatar</Modal.Header>
                <Modal.Content>
                    <Input 
                        onChange={handleChange}
                        fluid
                        type="file"
                        label="New Avatar"
                        name="previewImage"
                    />
                    <Grid centered stackable columns={2}>
                        <Grid.Row centered>
                            <Grid.Column className = "ui center aligned grid">
                                {previewImage && (
                                    <AvatarEditor
                                    ref={avatarEditor}
                                    image = {previewImage}
                                    width={120}
                                    height={120}
                                    border={50}
                                    scale={1.2}
                                    />

                                    
                                )}
                            </Grid.Column>
                            <Grid.Column>
                                {croppedImage && (
                                    <Image
                                    style={{margin: '3.5em auto'}}
                                    width={100}
                                    height={100}
                                    src = {croppedImage}
                                    />
                                )}
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Modal.Content>

                <Modal.Actions>
                    {croppedImage && (
                    <Button color = "green" inverted onClick = {uploadCroppedImage}>
                        <Icon name = "save" /> Change Avatar
                    </Button>
                    )}

                    <Button color = "green" inverted onClick={handleCropImage}>
                        <Icon name = "image" /> Preview
                    </Button>

                    <Button color = "red" inverted onClick = {closeModal}>
                        <Icon name = "remove" /> Cancel
                    </Button>
                </Modal.Actions>
            </Modal>
        </Grid.Column>

        </Grid>
      );
}
 
export default UserPanel;