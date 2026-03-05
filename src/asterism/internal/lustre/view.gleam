import asterism/internal/lustre/model.{type Model}
import asterism/internal/lustre/update.{type Msg}
import clique
import clique/background
import clique/edge
import clique/handle
import clique/node
import clique/transform
import gleam/list
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

pub fn view(model: Model) -> Element(Msg) {
  let transform = transform.init()
  let nodes =
    list.map(model.nodes, fn(node) {
      let node_element = get_node_element(node)
      #(node.id, node_element)
    })
    |> clique.nodes
  let edges =
    list.map(model.edges, fn(edge) {
      let edge_element = get_edge_element(edge)
      #(edge.id, edge_element)
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

fn get_edge_element(edge: model.Edge) -> Element(Msg) {
  let handle1 = handle.Handle(edge.node_id_1, "link")
  let handle2 = handle.Handle(edge.node_id_2, "link")
  clique.edge(handle1, handle2, [edge.linear()], [])
}

fn get_node_element(node: model.Node) -> Element(Msg) {
  let attributes = [
    node.position(node.x, node.y),
    attribute.class("bg-pink-50 rounded border-2 border-pink-500"),
  ]

  clique.node(node.id, attributes, [
    html.div([attribute.class("flex relative items-center py-1 px-2 size-16")], [
      clique.handle("link", [
        attribute.class("absolute -left-1 top-1/4 bg-black rounded-full size-2"),
      ]),
      html.text(node.label),
    ]),
  ])
  |> echo
}
