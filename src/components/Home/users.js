import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import ViewUser from '../ViewUser';


class Users extends Component {
    constructor(props){
        super(props)

        this.displayUser = this.displayUser.bind(this);
        this.render = this.render.bind(this);
        
    }

    u = {
        Username: "VicityVic",
        Firstname: "Victor",
        Lastname: "Amupitan",
        PersonalRating: "2",
        TeamRating: "1002",
        Friends: [{}],
        Preferences: "Wut?"
    }


    displayUser() {
        return(
            <Switch>
                <Route path='/user/:username' 
                        render={(props) => (
                            <ViewUser {...props} userInfo={this.u}/> )} />
            </Switch>
        )
    }

    render() {
        return(
            this.displayUser()
        )
    }
}

export default Users;