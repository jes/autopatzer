import React from "react";
import { Grid, Box } from "@material-ui/core";

const BoardChanges = ({ boardChanges }) => {
  return (
    <Grid container item xs={12}>
      <Grid item xs={6}>
        {boardChanges.lost.length !== 0 && (
          <Box component="span" m={2} color="red" fontSize="1.6em">
            - {boardChanges.lost.join(", ")}
          </Box>
        )}
      </Grid>
      <Grid item xs={6}>
        {boardChanges.gained.length !== 0 && (
          <Box component="span" m={2} color="green" fontSize="1.6em">
            + {boardChanges.gained.join(", ")}
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default BoardChanges;
