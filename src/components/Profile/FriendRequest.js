import React from 'react';

import UserRequests from './UserRequests';


export default ({ friendRequests, handleClick, removeRequest }) => {
    function handleOnClick(e) {
        handleClick(e);
    }

    const requests = friendRequests && friendRequests.length > 0 ?
        <UserRequests requests={friendRequests} handleClick={handleOnClick} /> :
        <span>No friend requests</span>;
    return (
        <div className="col-sm-6 panel panel-default">
            <div className="panel-heading-rsb">
                <h2>Friend Requests</h2>
            </div>
            <div className="scroll-info panel-body">
                {requests}
            </div>
        </div>
    );
}