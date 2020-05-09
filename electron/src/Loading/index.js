import React from "react";

import { Box, CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
  },
  loadingSpinner: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -48,
    marginLeft: -48,
  },
}));

const Loading = () => {
  const classes = useStyles();

  return (
    <Box className={classes.wrapper}>
      <CircularProgress size={96} className={classes.loadingSpinner} />
    </Box>
  );
};

export default Loading;
