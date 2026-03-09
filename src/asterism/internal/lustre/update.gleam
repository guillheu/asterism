import asterism/internal/lustre/model.{type Model}
import asterism/internal/process_tree/layout
import gleam/option.{type Option}
import lustre/effect.{type Effect}

pub type Msg {
  ServerFinishedInitializingGraph(GraphData)
}

pub type GraphData {
  GraphData(nodes: List(Node), edges: List(Edge))
}

pub type Node {
  Node(id: Int, label: Option(String))
}

pub type Edge {
  Edge(id: Int, label: Option(String), node_id_1: Int, node_id_2: Int)
}

pub fn update(model: Model, message: Msg) -> #(Model, Effect(Msg)) {
  #(model, effect.none())
}
// fn data_to_layout()
