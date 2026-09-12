import aonyx/graph
import aonyx/graph/edge as graph_edge
import aonyx/graph/node as graph_node
import asterism/internal/lustre/model.{type Model}
import asterism/internal/lustre/update.{type Msg}
import asterism/internal/process_tree
import clique
import clique/background
import clique/edge
import clique/handle
import clique/node
import clique/position
import clique/transform
import gleam/int
import gleam/list
import gleam/option
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

const scaling_from_graph_positions = 200

pub fn view(model: Model) -> Element(Msg) {
  let transform = transform.init()
  let nodes =
    list.map(model.graph |> graph.get_nodes, fn(node) {
      let node_element = get_node_element(node)
      #(node.value.0 |> process_tree.process_to_string, node_element)
    })
    |> clique.nodes
  let edges =
    list.map(model.graph |> graph.get_edges, fn(edge) {
      let edge_element = get_edge_element(edge)
      #(edge.from <> edge.to, edge_element)
    })
    |> clique.edges
  html.div([attribute.class("w-screen h-screen font-mono")], [
    clique.root(
      [
        clique.initial_transform(transform),
        attribute.class("w-full h-full bg-white rounded-lg shadow-md"),
      ],
      [
        clique.background([
          background.lines(),
          attribute.class("text-pink-100 bg-slate-50"),
          background.gap(50.0, 50.0),
        ]),

        clique.background([
          background.dots(),
          attribute.class("text-pink-200"),
          background.size(2.0),
          background.gap(50.0, 50.0),
        ]),
        nodes,
        edges,
      ],
    ),
  ])
}

fn get_edge_element(
  edge: graph_edge.Edge(
    String,
    #(option.Option(Nil), #(#(Int, Int), #(Int, Int))),
  ),
) -> Element(Msg) {
  let handle1 = handle.Handle(edge.from, "link-bottom")
  let handle2 = handle.Handle(edge.to, "link-top")
  let assert option.Some(#(_, #(control_point_1, control_point_2))) = edge.label
  let #(c1x, c1y) = control_point_1
  let #(c2x, c2y) = control_point_2

  let c1 = #(
    { c1x * scaling_from_graph_positions } |> int.to_float,
    { c1y * scaling_from_graph_positions } |> int.to_float,
  )
  let c2 = #(
    { c2x * scaling_from_graph_positions } |> int.to_float,
    { c2y * scaling_from_graph_positions } |> int.to_float,
  )
  clique.edge(handle1, handle2, edge.linear([]), [])
}

fn get_node_element(
  node: graph_node.Node(String, #(process_tree.Process, Int, Int)),
) -> Element(Msg) {
  let attributes = [
    node.position(
      { node.value.2 * scaling_from_graph_positions } |> int.to_float,
      { node.value.1 * scaling_from_graph_positions } |> int.to_float,
    ),
    attribute.class("bg-pink-50 rounded border-2 border-pink-500"),
  ]

  clique.node(node.key, attributes, [
    html.div(
      [
        attribute.class(
          "flex relative items-center py-1 px-2 h-20 w-32 break-all",
        ),
      ],
      [
        clique.handle("link-top", [
          attribute.class(
            "absolute top-0 left-1/2 -translate-x-1/2 bg-black rounded-full size-2",
          ),
        ]),
        html.text(node.value.0 |> process_tree.process_to_string),
        clique.handle("link-bottom", [
          attribute.class(
            "absolute bottom-0 left-1/2 -translate-x-1/2 bg-black rounded-full size-2",
          ),
        ]),
      ],
    ),
  ])
}
