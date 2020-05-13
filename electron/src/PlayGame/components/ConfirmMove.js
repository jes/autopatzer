import React from "react";
import { Button, Box } from "@material-ui/core";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { green, grey } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";

const greenTheme = createMuiTheme({ palette: { primary: green } });

const useStyles = makeStyles(() => ({
  button: {
    textTransform: "none",
    fontSize: "3em",
    flex: 1,
  },
}));

const ConfirmMove = ({
  autopatzerdMove,
  setAutopatzerdMove,
  setBoardChanges,
}) => {
  const classes = useStyles();

  if (autopatzerdMove.move) {
    return (
      <MuiThemeProvider theme={greenTheme}>
        <Button
          variant="contained"
          color="primary"
          fullWidth={true}
          disableElevation
          className={classes.button}
          onClick={() => {
            setAutopatzerdMove({
              move: autopatzerdMove.move,
              confirmed: true,
            });
            setBoardChanges({
              lost: [],
              gained: [],
            });
          }}
        >
          {autopatzerdMove.move}
        </Button>
      </MuiThemeProvider>
    );
  } else {
    return (
      <Box
        p={1}
        borderRadius="borderRadius"
        bgcolor={grey[200]}
        className={classes.button}
      ></Box>
    );
  }
};

export default ConfirmMove;
