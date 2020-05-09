import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import { lightGreen, grey } from "@material-ui/core/colors";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle as faCircleSolid } from "@fortawesome/free-solid-svg-icons";
import { faCircle as faCircleRegular } from "@fortawesome/free-regular-svg-icons";

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
    <FontAwesomeIcon icon={faCircleSolid} className={classes.online} />
  ) : (
    <FontAwesomeIcon icon={faCircleRegular} className={classes.offline} />
  );
};

export default PlayerOnline;
