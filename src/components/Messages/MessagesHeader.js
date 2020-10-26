import React from 'react';
import {Header, Segment, Input, Icon} from 'semantic-ui-react';

const MessagesHeader = ({channelName, numberOfUniqueUsers, handleChange, search, searchLoading}) => {
    return ( 
            <Segment clearing>
                {/* Channel Title */}
                <Header fluid='true' as ='h2' floated ="left" style ={{ marginBottom: 0}}>
                    <span>
                    {channelName}
                    <Icon name = {"star outline"} color="black"/>
                    </span>
                <Header.Subheader> {numberOfUniqueUsers} {numberOfUniqueUsers === 1 ? 'user' : 'users' } </Header.Subheader>
                </Header>

                    {/* Channel Search Input  */}
                <Header floated = "right">
                    <Input
                    loading={searchLoading}
                    onChange = {handleChange}
                    size="mini"
                    icon="search"
                    name="searchTerm"
                    value={search}
                    placeholder="Search Messages"
                    />
                </Header>
            </Segment>
     );
}
 
export default MessagesHeader;