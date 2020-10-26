import firebase from "../../firebase"
import React, {useState} from 'react';
import {Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import "../App.css";
import md5 from 'md5';

const Register = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);
    const userDatabaseRef = firebase.database().ref('users');

    const isFormEmpty = () => {
        return !username || !email || !password || !passwordConfirmation;
    }
    const isFormValid = () => {
        let err

        if(isFormEmpty()){
            err = {message: "Fill in all fields"}
                setErrors(prevValue => prevValue.concat(err));
            return false;
        }else if(!isPasswordValid()){
            err = {message: 'Password is invalid'};
                setErrors(prevValue => prevValue.concat(err));
        }
        else return true;
    }

    const isPasswordValid = () => {
        if(password.length < 6 || passwordConfirmation.length < 6){
            return false;
        }else if(password !== passwordConfirmation){
            return false;
        }
        else return true;
    }

    const handleChange = (e) =>{
        if(e.target.name === "username"){
            setUsername(e.target.value);
        }else if(e.target.name === "email"){
            setEmail(e.target.value);
        }else if(e.target.name === "password"){
            setPassword(e.target.value);
        }else if(e.target.name === "passwordConfirmation"){
            setPasswordConfirmation(e.target.value);
        }
    }

    const displayErrors = () =>{

        return errors.map((error, i) => (<p key={i}>{error.message}</p>))
    }


    const handleSubmit = (e) =>{
        e.preventDefault();
        setErrors([]);
            if(isFormValid()) {
                setErrors([]);
                setLoading(true);
                firebase
                .auth()
                .createUserWithEmailAndPassword(email, password)
                .then(createdUser => {
                    createdUser.user.updateProfile({
                        displayName: username,
                        photoURL: `http://gravatar.com/avatar/${md5(createdUser.user.email)}?d=monsterid`
                    })
                    .then(()=>{
                    //    setLoading(false);
                    debugger;
                    saveUser(createdUser)
                    .then(()=>{
                        setLoading(false)
                        
                    })
                    
                    })
                    .catch(err => {
                        setErrors(prevValue => prevValue.concat(err));
                    })
                })
                .catch(err => {
                    setLoading(false);
                    setErrors(prevValue => prevValue.concat(err));
            })
        }
    }

    const handleInputError = (inputName) => {
       return errors.some(error => error.message.toLowerCase().includes(inputName))
       ? "error"
       : ""
        
    }

    const saveUser = (createdUser) =>{
        debugger;
        return userDatabaseRef.child(createdUser.user.uid).set({
            name: createdUser.user.displayName,
            avatar: createdUser.user.photoURL,
            uid: createdUser.user.uid
        });
    }
    return (  
        <Grid textAlign ='center' verticalAlign ="middle" className="app">
            <Grid.Column style={{maxWidth:450}}>
                <Header as="h1" icon color="orange" textAlign="center">
                    <Icon name = "puzzle piece" color="orange"/>
                    Register for DevChat
                </Header>
                <Form onSubmit = {handleSubmit} size="large">
                    <Segment stacked>
                        <Form.Input fluid name="username" icon="user" iconPosition="left" placeholder="Username" onChange ={handleChange} type = "text" value={username}/>
                        <Form.Input fluid name="email" icon="mail" iconPosition="left" placeholder="Email" onChange ={handleChange} type = "email" value={email} className={handleInputError("email")}/>
                        <Form.Input fluid name="password" icon="lock" iconPosition="left" placeholder="Password" onChange ={handleChange} type = "password" value={password} className={handleInputError("password")}/>
                        <Form.Input fluid name="passwordConfirmation" icon="repeat" iconPosition="left" placeholder="Password" onChange ={handleChange} type = "password" value={passwordConfirmation} className={handleInputError("password")}/>

                        <Button disabled ={loading} className={loading? 'loading' : ''} color="orange" fluid size="large">Submit</Button>
                    </Segment>
                </Form>
                {errors.length > 0 && (
                    <Message error>
                        <h3>Error</h3>
                        {displayErrors()}
                    </Message>
                )}
                <Message>Already an user? <Link to ="/login">Login</Link></Message>
            </Grid.Column>
        </Grid>
    );
}
 
export default Register;