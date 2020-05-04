import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import { lightGreen, grey } from "@material-ui/core/colors";

import Online from "@material-ui/icons/FiberManualRecord";
import Offline from "@material-ui/icons/FiberManualRecordOutlined";

const useStyles = makeStyles(() => ({
  online: {
    color: lightGreen.A400,
  },
  offline: {
    color: grey[500],
  },
}));

const PlayerOnline = ({ online }) => {
  const classes = useStyles();

  return online ? (
    <Online className={classes.online} />
  ) : (
    <Offline className={classes.offline} />
  );
};

export default PlayerOnline;
