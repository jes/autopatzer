import React from "react";
import { Grid, Box } from "@material-ui/core";
import { green, red } from "@material-ui/core/colors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";

const BoardChanges = ({ boardChanges }) => {
  return (
    <Grid
      container
      item
      xs={12}
      style={{
        flex: "0",
      }}
    >
      <Grid item xs={6}>
        <Box p={1} borderRadius="borderRadius" bgcolor={red[100]} mr={1}>
          <Box pr={1} display="inline" color={red[900]}>
            <FontAwesomeIcon icon={faMinus} size="sm" />
          </Box>
          <Box display="inline" fontSize="1.5em" fontFamily="Anonymous Pro">
            {boardChanges.lost.length !== 0 ? boardChanges.lost.join(", ") : ""}
          </Box>
        </Box>
      </Grid>
      <Grid item xs={6}>
        <Box p={1} borderRadius="borderRadius" bgcolor={green[100]}>
          <Box pr={1} display="inline" color={green[900]}>
            <FontAwesomeIcon icon={faPlus} size="sm" />
          </Box>
          <Box display="inline" fontSize="1.5em" fontFamily="Anonymous Pro">
            {boardChanges.gained.length !== 0
              ? boardChanges.gained.join(", ")
              : ""}
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default BoardChanges;
