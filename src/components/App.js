import React, {useRef} from 'react';
import './App.css';
import {Grid} from 'semantic-ui-react';
import ColorPanel from './ColorPanel/ColorPanel';
import SidePanel from './SidePanel/SidePanel';
import Messages from './Messages/Messages';
import MetaPanel from './MetaPanel/MetaPanel';
import {useSelector} from 'react-redux';

const App = () => {
  const colors = useSelector(store=>store.colors);
  return (  
    <Grid columns ='equal' className='app' style={{background: colors.secondaryColor}}>
      <ColorPanel />
      <SidePanel />
      <Grid.Column style={{marginLeft: 320}}>
        <Messages />
      </Grid.Column>
      <Grid.Column width={4}>
        <MetaPanel />
      </Grid.Column>
    </Grid>
  );
}
 
export default App;
