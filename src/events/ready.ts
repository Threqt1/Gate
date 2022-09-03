import { EventInfo } from "../defs/EventInfo";

export = {
  event: "ready",
  once: false,
  callback: (client) => {
    console.log("Gates Awake");
  },
} as EventInfo;
