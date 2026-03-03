import asterism/internal/process_tree.{type Link, type Process}

pub type Model {
  Model(nodes: List(Node), edges: List(Edge))
}

pub type Node {
  Node(process: Process, id: String, label: String, x: Float, y: Float)
}

pub type Edge {
  Edge(link: Link)
}
