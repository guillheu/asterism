import aonyx/graph
import asterism/internal/process_tree
import gleam/option

pub type Model {
  NotYetLoaded
  //the graph uses Strings as node IDs, 
  //stores a process ID and X-Y coords for each node, 
  //and an optional label as well as bezier control points for all edges
  Model(
    graph: graph.Graph(
      String,
      #(process_tree.Process, Int, Int),
      #(option.Option(Nil), #(#(Int, Int), #(Int, Int))),
    ),
    loaded_applications: List(String),
  )
}
