import React from "react";
import chunk from "lodash/chunk";

import { List, ListItem, Box } from "@material-ui/core";
import ScrollableFeed from "react-scrollable-feed";

const Moves = ({ board }) => {
  const turnListItems = chunk(board.history(), 2).map((turn, index) => {
    turn = turn.join(" ");
    return (
      <ListItem key={turn}>
        <Box
          display="inline"
          fontWeight="fontWeightMedium"
          fontSize={17}
          color="text.disabled"
          minWidth={20}
          textAlign="right"
          mr={2}
        >
          {index + 1}
        </Box>
        <Box display="inline" fontFamily="Anonymous Pro" fontSize={22}>
          {turn}
        </Box>
      </ListItem>
    );
  });

  return (
    <Box height="280px" overflow="auto" boxShadow={1}>
      <ScrollableFeed forceScroll={true}>
        <List>{turnListItems}</List>
      </ScrollableFeed>
    </Box>
  );
};

export default Moves;
