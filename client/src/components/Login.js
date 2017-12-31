import React, { Component } from "react";
import "../css/Login.css";

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

  render() {
    let expandedStyle = {
      display: "block",
      position: "absolute",
      top: "50%",
      backgroundColor: "lightgray",
      width: "150px",
      height: "60px",
      animation: "slide 1s forwards",
      zIndex: "999"
    };
    let closedStyle = {
      display: "none"
    };
    let loginStyle = {
      position: "relative",
      top: "-25%"
    };

    let userInfo = this.props.profileResponse;
    let displayName = userInfo.displayName;
    let profilePicture = userInfo.photos[0].value;
    return (
      <div>
        <img src={profilePicture} />
        <span style={loginStyle} onClick={this.toggleExpandedState}>
          {displayName}
        </span>
        <div
          style={this.state.expanded === true ? expandedStyle : closedStyle}
          className="login"
        />
      </div>
    );
  }
}

export default Login;
