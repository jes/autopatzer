import React from "react";
import { Grid, Container, Box } from "@material-ui/core";

const BoardChanges = ({ boardChanges }) => {
  return (<Grid item xs={12}>
           <Container>
             {boardChanges.lost.length !== 0 && (
             <Box
               component="span"
               m={2}
               color="red"
               fontSize="1.6em"
             >
               - {boardChanges.lost.join(", ")}
             </Box>
             )}
             {boardChanges.gained.length !== 0 && (
             <Box
               component="span"
               m={2}
               color="green"
               fontSize="1.6em"
             >
               + {boardChanges.gained.join(", ")}
             </Box>
             )}
           </Container>
         </Grid>
  );
};

export default BoardChanges;
