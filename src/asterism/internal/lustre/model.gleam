import asterism/internal/process_tree.{type Link, type Process}
import gleam/erlang/process.{type Pid}
import gleam/string

pub type Model {
  Model(nodes: List(Node), edges: List(Edge))
}

pub type Node {
  Node(process: Process, id: String, label: String, x: Float, y: Float)
}

pub type Edge {
  Edge(id: String, link: Link, node_id_1: String, node_id_2: String)
}

const node_id_prefix = "node-"

pub fn pid_to_node_id(pid: Pid) -> String {
  node_id_prefix
  <> {
    string.inspect(pid)
    |> string.drop_start(9)
    |> string.drop_end(4)
  }
}
