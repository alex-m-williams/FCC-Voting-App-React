import React, { Component } from "react";
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
      pollIdentifiers: ["rendering", "components", "props-v-state"],
      pollCreatorOpen: false,
      fireRedirect: false
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
      pollCreatorOpen: !this.state.pollCreatorOpen
    });
  };

  sendFormData = () => {
    // Fetch form values.
    var formData = {
      budget: React.findDOMNode(this.refs.budget).value,
      company: React.findDOMNode(this.refs.company).value,
      email: React.findDOMNode(this.refs.email).value
    };

    // Send the form data.
    var xmlhttp = new XMLHttpRequest();
    var _this = this;
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState === 4) {
        var response = JSON.parse(xmlhttp.responseText);
        if (xmlhttp.status === 200 && response.status === "OK") {
          _this.setState({
            type: "success",
            message:
              "We have received your message and will get in touch shortly. Thanks!"
          });
        } else {
          _this.setState({
            type: "danger",
            message:
              "Sorry, there has been an error. Please try again later or send us an email at info@example.com."
          });
        }
      }
    };
    xmlhttp.open("POST", "send", true);
    xmlhttp.setRequestHeader(
      "Content-type",
      "application/x-www-form-urlencoded"
    );
    xmlhttp.send(this.requestBuildQueryString(formData));
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
              <form action="/api/addpoll" method="POST">
                <TextField
                  ref="pollName"
                  type="text"
                  name="title"
                  hintText="Poll Name"
                />
                <RaisedButton
                  type="submit"
                  label="Make a New Poll"
                  secondary={true}
                />
              </form>
              {fireRedirect && <Redirect to={from || "/polls"} />}
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
