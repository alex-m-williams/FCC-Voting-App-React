import React, { Component } from "react";
import "./css/App.css";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import AppBar from "material-ui/AppBar";
import RaisedButton from "material-ui/RaisedButton";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Drawer from "material-ui/Drawer";
import MenuItem from "material-ui/MenuItem";
import Polls from "./components/Polls";
import Login from "./components/Login";

const style = {
  margin: 12
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      authed: false,
      response: "",
      profileResponse: ""
    };
  }

  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ response: res.express }))
      .catch(err => console.log(err));
    this.loggedIn()
      .then()
      .catch(err => console.log(err));
  }

  callApi = async () => {
    const response = await fetch("/api/hello");
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  loggedIn = async () => {
    const response = await fetch("/api/profile", {
      credentials: "include",
      headers: new Headers({
        "Content-Type": "application/json"
      })
    });
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);
    if (body.success === true) {
      this.setState({
        authed: true,
        profileResponse: body.user.wholeprof
      });
    }

    return body;
  };

  handleToggle = () =>
    this.setState({
      open: !this.state.open
    });

  handleClose = () =>
    this.setState({
      open: false
    });

  render() {
    return (
      <Router>
        <MuiThemeProvider>
          <React.Fragment>
            <AppBar
              title={this.state.response}
              onLeftIconButtonClick={this.handleToggle}
              iconElementRight={
                this.state.authed === false ? (
                  <a href="/api/login/twitter">
                    <RaisedButton
                      label="Log in with Twitter"
                      secondary={true}
                      style={style}
                    />
                  </a>
                ) : (
                  <Login profileResponse={this.state.profileResponse} />
                )
              }
            />

            <Drawer
              docked={false}
              width={200}
              open={this.state.open}
              onRequestChange={open => this.setState({ open })}
            >
              <MenuItem>
                <Link to="/" onClick={this.handleClose}>
                  Home
                </Link>
              </MenuItem>
              {this.state.authed && (
                <MenuItem>
                  <Link to="/myPolls" onClick={this.handleClose}>
                    myPolls
                  </Link>
                </MenuItem>
              )}
              <MenuItem>
                <Link to="/polls" onClick={this.handleClose}>
                  Polls
                </Link>
              </MenuItem>
            </Drawer>
            <Route exact path="/" component={Home} />
            {this.state.authed && (
              <Route
                path="/myPolls"
                render={props => (
                  <Polls
                    filterByUser={true}
                    authed={this.state.authed}
                    {...props}
                  />
                )}
              />
            )}
            <Route
              path="/polls"
              render={props => (
                <Polls
                  filterByUser={false}
                  authed={this.state.authed}
                  {...props}
                />
              )}
            />
          </React.Fragment>
        </MuiThemeProvider>
      </Router>
    );
  }
}

const Home = () => (
  <div>
    <h2>Home</h2>
  </div>
);

const About = () => (
  <div>
    <h2>About</h2>
  </div>
);

export default App;
