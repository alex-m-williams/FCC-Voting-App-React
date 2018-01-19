import React, { Component } from "react";
import "../css/Login.css";
import RaisedButton from "material-ui/RaisedButton";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false
    };
  }

  toggleExpandedState = () => {
    this.setState({
      expanded: !this.state.expanded
    });
  };

  logOut = () => {
    window.location = "/api/logout";
  };

  render() {
    const expandedStyle = {
      display: "block",
      top: "50%"
    };

    const style = {
      margin: 12
    };

    const closedStyle = {};

    let userInfo = this.props.profileResponse;
    console.log(userInfo);
    let displayName = userInfo.displayName;
    let profilePicture = userInfo.photos[0].value;
    return (
      <React.Fragment>
        <div className="login-root">
          <img src={profilePicture} alt="twitter profile" />
          <span onClick={this.toggleExpandedState}>{displayName}</span>
          <div
            className="login-slide"
            style={this.state.expanded === true ? expandedStyle : closedStyle}
          >
            <RaisedButton
              label="Logout"
              secondary={true}
              style={style}
              onClick={this.logOut}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Login;
