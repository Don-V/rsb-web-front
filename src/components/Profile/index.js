import React, { Component } from 'react';

import user, { getLoggedInUserName, uploadProfilePhoto, reviewFriendRequest, FriendStatus, getGameHistory } from '../../lib/user';
import { reviewGameInvite } from '../../lib/game';
import constraints from '../../lib/constraints';
import subscription, { subscriptions } from '../../lib/subscriptions';
import { unsafeCopy } from "../../lib/utils";
import { showSuccess } from '../../mixins/notifiable';
import { Notifiable } from '../../mixins';

import Loader, { LoaderPage } from '../ui/Loader';
import FriendRequest from './FriendRequest';
import GameInvites from './GameInvites';
import GameHistory from './GameHistory';
import Heading from './Heading';
import FriendsList from './FriendsList';
import UserAction from './UserAction';

import './style.css';

class Profile extends Notifiable(Component) {
    constructor(props) {
        super(props);

        this.state = {
            userActionReady: true,
        }

        this.subscriber = subscription.subscriber;

        this.handleUserActionClick = this.handleUserActionClick.bind(this);
        this.handleUserActionChange = this.handleUserActionChange.bind(this);
        this.getUserInfo = this.getUserInfo.bind(this);
        this.handleChangePhoto = this.handleChangePhoto.bind(this);
        this.handleFriendRequest = this.handleFriendRequest.bind(this);
        this.handleGameInvite = this.handleGameInvite.bind(this);
        this.displaySuccess = this.displaySuccess.bind(this);
        this.updateFriendStatus = this.updateFriendStatus.bind(this);
        this.updateFriendRequests = this.updateFriendRequests.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.match.params.username === nextProps.match.params.username) return;
        this.getUserInfo(nextProps.match.params);
    }

    async handleFriendRequest({ username, accept }) {
        const res = await reviewFriendRequest({ username, accept });
        if (res.error) {
            this.setState({ errorMessage: res.error });
            return;
        }

        this.displaySuccess();
    }

    async handleGameInvite({ username, accept, id }) {
        const res = await reviewGameInvite({ username, accept, id });
        if (res.error) {
            this.setState({ errorMessage: res.error });
            return;
        }
        this.displaySuccess();
    }

    componentDidMount() {
        this.getUserInfo(this.props.match.params);
        this.subscriber.multiple([
            subscription.subscribe({
                name: subscriptions.RECEIVED_FRIEND_INVITE,
                action: this.updateFriendStatus(FriendStatus.RECEIVED_R)
            }),
            subscription.subscribe({
                name: subscriptions.RECEIVED_FRIEND_INVITE,
                action: this.updateFriendRequests()
            }),
            subscription.subscribe({
                name: subscriptions.CANCELLED_FRIEND_INVITE,
                action: this.updateFriendStatus(FriendStatus.NONE)
            }),
            subscription.subscribe({
                name: subscriptions.CANCELLED_FRIEND_INVITE,
                action: this.updateFriendRequests()
            }),
            subscription.subscribe({
                name: subscriptions.RESPONSE_FRIEND_INVITE,
                action: this.responseFriendInvite()
            }),
            subscription.subscribe({
                name: subscriptions.UNFRIEND_USER,
                action: this.unfriendUser()
            }),
            subscription.subscribe({
                name: subscriptions.RECEIVED_GAME_INVITE,
                action: this.updateGameRequests()
            }),
        ]);
    }

    async handleChangePhoto(evt) {
        const file = evt.target.files.length > 0 && evt.target.files[0];
        if (!file) return;

        if (file.size > constraints.MAX_FILE_SIZE) {
            this.setState({ errorMessage: `The file size must be under ${constraints.MAX_FILE_SIZE / (1024 * 1024)} MB` });
            return;
        }

        const name = file.name;
        if (!name.endsWith('.png') && !name.endsWith('.jpg') && !name.endsWith('.jpeg')) {
            this.setState({ errorMessage: 'The image must be a .png, .jpg or .jpeg' });
            return;
        }

        const res = await uploadProfilePhoto(file);
        if (res.error) {
            this.setState({ errorMessage: res.error });
            return;
        }

        this.displaySuccess({ message: 'Your profile picture was updated successfully' })
    }

    handleUserActionClick(wasClicked) {
        if (wasClicked) {
            this.setState({ userActionReady: false });
        }
    }

    async handleUserActionChange(clickResponse) {
        if (!clickResponse) return;

        if (clickResponse.error) {
            this.setState({ errorMessage: clickResponse.error });
            return;
        }

        this.displaySuccess();
    }

    async getUserInfo({ username = getLoggedInUserName() }) {
        var userInfo = await user({ username, populate: 1 });

        if (userInfo.error) {
            this.setState({ errorMessage: userInfo.error });
            return;
        }

        const gameHistory = await getGameHistory({ username });
        if (gameHistory.error) {
            this.setState({ errorMessage: gameHistory.error });
            return;
        }

        this.setState({
            user: userInfo,
            friends: userInfo.friends || [],
            gameHistory: gameHistory,
            errorMessage: null,
            userActionReady: true,
        });
    }

    displaySuccess({ message = 'Success!' } = {}) {
        showSuccess(message);
        this.getUserInfo({ username: this.state.user.username });
    }

    responseFriendInvite() {
        return async (res) => {
            if (res.error || this.state.user.username !== res.to) return;

            if (!res.accept) {
                const _user = unsafeCopy(this.state.user);
                _user.friendStatus = FriendStatus.NONE;
                this.setState({ user: _user, userActionReady: true });
                return;
            }

            const username = res.to;
            const userInfo = await user({ username, populate: 1 });
            const _user = unsafeCopy(this.state.user);
            _user.friendStatus = FriendStatus.ARE_FRIENDS;
            this.setState({ friends: userInfo.friends, user: _user, userActionReady: true })
        }
    }

    unfriendUser() {
        return async (res) => {
            if (res.error) return;
            const username = this.state.user.username;
            const userInfo = await user({ username, populate: 1 });
            this.setState({ friends: userInfo.friends, userActionReady: true })
        }
    }

    updateFriendStatus(friendStatus) {
        return (res) => {
            if (res.error || this.state.user.username !== res.from) return;

            const _user = unsafeCopy(this.state.user);
            _user.friendStatus = friendStatus;

            this.setState({ user: _user, userActionReady: true });
        };
    }

    updateFriendRequests() {
        return async (res) => {
            const username = res.to;
            var userInfo = await user({ username, populate: 1 });
            this.setState({ user: userInfo })
        }
    }

    updateGameRequests() {
        return async (res) => {
            const username = res.to;
            var userInfo = await user({ username, populate: 1 });
            this.setState({ user: userInfo })
        }
    }

    componentWillUnmount() {
        this.subscriber.clearSubscriptions();
    }

    render() {
        if (!this.state || this.state.user == null) return <LoaderPage />;

        const { user, errorMessage, userActionReady } = this.state;
        const isMe = user.friendStatus === FriendStatus.IS_USER;
        return (
            <div className="panel col-xs-10 col-xs-offset-1">
                <Heading onImageChange={isMe && this.handleChangePhoto} {...user} errorMessage={errorMessage} />

                {(userActionReady &&
                    <UserAction status={user.friendStatus} onChange={this.handleUserActionChange} onClick={this.handleUserActionClick} username={user.username} />)
                    ||
                    <div className="text-center rsb-add-or-remove-btn rsb-profile-mini-loader">
                        <Loader thickness={3} width={43} height={43} />
                    </ div>
                }
                <div className="row">
                    <FriendsList {...this.state} />
                    <GameHistory games={this.state.gameHistory} username={user.username} />
                </div>
                {
                    isMe &&
                    <div className="row">
                        <FriendRequest {...user} onReview={this.handleFriendRequest} />
                        <GameInvites {...user} onReview={this.handleGameInvite} />
                    </div>
                }
            </div >
        );

    }
}

export default Profile;