import React, { Component } from 'react';
import { Link, BrowserRouter as Router } from 'react-router-dom';
import Avatar from '../ui/Avatar';

class UserDisplay extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const user = this.props.profileInfo;
        if (user) {
            return (
                <div>
                    <Link to={`/user`} >
                        <div className="text-center">
                            <Avatar avatar={user.avatar} alt='' className='rsb-user-picture' />
                        </div>
                        <div className="text-center">
                            <h1 className='rsb-menu-username'>{user.firstname + ' ' + user.lastname + ' @' + user.username}</h1>
                        </div>
                    </Link>
                </div >
            );
        }
        return null;

    }
}


export default UserDisplay;