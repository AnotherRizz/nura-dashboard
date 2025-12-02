declare module "leaflet-draw" {
  import L from "leaflet";

  export namespace Draw {
    namespace Event {
      const CREATED: "draw:created";
      const EDITED: "draw:edited";
      const DELETED: "draw:deleted";
    }

    class Polygon extends L.Draw.Polyline {}
  }

  export namespace Control {
    class Draw extends L.Control {
      constructor(options?: any);
    }
  }
}
