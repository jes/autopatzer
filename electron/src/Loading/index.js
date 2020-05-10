import React from "react";

import { Box, CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
  },
  loadingSpinner: (props) => ({
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -props.size / 2,
    marginLeft: -props.size / 2,
  }),
}));

const Loading = ({ size }) => {
  if (!size) {
    size = 96;
  }

  const classes = useStyles({ size });

  return (
    <Box className={classes.wrapper}>
      <CircularProgress size={size} className={classes.loadingSpinner} />
    </Box>
  );
};

export default Loading;
