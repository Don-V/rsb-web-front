import React from 'react';
import { Link } from 'react-router-dom';

import { getGameById } from '../../lib/game'

import RSBButton from '../ui/RSBButton';
import Avatar from '../ui/Avatar';

const UserRequests = ({ requests, onReview }) => {
    return (
        <div>
            {
                requests.map((request, i) => {
                    const { username, firstname, lastname, avatar, sport, time, } = request;

                    return (
                        <div key={i} className="populate-requests row">
                            <Link to={`/user/${username}`} key={i} >
                                <div className="col-sm-4 col-sm-pull">
                                    <Avatar avatar={avatar} alt='profile-pic' className='profile-pic-xs' />
                                </div>
                                <div className="col-sm-4">
                                    <span>{username}</span><br />
                                    <span>{firstname} {lastname}</span><br />
                                    {sport && <span><i>{sport}</i></span>}<br />
                                    <span>{time}</span>
                                </div>
                            </Link>
                            <ReviewRequest accept onClick={onReview} username={username} />
                            <ReviewRequest onClick={onReview} username={username} />
                        </div>
                    );
                })
            }
        </div>
    );

}

export const GameRequest = ({ requests, onReview }) => {

    async function getGames(games) {
        for (let req of requests) {
            console.log(req.game);
            const id = req.game
            const curGame = await getGameById({ value: id });
            console.log(curGame);
            games.push(curGame.data);
        }
    }

    let gameArray = [];

    getGames(gameArray);
    console.log(gameArray);

    return (<div>
        {
            requests.map((request, i) => {
                const { from, game } = request;
                console.log(game);

                return (
                    <div key={i} className="populate-requests row">
                        {/*TODO: Display better information*/}
                        <div className="col-sm-4">
                            <span>From: {from}</span><br />
                        </div>
                        <ReviewRequest accept onClick={onReview} id={game} />
                        <ReviewRequest onClick={onReview} id={game} />
                    </div>
                );
            })
        }
    </div>)
}

const ReviewRequest = ({ accept = false, onClick, username, id }) => {
    const { glyph, className } = accept ?
        { glyph: 'ok', className: 'accept' } :
        { glyph: 'remove', className: 'decline' };

    return (
        <div className="col-sm-2">
            <RSBButton
                glyphicons={`glyphicon glyphicon-${glyph}`}
                className={className}
                onClickFunction={() => onClick({ accept, username, id })}
            />
        </div>
    );
}

export default UserRequests;