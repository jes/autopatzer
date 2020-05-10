import React from "react";
import { Container, Button, Box } from "@material-ui/core";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";

const greenTheme = createMuiTheme({ palette: { primary: green } });

const useStyles = makeStyles(() => ({
  button: {
    textTransform: "none",
  },
}));

const ConfirmMove = ({ autopatzerdMove, setAutopatzerdMove, setBoardChanges }) => {
  const classes = useStyles();

  return (
    <Container>
      <Box m={2}>
        <MuiThemeProvider theme={greenTheme}>
          <Button
            variant="contained"
            color="primary"
            fullWidth={true}
            disableElevation
            className={classes.button}
            size="large"
            onClick={() => {
              setAutopatzerdMove({
                move: autopatzerdMove.move,
                confirmed: true,
              });
              setBoardChanges({
                lost: [],
                gained: []
              });
            }}
          >
            {autopatzerdMove.move}
          </Button>
        </MuiThemeProvider>
      </Box>
    </Container>
  );
};

export default ConfirmMove;
