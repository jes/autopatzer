import React from "react";
import chunk from "lodash/chunk";

import { List, ListItem, Box } from "@material-ui/core";
import ScrollableFeed from "react-scrollable-feed";

const Moves = ({ board }) => {
  const turnListItems = chunk(board.history(), 2).map((turn, index) => {
    return (
      <ListItem key={turn}>
        <Box
          display="inline"
          fontWeight="fontWeightMedium"
          fontSize={17}
          color="text.disabled"
          minWidth={30}
          textAlign="right"
          mr={5}
        >
          {index + 1}
        </Box>
        <Box display="inline" fontFamily="Anonymous Pro" fontSize={22} minWidth={120}>
          {turn[0]}
        </Box>
        <Box display="inline" fontFamily="Anonymous Pro" fontSize={22} minWidth={120}>
          {turn[1]}
        </Box>
      </ListItem>
    );
  });

  return (
    <Box height="280px" overflow="auto" boxShadow={1} bgcolor="white">
      <ScrollableFeed forceScroll={true}>
        <List>{turnListItems}</List>
      </ScrollableFeed>
    </Box>
  );
};

export default Moves;
