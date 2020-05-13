import React from "react";
import { Button } from "@material-ui/core";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";

const greenTheme = createMuiTheme({ palette: { primary: green } });

const useStyles = makeStyles(() => ({
  button: {
    textTransform: "none",
    fontSize: "3em",
  },
}));

const ConfirmMove = ({
  autopatzerdMove,
  setAutopatzerdMove,
  setBoardChanges,
}) => {
  const classes = useStyles();

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
};

export default ConfirmMove;
