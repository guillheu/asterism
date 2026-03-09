import gleam/int
import gleam/list
import gleam/option.{None}
import lustre/effect.{type Effect}
import model.{type Model, Model}
import shared/layout
import shared/update/types.{type Msg}

pub fn update(model: Model, message: types.Msg) -> #(Model, Effect(Msg)) {
  case message {
    types.ServerInitializedGraph(graph_data) -> #(
      data_to_layout(graph_data) |> layout.layout |> Model(model.ws_connection),
      effect.none(),
    )
    types.ClientRequestedFullGraph -> #(model, effect.none())
  }
}

fn data_to_layout(graph_data: types.GraphData) -> layout.GraphLayout {
  let nodes =
    list.map(graph_data.nodes, fn(node) {
      let id = int.to_string(node.id)
      let label = node.label
      let x = 0.0
      let y = 0.0
      layout.NodeLayout(id:, label:, x:, y:)
    })
  let edges =
    list.map(graph_data.edges, fn(edge) {
      let label = edge.label
      let from = int.to_string(edge.node_id_1)
      let to = int.to_string(edge.node_id_2)
      layout.EdgeLayout(label:, from:, to:)
    })
  layout.GraphLayout(nodes:, edges:)
  |> layout.layout
}
