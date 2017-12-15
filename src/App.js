import React, { Component } from "react";
import logo from "./logo.svg";
import "./css/App.css";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import AppBar from "material-ui/AppBar";
import RaisedButton from "material-ui/RaisedButton";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Drawer from "material-ui/Drawer";
import MenuItem from "material-ui/MenuItem";

const style = {
  margin: 12
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

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
          <AppBar
            title="Voting App"
            onLeftIconButtonClick={this.handleToggle}
            iconElementRight={
              <RaisedButton
                label="Log in with Twitter"
                secondary={true}
                style={style}
              />
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
            <MenuItem>
              <Link to="/about" onClick={this.handleClose}>
                About
              </Link>
            </MenuItem>
            <MenuItem>
              <Link to="/topics" onClick={this.handleClose}>
                Topics
              </Link>
            </MenuItem>
          </Drawer>
          <Route exact="exact" path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/topics" component={Topics} />
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
const Topic = ({ match }) => (
  <div>
    <h3>{match.params.topicId}</h3>
  </div>
);
const Topics = ({ match }) => (
  <div>
    <h2>Topics</h2>
    <ul>
      <li>
        <Link to={`${match.url}/rendering`}>Rendering with React</Link>
      </li>
      <li>
        <Link to={`${match.url}/components`}>Components</Link>
      </li>
      <li>
        <Link to={`${match.url}/props-v-state`}>Props v. State</Link>
      </li>
    </ul>

    <Route path={`${match.url}/:topicId`} component={Topic} />
    <Route
      exact="exact"
      path={match.url}
      render={() => <h3>Please select a topic.</h3>}
    />
  </div>
);

export default App;
