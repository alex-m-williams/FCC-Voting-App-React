import React, { Component } from "react";
import Piechart from "./Piechart";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import RaisedButton from "material-ui/RaisedButton";
import TextField from "material-ui/TextField";

import "../css/Input.css";

class Poll extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pollName: "",
      pollID: "",
      voteOptions: [],
      votes: [],
      questionCreatorOpen: false
    };
  }

  openQuestionCreator = () => {
    this.setState({
      questionCreatorOpen: !this.state.questionCreatorOpen
    });
  };

  componentWillUnmount() {
    this.props.closePoll();
  }

  addQuestionToPoll = () => {
    //this.props.pollID
  };

  fetchQuestions = async () => {
    const response = await fetch(
      `/api/listquestions?questionid=${this.props.pollID}`,
      {
        headers: new Headers({
          "Content-Type": "application/json"
        })
      }
    );

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

  render() {
    let data = this.state.votes.map((vote, i) => {
      return { value: vote, label: this.state.voteOptions[i] };
    });

    let opac = this.state.questionCreatorOpen ? 0.3 : 1;
    let pollStyle = {
      height: "85vh",
      opacity: opac
    };
    return (
      <React.Fragment>
        <div style={pollStyle}>
          <Route
            render={({ history }) => (
              <RaisedButton
                label="Go Back"
                secondary={true}
                type="button"
                onClick={() => {
                  history.push("/polls");
                  this.props.closePoll();
                }}
              />
            )}
          />
          <h3>{this.props.match.params.PollId}</h3>
          {this.state.voteOptions.length !== 0 ? (
            <svg xmlns="http://www.w3.org/2000/svg">
              <Piechart
                x={100}
                y={100}
                outerRadius={100}
                innerRadius={50}
                data={data}
              />
            </svg>
          ) : (
            <div>This poll doesn't have any votes yet</div>
          )}
          <RaisedButton
            label="Add Vote"
            secondary={true}
            type="button"
            onClick={this.openQuestionCreator}
          />
        </div>
        <div>
          {this.state.questionCreatorOpen === true ? (
            <div className="question-popout">
              <form
                action="/api/addpollQuestion"
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
                  label="Add Vote"
                  secondary={true}
                  onClick={this.openQuestionCreator}
                />
              </form>
            </div>
          ) : (
            <div />
          )}
        </div>
      </React.Fragment>
    );
  }
}

export default Poll;
