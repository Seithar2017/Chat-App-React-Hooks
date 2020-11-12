import React, {useState, useEffect} from 'react';
import {Sidebar, Menu, Divider, Button, Modal, Icon, Label, Segment} from 'semantic-ui-react';
import {SliderPicker} from 'react-color';
import {useSelector, useDispatch} from 'react-redux';
import firebase from '../../firebase';
import {setColors} from '../../actions'
const ColorPanel = () => {
    const dispatch = useDispatch();
    const [modal, setModal] = useState(false);
    const [primary, setPrimary] = useState('#40bfbe');
    const [secondary, setSecondary] = useState('#40bfbe');
    const openModal = () => setModal(true);
    const closeModal = () => setModal(false);
    const usersDbRef = firebase.database().ref('users');
    const currentUser = useSelector(store=> store.user.currentUser);
    const [userColors, setUserColors] = useState([]);

    useEffect(()=>{
        const usersRef = firebase.database().ref('users');
        if(currentUser){
            const addListener = userId => {
                let userColors = [];
                usersRef
                    .child(`${userId}/colors`)
                    .on('child_added', snap => {
                        userColors.unshift(snap.val());
                        setUserColors([...userColors])
                    })
            }
            addListener(currentUser.uid);
        }
        return () => {
            usersRef.child(`${currentUser.uid}/colors`).off();
        }
    }, [currentUser])



    const saveColors = () => {
        usersDbRef
            .child(`${currentUser.uid}/colors`)
            .push()
            .update({
                primary,
                secondary
            })
            .then(() => {
                closeModal();
            })
            .catch(err => console.error(err));
    }

    const handleSaveColors = () => {
        if(primary&&secondary){
            saveColors(primary, secondary)
        }
    }

   
    const handleChangePrimary = (color) => {
            setPrimary(color.hex)
    }

    const handleChangeSecondary = (color) => {
            setSecondary(color.hex)
    }
    const displayUserColors = (colors) => {
        return colors.length > 0 && colors.map((color, i) => {
            return(
            <React.Fragment key={i}>
                <Divider />
                <div className="color__container" onClick = {()=>dispatch(setColors(color.primary, color.secondary))}>
                    <div 
                    className="color__square" 
                    style={{background: color.primary}}
                    >
                        <div 
                        className="color__overlay" 
                        style={{background: color.secondary}}
                        >

                        </div>
                    </div>
                </div>
            </React.Fragment>
            )
        })
    }
    return (  
        <Sidebar
        as={Menu}
        icon="labeled"
        inverted
        vertical
        visible
        width='very thin'
        >
            <Divider />
            <Button 
                icon="add" 
                size="small" 
                color="blue" 
                onClick={openModal}
            />
            {displayUserColors(userColors)}
            {/* Color Picker Modal */}
            <Modal basic open = {modal} onClose = {closeModal}>
                <Modal.Header>
                    Choose App Colors
                </Modal.Header>
                
                <Modal.Content>
                    <Segment inverted>
                        <Label content="Primary Color" />
                        <SliderPicker color = {primary} onChange = {handleChangePrimary}/>
                    </Segment>
                    <Segment inverted>
                        <Label content="Secondary Color"/>
                        <SliderPicker color = {secondary} onChange = {handleChangeSecondary}/>
                    </Segment>
                </Modal.Content>

                <Modal.Actions>
                    <Button color="green" inverted onClick = {handleSaveColors}>
                        <Icon name="checkmark"/>Save colors
                    </Button>
                    
                    <Button color="red" inverted onClick={closeModal}>
                        <Icon name="remove"/>Cancel
                    </Button>
                </Modal.Actions>

            </Modal>
        </Sidebar>
    );
}
 
export default ColorPanel;