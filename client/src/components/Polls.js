import React, { Component } from "react";
import Poll from "./Poll";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Paper from "material-ui/Paper";
import RaisedButton from "material-ui/RaisedButton";
import TextField from "material-ui/TextField";

import "../css/Input.css";

const style = {
  margin: 12
};

class Polls extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pollOpen: false,
      openPollID: "",
      pollIdentifiers: [],
      pollCreatorOpen: false,
      pollName: ""
    };
  }

  componentDidMount() {
    if (this.props.filterByUser) {
      this.fetchPollsByUser()
        .then()
        .catch(err => console.log(err));
    } else {
      this.fetchPolls()
        .then()
        .catch(err => console.log(err));
    }
  }

  openPoll = id => {
    this.setState({
      pollOpen: true,
      openPollID: id
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

    this.addPoll()
      .then()
      .catch(err => console.log(err));
    this.openPollCreator();
    if (this.props.filterByUser) {
      this.fetchPollsByUser()
        .then()
        .catch(err => console.log(err));
    } else {
      this.fetchPolls()
        .then()
        .catch(err => console.log(err));
    }
  };

  addPoll = async () => {
    const response = await fetch(
      `/api/addpoll?pollName=${this.state.pollName}`,
      {
        headers: new Headers({
          "Content-Type": "application/x-www-form-urlencoded"
        }),
        credentials: "include",
        method: "post"
      }
    );

    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  fetchPolls = async () => {
    const response = await fetch("/api/listpolls", {
      headers: new Headers({
        "Content-Type": "application/json"
      })
    });

    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);
    let pollIDs = [];
    body.polls.forEach(poll => {
      pollIDs.push(poll);
    });

    this.setState({
      pollIdentifiers: pollIDs
    });
    return body;
  };

  fetchPollsByUser = async () => {
    const response = await fetch("/api/user/listpolls", {
      credentials: "include",
      headers: new Headers({
        "Content-Type": "application/json"
      })
    });
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);
    if (body.success) {
      let pollIDs = [];
      body.polls.forEach(poll => {
        pollIDs.push(poll);
      });

      this.setState({
        pollIdentifiers: pollIDs
      });
    }
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

    let polls = this.state.pollIdentifiers.map((poll, i) => {
      return (
        <li key={i}>
          <Link
            to={`${this.props.match.url}/${poll.pollName}`}
            onClick={() => this.openPoll(poll.id)}
          >
            {poll.pollName}
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
                  {this.props.authed === false ? (
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
                    <Poll
                      filterByUser={this.props.filterByUser}
                      closePoll={this.closePoll}
                      pollID={this.state.openPollID}
                      {...props}
                    />
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
