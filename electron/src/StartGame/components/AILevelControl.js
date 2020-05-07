import React from "react";
import { Button, ButtonGroup, Grid, Typography } from "@material-ui/core";

const aiLevels = Array.from(new Array(8), (x, i) => i + 1);

const AILevelControl = ({ aiLevel, setAILevel }) => {
  const aiLevelButtons = aiLevels.map((l) => (
    <Button
      color={aiLevel === l ? "primary" : "default"}
      onClick={() => setAILevel(l)}
      key={`level-${l}`}
    >
      {l}
    </Button>
  ));

  return (
    <Grid container>
      <Grid item xs={2}>
        <Typography variant="h6" align="center">
          AI Level
        </Typography>
      </Grid>
      <Grid item xs={10}>
        <ButtonGroup variant="contained" fullWidth={true}>
          {aiLevelButtons}
        </ButtonGroup>
      </Grid>
    </Grid>
  );
};

export default AILevelControl;
