import React, { Component } from "react";
import logo from "./logo.svg";
import "./css/App.css";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import AppBar from "material-ui/AppBar";
import RaisedButton from "material-ui/RaisedButton";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Drawer from "material-ui/Drawer";
import MenuItem from "material-ui/MenuItem";
import Paper from "material-ui/Paper";
import Piechart from "./components/Piechart";

const style = {
  margin: 12
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      authed: false
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
              <Link to="/polls" onClick={this.handleClose}>
                Polls
              </Link>
            </MenuItem>
          </Drawer>
          <Route exact path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route
            path="/polls"
            render={props => <Polls authed={this.state.authed} {...props} />}
          />
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

class Poll extends Component {
  constructor(props) {
    super(props);
    this.state = {
      voteOptions: ["a", "b", "c", "d"],
      votes: [3, 5, 45, 55]
    };
  }

  componentWillMount() {}

  render() {
    let data = this.state.votes.map((vote, i) => {
      return { value: vote, label: this.state.voteOptions[i] };
    });
    return (
      <div>
        <Route
          render={({ history }) => (
            <button
              type="button"
              onClick={() => {
                history.push("/polls");
                this.props.closePoll();
              }}
            >
              Click Me!
            </button>
          )}
        />
        <h3>{this.props.match.params.PollId}</h3>
        <svg xmlns="http://www.w3.org/2000/svg">
          <Piechart
            x={100}
            y={100}
            outerRadius={100}
            innerRadius={50}
            data={data}
          />
        </svg>
      </div>
    );
  }
}

class Polls extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pollOpen: false,
      pollIdentifiers: ["rendering", "components", "props-v-state"]
    };
  }

  openPoll = () => {
    this.setState({
      pollOpen: true
    });
  };

  closePoll = () => {
    this.setState({
      pollOpen: false
    });
  };

  render() {
    let polls = this.state.pollIdentifiers.map(poll => {
      return (
        <li>
          <Link to={`${this.props.match.url}/${poll}`} onClick={this.openPoll}>
            {poll}
          </Link>
        </li>
      );
    });

    return (
      <React.Fragment>
        {this.state.pollOpen === false ? (
          <Paper>
            <h2>
              Polls Select a poll to view results
              {this.props.authed == true ? (
                "and log in to create a poll"
              ) : (
                <RaisedButton
                  label="Make a New Poll"
                  secondary={true}
                  style={style}
                />
              )}
            </h2>
            <ul>{polls}</ul>
          </Paper>
        ) : (
          <React.Fragment>
            <Route
              path={`${this.props.match.url}/:PollId`}
              render={props => <Poll closePoll={this.closePoll} {...props} />}
            />
            <Route
              exact="exact"
              path={this.props.match.url}
              render={() => <h3>Please select a topic. </h3>}
            />
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

export default App;
