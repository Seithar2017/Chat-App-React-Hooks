import React, {usteState} from 'react';
import {Progress, Transition } from 'semantic-ui-react';
const ProgressBar = ({uploadState, percentUploaded}) => {

    

    return (
        <Transition visible={uploadState==='uploading'} animation='swing down' duration={1000}>
            <Progress
            className = "progress__bar"
            percent = {percentUploaded}
            progress
            indicating
            size="medium"
            inverted
            />
         </Transition>
    )
}
 
export default ProgressBar;