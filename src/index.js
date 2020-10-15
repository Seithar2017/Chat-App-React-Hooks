import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import registerServiceWorker from './registerServiceWorker';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css'

const Root = () => {
    return ( <Router>
        <Switch>
            <Route exact path="/" component = {App} />
            <Route path="/Login" component = {Login} />
            <Route path="/Register" component = {Register} />

        </Switch>
    </Router> );
}
 
export default Root;

ReactDOM.render(<Root/>, document.getElementById('root'));
registerServiceWorker();
