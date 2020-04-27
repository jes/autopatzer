import React from "react";

import Black from "@material-ui/icons/FiberManualRecord";
import White from "@material-ui/icons/FiberManualRecordOutlined";

const PlayerColour = ({ colour }) => {
  return colour === "black" ? <Black /> : <White />;
};

export default PlayerColour;
