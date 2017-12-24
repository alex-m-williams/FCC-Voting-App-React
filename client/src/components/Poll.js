import React, { Component } from "react";
import Piechart from "./Piechart";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

class Poll extends Component {
  constructor(props) {
    super(props);
    this.state = {
      voteOptions: ["a", "b", "c", "d"],
      votes: [3, 5, 45, 55]
    };
  }

  componentWillUnmount() {
    this.props.closePoll();
  }

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

export default Poll;
