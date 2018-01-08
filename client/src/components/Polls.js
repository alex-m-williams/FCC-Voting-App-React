import React, { Component } from "react";
import ReactDOM from "react-dom";
import Poll from "./Poll";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Paper from "material-ui/Paper";
import RaisedButton from "material-ui/RaisedButton";
import TextField from "material-ui/TextField";
import { Redirect } from "react-router";

const style = {
  margin: 12
};

class Polls extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pollOpen: false,
      pollIdentifiers: [],
      pollCreatorOpen: false,
      pollName: ""
    };
  }

  componentDidMount() {
    this.fetchPolls()
      .then()
      .catch(err => console.log(err));
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

  openPollCreator = () => {
    this.setState({
      pollCreatorOpen: !this.state.pollCreatorOpen
    });
  };

  handlePollNameChange = event => {
    this.setState({ pollName: event.target.value });
  };

  onSubmit = e => {
    e.preventDefault();
    // Fetch form values.

    // Send the form data.
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", `/api/addpoll?pollName=${this.state.pollName}`, true);
    xmlhttp.setRequestHeader(
      "Content-type",
      "application/x-www-form-urlencoded"
    );
    xmlhttp.send();
    this.openPollCreator();
  };

  fetchPolls = async () => {
    const response = await fetch("/api/listpolls", {
      headers: new Headers({
        "Content-Type": "application/json"
      })
    });

    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    console.log("hi");
    let pollNames = body.polls.map(poll => {
      return poll.pollName;
    });
    console.log(pollNames);
    this.setState({
      pollIdentifiers: pollNames
    });
    return body;
  };

  render() {
    let opac = this.state.pollCreatorOpen ? 0.3 : 1;
    let pollsStyle = {
      height: "85vh",
      opacity: opac
    };
    let pollCreatorStyle = {
      position: "absolute",
      width: "50%",
      opacity: "1",
      top: "20%",
      margin: "auto",
      textAlign: "center",
      left: "25%",
      backgroundColor: "lightgray",
      paddingTop: "5%",
      paddingBottom: "5%"
    };
    const { from } = this.props.location.state || "/";
    const { fireRedirect } = this.state;

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
        <React.Fragment>
          <div style={pollsStyle}>
            {this.state.pollOpen === false ? (
              <Paper>
                <h2>
                  Polls Select a poll to view results
                  {this.props.authed == false ? (
                    "and log in to create a poll"
                  ) : (
                    <RaisedButton
                      label="Make a New Poll"
                      secondary={true}
                      style={style}
                      onClick={this.openPollCreator}
                    />
                  )}
                </h2>
                <ul>{polls}</ul>
              </Paper>
            ) : (
              <React.Fragment>
                <Route
                  path={`${this.props.match.url}/:PollId`}
                  render={props => (
                    <Poll closePoll={this.closePoll} {...props} />
                  )}
                />
                <Route
                  exact="exact"
                  path={this.props.match.url}
                  render={() => <h3>Please select a topic. </h3>}
                />
              </React.Fragment>
            )}
          </div>
        </React.Fragment>
        <React.Fragment>
          {this.state.pollCreatorOpen === true ? (
            <div style={pollCreatorStyle}>
              <form
                action="/api/addpoll"
                method="POST"
                onSubmit={this.onSubmit}
              >
                <TextField
                  value={this.state.pollName}
                  type="text"
                  name="title"
                  hintText="Poll Name"
                  onChange={this.handlePollNameChange}
                />
                <RaisedButton
                  type="submit"
                  label="Make a New Poll"
                  secondary={true}
                />
              </form>
            </div>
          ) : (
            <div />
          )}
        </React.Fragment>
      </React.Fragment>
    );
  }
}

export default Polls;
