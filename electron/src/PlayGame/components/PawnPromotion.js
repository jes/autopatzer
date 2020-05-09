import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Container, Grid, Box, IconButton } from "@material-ui/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChessQueen,
  faChessRook,
  faChessBishop,
  faChessKnight,
} from "@fortawesome/free-solid-svg-icons";

const promotionPieces = {
  Q: faChessQueen,
  R: faChessRook,
  B: faChessBishop,
  N: faChessKnight,
};

const pawnPromotionRegex = /(=)[QRBN]/;

const useStyles = makeStyles(() => ({
  icon: {
    color: "#000",
    fontSize: 50,
  },
}));

const PawnPromotion = ({ move, setMove, handleModalClose }) => {
  const classes = useStyles();

  const handlePawnPromotion = (piece) => {
    const newMove = move.replace(pawnPromotionRegex, `$1${piece}`);
    setMove({
      move: newMove,
      confirmed: false,
      pawnPromotionChosen: true,
    });
    handleModalClose();
  };

  return (
    <Container>
      <Box m={2} textAlign="center" fontWeight="fontWeightBold">
        Promote To
        <Grid container spacing={4}>
          {Object.keys(promotionPieces).map((p) => (
            <Grid item xs={3} spacing={4} key={p}>
              <IconButton
                key={p}
                className={classes.icon}
                onClick={() => {
                  handlePawnPromotion(p);
                }}
              >
                <FontAwesomeIcon icon={promotionPieces[p]} />
              </IconButton>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default PawnPromotion;
