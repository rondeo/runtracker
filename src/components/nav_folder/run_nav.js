import React, { Component } from 'react';
import './nav.scss';
import { NavLink } from 'react-router-dom';
import Logout from '../account/logout';

class RunHeader extends Component {
  constructor(props) {
    super(props);
    // this.state = {
    //   clicked: false
    // }
  }
  // handleClick = () => {
  //   this.setState({
  //     clicked: true
  //   })
  // }
  render() {
    return (
      <div className="headerContainer">
        <div className="mapHeaderContainer">
          <div className="navLogo">Run-Tracker</div>
          <NavLink className="nav-link-home" exact to="/">
            <span className="oi" data-glyph="home"></span>
          </NavLink>
          <NavLink className="nav-link-aboutus" to="/aboutus">
            <span className="oi" data-glyph="people"></span>
          </NavLink>
          <NavLink className="nav-link-logout" to="/account/logout">
            <span className="oi" data-glyph="account-logout"></span>
          </NavLink>
        </div>
        <nav className="navbar navbar-custom">
          <ul className="nav navbar-nav">
            <li><NavLink className="nav-link" activeClassName="active selected" exact to="/">Runs</NavLink></li>
            <li><NavLink className="nav-link" activeClassName="active selected" to="/totalstats">Total Stats</NavLink></li>
            <li><NavLink className="nav-link" activeClassName="active selected" to="/table">Activity Log</NavLink></li>
          </ul>
        </nav>
      </div>
    )
  }
}

export default RunHeader;
