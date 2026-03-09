import gleam/int
import gleam/list
import gleam/option.{type Option}
import gleam_community/maths

pub type GraphLayout {
  GraphLayout(nodes: List(NodeLayout), edges: List(EdgeLayout))
}

pub type NodeLayout {
  NodeLayout(id: String, label: Option(String), x: Float, y: Float)
}

pub type EdgeLayout {
  EdgeLayout(from: String, to: String, label: Option(String))
}

pub fn layout(graph: GraphLayout) -> GraphLayout {
  graph |> initial_layout
}

fn initial_layout(graph: GraphLayout) -> GraphLayout {
  let nodes = graph.nodes
  let angle_per_node =
    maths.pi() *. 2.0 /. { list.length(nodes) |> int.to_float }
  let new_nodes =
    list.index_map(nodes, fn(node, index) {
      let next_angle = angle_per_node *. int.to_float(index)
      let x = maths.sin(next_angle)
      let y = maths.cos(next_angle)

      NodeLayout(..node, x:, y:)
    })

  GraphLayout(..graph, nodes: new_nodes)
}

pub fn scale_node(node: NodeLayout, scale: Float) -> NodeLayout {
  let new_x = node.x *. scale
  let new_y = node.y *. scale
  NodeLayout(..node, x: new_x, y: new_y)
}
