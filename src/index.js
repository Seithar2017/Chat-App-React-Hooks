import React, {useEffect} from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import registerServiceWorker from './registerServiceWorker';
import {BrowserRouter as Router, Switch, Route, withRouter, useHistory } from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css'
import firebase from './firebase';

import {createStore} from 'redux';
import {Provider, useDispatch} from 'react-redux';
import {composeWithDevTools} from 'redux-devtools-extension'
import rootReducer from './reducers/';
import {setUser} from './actions';

const store = createStore(rootReducer, composeWithDevTools());
const Root = () => {
    
    const dispatch = useDispatch();
    const history = useHistory();
    
    useEffect(()=>{
        firebase.auth().onAuthStateChanged(user => {
            if(user){
                dispatch(setUser(user));
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

ReactDOM.render(
    (
        <Provider store={store}>
            <Router>
                <RootWithAuth />
            </Router>
        </Provider>
    ), document.getElementById('root')
);

registerServiceWorker();
