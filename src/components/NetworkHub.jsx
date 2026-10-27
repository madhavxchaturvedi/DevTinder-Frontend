import React from "react";
import NetworkPage from "../pages/NetworkPage";

/**
 * NetworkHub serves as a clean wrapper component for the developer network suite
 * (/network, /connections, /requests).
 */
const NetworkHub = (props) => {
  return <NetworkPage {...props} />;
};

export default NetworkHub;
