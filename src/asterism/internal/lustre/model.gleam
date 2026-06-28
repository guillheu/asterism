import aonyx/graph
import asterism/internal/process_tree.{type Link, type Process}
import gleam/erlang/process.{type Pid}
import gleam/string

pub type Model {
  Model(graph: graph.Graph(String, #(Process, Int, Int), Nil))
}
