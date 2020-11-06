import React from 'react';
import {Menu} from 'semantic-ui-react';
import UserPanel from "./UserPanel";
import Channels from "./Channels";
import DirectMessages from "./DirectMessages"
import Starred from './Starred';
import {useSelector} from 'react-redux';

const SidePanel = () => {
  const colors = useSelector(store=>store.colors);
    return (
        <Menu
        size ='large'
        inverted
        fixed ='left'
        vertical
        style={{background: colors.primaryColor, fontSize:'1.2rem'}}
        >

          <UserPanel />
          <Starred />
          <Channels />
          <DirectMessages />

        </Menu>
      );
}
 
export default SidePanel;