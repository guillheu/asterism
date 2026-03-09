import gleam/option.{type Option}
import lustre_websocket as ws
import shared/layout

pub type Model {
  Model(graph_layout: layout.GraphLayout, ws_conn: Option(ws.WebSocket))
}
