import aonyx/graph
import asterism/internal/process_tree.{type Link, type Process}
import gleam/erlang/process.{type Pid}
import gleam/option
import gleam/string

pub type Model {
  //the graph uses Strings as node IDs, 
  //stores a process ID and X-Y coords for each node, 
  //and an optional label as well as bezier control points for all edges
  Model(
    graph: graph.Graph(
      String,
      #(process_tree.Process, Int, Int),
      #(option.Option(Nil), #(#(Int, Int), #(Int, Int))),
    ),
  )
}
