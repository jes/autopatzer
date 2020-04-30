import React from "react";
import chunk from "lodash/chunk";

import { Container, List, ListItem, Box } from "@material-ui/core";
import ScrollableFeed from "react-scrollable-feed";

const Moves = ({ moves }) => {
  const movesListItems = chunk(moves, 2).map((move, index) => {
    move = move.join(" ");
    return (
      <ListItem key={move}>
        <Box
          display="inline"
          fontWeight="fontWeightMedium"
          fontSize={13}
          color="text.disabled"
          minWidth={20}
          textAlign="right"
          mr={2}
        >
          {index + 1}
        </Box>
        <Box display="inline" fontFamily="Monospace" fontSize={16}>
          {move}
        </Box>
      </ListItem>
    );
  });

  return (
    <Container>
      <Box m={2} height="280px" overflow="auto" border={1}>
        <ScrollableFeed forceScroll={true}>
          <List disablePadding={true}>{movesListItems}</List>
        </ScrollableFeed>
      </Box>
    </Container>
  );
};

export default Moves;
