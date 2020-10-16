import React, {useEffect} from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import registerServiceWorker from './registerServiceWorker';
import {BrowserRouter as Router, Switch, Route, withRouter, useHistory } from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css'
import firebase from './firebase';

const Root = () => {
    const history = useHistory();
    console.log(history);
    
    useEffect(()=>{
        firebase.auth().onAuthStateChanged(user => {
            if(user){
                const location = {
                    pathname: "/",
                }
                history.push(location);
            }
        })
    }, []);

    return ( 
        <Switch>
            <Route exact path="/" component = {App} />
            <Route path="/Login" component = {Login} />
            <Route path="/Register" component = {Register} />
        </Switch>
         );
}
 const RootWithAuth =  withRouter(Root);
export default Root;

ReactDOM.render(<Router><RootWithAuth /></Router>, document.getElementById('root'));
registerServiceWorker();
