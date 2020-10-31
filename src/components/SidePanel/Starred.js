import React, {useState} from 'react';
import {Menu, Icon} from 'semantic-ui-react';
import {useDispatch} from 'react-redux';
import {setCurrentChannel} from "../../actions";

const Starred = () => {
    const dispatch = useDispatch();
    const [starredChannels, setStarredChannels] = useState([]);
    const [activeChannel, setActiveChannel] = useState('');


    const handleChannelChange = (channel) => {
        dispatch(setCurrentChannel(channel, false))
        setActiveChannel(channel.id);
    }

    const displayChannels = (channels) => {
        if(channels.length>0)
        {
            return starredChannels.map(channel => (
                    <Menu.Item
                    key={channel.id}
                    onClick = {()=>{handleChannelChange(channel)}}
                    name = {channel.name}
                    style = {{opacity: '0.7'}}
                    active = {channel.id === activeChannel}
                    >   
                        # {channel.name}
                    </Menu.Item>)
            )
        }
    }

    return (
            <Menu.Menu className = "menu">
                <Menu.Item>
                    <span>
                        <Icon name="star"/> STARRED
                    </span>
                    ({starredChannels.length})
                    
                </Menu.Item>
                {displayChannels(starredChannels)} 
            </Menu.Menu>
    )
    }
export default Starred;