import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import RaisedButton from "material-ui/RaisedButton";
import TextField from "material-ui/TextField";
import FloatingActionButton from "material-ui/FloatingActionButton";
import ContentAdd from "material-ui/svg-icons/content/add";

import ReactHighcharts from "react-highcharts";
import ShareButton from "react-social-share-buttons";

import "../css/Input.css";

class Poll extends Component {
  constructor(props) {
    super(props);
    this.state = {
      voteOptions: [],
      votes: [],
      questionCreatorOpen: false,
      question: ""
    };
  }

  componentWillUnmount() {
    this.props.closePoll();
  }

  componentDidMount() {
    this.fetchQuestionsAndVotes()
      .then()
      .catch(err => console.log(err));
  }

  openQuestionCreator = () => {
    this.setState({
      questionCreatorOpen: !this.state.questionCreatorOpen
    });
  };

  handleQuestionChange = event => {
    this.setState({ question: event.target.value });
  };

  addQuestionToPoll = async () => {
    //this.props.pollID
    const response = await fetch(
      `/api/addquestion?pollid=${this.props.pollID}&question=${
        this.state.question
      }`,
      {
        method: "post"
      }
    );

    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  onSubmit = e => {
    e.preventDefault();

    this.addQuestionToPoll()
      .then()
      .catch(err => console.log(err));
    this.openQuestionCreator();
    this.fetchQuestionsAndVotes()
      .then()
      .catch(err => console.log(err));
  };

  addVoteToQuestion = async voteindex => {
    try {
      const response = await fetch(
        `/api/addvote?pollid=${this.props.pollID}&voteIndex=${voteindex}`,
        {
          method: "post"
        }
      );
      const body = await response.json();

      if (response.status !== 200) throw Error(body.message);

      return body;
    } catch (e) {
      this.setState({ err: e.message });
    }
  };

  fetchQuestionsAndVotes = async () => {
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

    this.setState({
      voteOptions: body.pollQuestions,
      votes: body.pollVotes
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

    let config = {
      chart: {
        type: "bar"
      },
      title: {
        text: "Questions and Current Votes"
      },
      xAxis: {
        categories: this.state.voteOptions,
        title: {
          text: null
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: "Votes",
          align: "high"
        },
        labels: {
          overflow: "justify"
        }
      },
      tooltip: {
        valueSuffix: " votes"
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true
          }
        }
      },
      legend: {
        layout: "vertical",
        align: "right",
        verticalAlign: "top",
        x: -40,
        y: 80,
        floating: true,
        borderWidth: 1,
        backgroundColor: "#FFFFFF",
        shadow: true
      },
      credits: {
        enabled: false
      },
      series: [
        {
          name: "Votes",
          data: this.state.votes
        }
      ]
    };

    //list poll questions
    let pollQuestions = this.state.voteOptions.map((question, i) => {
      return (
        <li key={i}>
          {question}{" "}
          <FloatingActionButton
            mini={true}
            secondary={true}
            onClick={() => {
              this.addVoteToQuestion(i);
              this.fetchQuestionsAndVotes();
            }}
          >
            <ContentAdd />
          </FloatingActionButton>
        </li>
      );
    });
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
            <React.Fragment>
              <ul style={{ display: "inline-block" }}>{pollQuestions}</ul>
              <div style={{ display: "inline-block" }}>
                <ReactHighcharts config={config} />
              </div>
            </React.Fragment>
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
              <form method="POST" onSubmit={this.onSubmit}>
                <TextField
                  value={this.state.question}
                  type="text"
                  name="title"
                  hintText="Poll Name"
                  onChange={this.handleQuestionChange}
                />
                <RaisedButton type="submit" label="Add Vote" secondary={true} />
              </form>
            </div>
          ) : (
            <div />
          )}
        </div>
        {this.props.filterByUser && (
          <RaisedButton type="button">
            <ShareButton
              compact
              socialMedia={"facebook"}
              url={"https://xkcd.com/1024/"}
              media={"https://imgs.xkcd.com/comics/error_code.png"}
              text="Sit by a lake"
            />
          </RaisedButton>
        )}
      </React.Fragment>
    );
  }
}

export default Poll;
