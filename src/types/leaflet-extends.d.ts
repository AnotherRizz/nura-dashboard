import "leaflet";
import "leaflet-draw";

declare module "leaflet" {
  namespace Draw {
    namespace Event {
      const CREATED: "draw:created";
      const EDITED: "draw:edited";
      const DELETED: "draw:deleted";
    }
  }
}
