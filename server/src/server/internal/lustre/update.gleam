import gleam/int
import gleam/list
import lustre/effect.{type Effect}
import server/internal/lustre/model.{type Model}
import server/internal/process_tree/layout
import shared/update/types.{type Msg}

pub fn update(_model: Model, message: types.Msg) -> #(Model, Effect(Msg)) {
  case message {
    types.ServerInitializedGraph(graph_data) -> #(
      data_to_layout(graph_data) |> layout.layout,
      effect.none(),
    )
  }
}

fn data_to_layout(graph_data: types.GraphData) -> Model {
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
