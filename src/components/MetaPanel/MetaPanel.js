import React, {useState} from 'react';  
import {Segment, Accordion, Header, Icon, Image, List} from 'semantic-ui-react';
import {useSelector} from 'react-redux';
const MetaPanel = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const isPrivateChannel = useSelector(store => store.channel.isPrivateChannel);
    const currentChannel = useSelector(store => store.channel.currentChannel);
    const userPosts = useSelector(store => store.channel.userPosts);
    const handleSetActiveIndex = (event, titleProps) => {
        const {index} = titleProps;
        const newIndex = activeIndex === index ? -1 : index;
        setActiveIndex(newIndex);
    }

    const displayTopPosters = (userPosts) => {
        const posts = Object.entries(userPosts);
        const sortedPosts = posts.sort((a, b) => b[1].count - a[1].count);
        return sortedPosts.map(([key, val], i) => {
                
            return (
                <List.Item
                  key={i}
                >
                    <Image avatar src={val.avatar} />
                    <List.Content>
                        <List.Header as="a">{key}</List.Header>
                        <List.Description>{val.count} {val.count > 1 ? 'posts' : 'post'}</List.Description>
                    </List.Content>
                </List.Item>
            )}).slice(0, 5);
    }
    return !isPrivateChannel && ( 
        
        <Segment loading = {!currentChannel}>

            {/* Channel name */}
            <Header as = 'h3' attached="top">
                About # {currentChannel && currentChannel.name}
            </Header>

            <Accordion styled attached = "true">

                {/* Channel Details */}
                <Accordion.Title
                    active = {activeIndex === 0}
                    index = {0}
                    onClick = {handleSetActiveIndex}
                >
                    <Icon name = 'dropdown'/>
                    <Icon name = "info"/>
                    Channel Details
                </Accordion.Title>
                <Accordion.Content active = {activeIndex === 0}>
                    {currentChannel && currentChannel.details}
                </Accordion.Content>

                {/* Channel Posters*/}
                <Accordion.Title
                    active = {activeIndex === 1}
                    index = {1}
                    onClick = {handleSetActiveIndex}
                >
                    <Icon name = 'dropdown'/>
                    <Icon name = "user circle"/>
                </Accordion.Title>
                <Accordion.Content active = {activeIndex === 1}>
                    <List>
                    {userPosts && displayTopPosters(userPosts)}
                    </List>
                </Accordion.Content>

                {/* Channel Created By*/}
                <Accordion.Title
                    active = {activeIndex === 2}
                    index = {2}
                    onClick = {handleSetActiveIndex}
                >
                    <Icon name = 'dropdown'/>
                    <Icon name = "pencil alternate"/>
                    Created By
                </Accordion.Title>
                <Accordion.Content active = {activeIndex === 2}>
                    <Header as="h3">
                        <Image circular src={currentChannel && currentChannel.createdBy.avatar}/>
                         {currentChannel && currentChannel.createdBy.name}
                    </Header>
                </Accordion.Content>
            </Accordion>
        </Segment>
     );
}
 
export default MetaPanel;