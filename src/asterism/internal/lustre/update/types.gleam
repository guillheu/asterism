import gleam/option.{type Option}

pub type Msg {
  ServerInitializedGraph(GraphData)
}

pub type GraphData {
  GraphData(nodes: List(NodeData), edges: List(EdgeData))
}

pub type NodeData {
  NodeData(id: Int, label: Option(String))
}

pub type EdgeData {
  EdgeData(id: Int, label: Option(String), node_id_1: Int, node_id_2: Int)
}
