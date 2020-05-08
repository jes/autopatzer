import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

if (process.env.REACT_APP_HIDE_CURSOR == "1")
    document.getElementById('root').style.cursor = "none";
