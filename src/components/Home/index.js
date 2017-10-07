import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import HamburgerMenu from '../HamburgerMenu';
import views from './views';


class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showMenu: false,
    }

    this.toggeleMenu = this.toggeleMenu.bind(this);
  }

  toggeleMenu() {
    this.setState({
      showMenu: !this.state.showMenu,
    })
  }

  render() {
    return (
      <div>
        <HamburgerMenu views={views} onClick={this.toggeleMenu} menu={this.state.showMenu} />
        <div className='display'>
          <Switch>
            {views.map((view, i) => (
              < Route exact key={`${view.name}${i}`} path={'/' + view.path} component={view.component} />
            ))}
            {/* Default route when url is '/' */}
            <Route component={this.props.default || (views.length > 0 && views[0].component)} />
          </Switch>
        </div>
      </div>
    );
  }
}

//{/* <Route exact key={`${view.name}${i}`} path={'/' + view.path} render={props => <view.component {...props} />} /> */}
// Returns a regex representing all the routes
// An example is /(map|game|friends|)/
// The reason for the last '|' is to match '/'
// which is when there's only a slash
export const appRoutes = (() => {
  let path = '/(';
  for (let route of views) {
    path += route.path + '|'
  }
  path += ')/';
  return path;
})();

export default Home;