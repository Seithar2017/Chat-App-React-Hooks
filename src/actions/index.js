import * as actionTypes from './types';

// User Actions
export const setUser = user => {
    return{
        type: actionTypes.SET_USER,
        payload:{
            currentUser: user
        }
    }
}

export const clearUser = () => {
    return{
        type: actionTypes.CLEAR_USER,
    }
}

// Channel Actions
export const setCurrentChannel = (channel, isPrivateChannel) => {
    return{
        type: actionTypes.SET_CURRENT_CHANNEL,
        payload: {
            currentChannel: channel,
            isPrivateChannel,
        }
    }
}

export const setPrivateChannel = (isPrivateChannel, currentChannel) =>{
    return{
        type: actionTypes.SET_PRIVATE_CHANNEL,
        payload: {
            isPrivateChannel,
            currentChannel,
        }
    }
}