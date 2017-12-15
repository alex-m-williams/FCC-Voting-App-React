import React, { Component } from 'react';
import logo from './logo.svg';
import './css/App.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';

const style = {
  margin: 12,
};

const App = () => (
  <MuiThemeProvider>
    <AppBar
      title="Voting App"
      iconElementRight={<RaisedButton label="Log in with Twitter" secondary={true} style={style} />}
    />
  </MuiThemeProvider>
);


export default App;
