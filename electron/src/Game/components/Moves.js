import React, { useEffect, useRef } from "react";

import { makeStyles } from "@material-ui/core/styles";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";

import Box from "@material-ui/core/Box";
import PlayerColour from "./PlayerColour";

const useStyles = makeStyles((theme) => ({
  icon: {
    color: "black",
  },
}));

const Moves = ({ moves }) => {
  const classes = useStyles();

  const movesListItems = moves.map((move, index) => (
    <ListItem key={move} selected={index % 2 === 0 ? false : true}>
      <Box
        display="inline"
        fontWeight="fontWeightMedium"
        fontSize={10}
        color="text.disabled"
        minWidth={20}
        textAlign="right"
        mr={2}
      >
        {index + 1}
      </Box>
      <Box className={classes.icon} mr={1} display="flex" alignItems="center">
        <PlayerColour colour={index % 2 === 0 ? "white" : "black"} />
      </Box>
      <Box display="inline" fontFamily="Monospace" fontSize={16}>
        {move}
      </Box>
    </ListItem>
  ));

  return (
    <Box border={1} overflow="auto" height="300px">
      <List disablePadding={true}>{movesListItems}</List>
    </Box>
  );
};

export default Moves;
