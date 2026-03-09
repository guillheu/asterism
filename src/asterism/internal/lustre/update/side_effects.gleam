import asterism/internal/lustre/update/types.{
  type GraphData, type Msg, EdgeData, GraphData, NodeData,
  ServerInitializedGraph,
}
import asterism/internal/process_tree
import gleam/erlang/process.{type Pid}
import gleam/int
import gleam/list
import gleam/option.{Some}
import gleam/set
import gleam/string
import gleaph
import lustre/effect.{type Effect}

pub fn init() -> Effect(Msg) {
  effect.from(fn(dispatch) {
    process_tree.get_process_tree()
    |> process_tree_to_data
    |> ServerInitializedGraph
    |> dispatch
  })
}

fn process_tree_to_data(
  graph: gleaph.Graph(process_tree.Process, b),
) -> GraphData {
  let nodes =
    gleaph.get_nodes(graph)
    |> set.to_list
    |> list.sort(fn(node1, node2) {
      int.compare(gleaph.get_id(node1), gleaph.get_id(node2))
    })
    |> list.map(fn(node) {
      let id = gleaph.get_id(node)
      let label =
        gleaph.get_value(node) |> option.map(process_tree.process_to_string)
      NodeData(id:, label:)
    })
  let edges =
    gleaph.get_edges(graph)
    |> set.to_list
    |> list.index_map(fn(edge, i) {
      let id = i
      let label = option.None
      let #(node_id_1, node_id_2) = gleaph.get_endpoints(edge)

      EdgeData(id:, label:, node_id_1:, node_id_2:)
    })
  GraphData(nodes, edges)
}
