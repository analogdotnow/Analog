import * as React from "react";

import { useLiveUpdate } from "../calendar/flows/event-form/live-update";

export function Feed() {
  useLiveUpdate();
  const countRef = React.useRef(0);
  React.useEffect(() => {
    countRef.current++;
    console.log("Feed ", countRef.current);
  }, []);
  return <></>;
}

export function ControlFeed() {
  const countRef = React.useRef(0);
  React.useEffect(() => {
    countRef.current++;
    console.log("ControlFeed ", countRef.current);
  }, []);
  return <></>;
}
