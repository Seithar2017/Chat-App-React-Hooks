import firebase from "../../firebase"
import React, {useState} from 'react';
import {Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import "../App.css";


const Login = () => {
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>{
        if(e.target.name === "email"){
            setEmail(e.target.value);
        }else if(e.target.name === "password"){
            setPassword(e.target.value);
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
                .signInWithEmailAndPassword(email, password)
                .then(signedInUser => {
                    console.log(signedInUser);
                    
                })
                .catch(err => {
                    console.error(err);
                    setErrors(prevValue => prevValue.concat(err));
                    setLoading(false);
                })
        }
    }
    const isFormValid = () => email && password;

    const handleInputError = (inputName) => {
       return errors.some(error => error.message.toLowerCase().includes(inputName))
       ? "error"
       : ""
        
    }

    return (  
        <Grid textAlign ='center' verticalAlign ="middle" className="app">
            <Grid.Column style={{maxWidth:450}}>
                <Header as="h1" icon color="violet" textAlign="center">
                    <Icon name = "code branch" color="violet"/>
                    Login for DevChat
                </Header>
                <Form onSubmit = {handleSubmit} size="large">
                    <Segment stacked>
                        <Form.Input fluid name="email" icon="mail" iconPosition="left" placeholder="Email" onChange ={handleChange} type = "email" value={email} className={handleInputError("email")}/>
                        <Form.Input fluid name="password" icon="lock" iconPosition="left" placeholder="Password" onChange ={handleChange} type = "password" value={password} className={handleInputError("password")}/>
                        <Button disabled ={loading} className={loading? 'loading' : ''} color="violet" fluid size="large">Submit</Button>
                    </Segment>
                </Form>
                {errors.length > 0 && (
                    <Message error>
                        <h3>Error</h3>
                        {displayErrors()}
                    </Message>
                )}
                <Message>Don't have an account? <Link to ="/register">Register</Link></Message>
            </Grid.Column>
        </Grid>
    );
}
 
export default Login;