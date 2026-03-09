import gleam/option.{type Option}
import shared/layout

pub type Model {
  Model(graph_layout: layout.GraphLayout, ws_connection: Option(Nil))
}
