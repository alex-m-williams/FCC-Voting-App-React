import React, { Component } from "react";
import Poll from "./Poll";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Paper from "material-ui/Paper";
import RaisedButton from "material-ui/RaisedButton";
import TextField from "material-ui/TextField";

const style = {
  margin: 12
};

class Polls extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pollOpen: false,
      pollIdentifiers: ["rendering", "components", "props-v-state"],
      pollCreatorOpen: false
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

  openPollCreator = () => {
    this.setState({
      pollCreatorOpen: true
    });
  };

  closePollCreator = () => {
    this.setState({
      pollCreatorOpen: false
    });
  };

  render() {
    let opac = this.state.pollCreatorOpen ? 0.3 : 1;
    let pollsStyle = {
      height: "85vh",
      opacity: opac
    };
    let pollCreatorStyle = {
      position: "absolute",
      height: "500px",
      width: "500px"
    };

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
        {this.state.pollCreatorOpen === true ? (
          <div>
            <form action="/api/addpoll" method="POST">
              <TextField type="text" name="title" hintText="Poll Name" />
              <RaisedButton label="Make a New Poll" secondary={true} />
            </form>
          </div>
        ) : (
          <div />
        )}
      </div>
    );
  }
}

export default Polls;
