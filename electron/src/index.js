import React from "react";
import ReactDOM from "react-dom";

import "typeface-roboto";
import CssBaseline from "@material-ui/core/CssBaseline";

import App from "./App";

ReactDOM.render(
  <React.Fragment>
    <CssBaseline />
    <App />
  </React.Fragment>,
  document.getElementById("root")
);

if (process.env.REACT_APP_HIDE_CURSOR == "1")
  document.getElementById("root").style.cursor = "none";
