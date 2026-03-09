import clique
import clique/background
import clique/edge
import clique/handle
import clique/node
import clique/transform
import gleam/int
import gleam/list
import gleam/option
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html
import server/internal/lustre/model.{type Model}
import server/internal/lustre/update/types.{type Msg}
import server/internal/process_tree/layout

const scale_from_layout = 1000.0

pub fn view(model: Model) -> Element(Msg) {
  let transform = transform.init()
  let nodes =
    model.nodes
    |> list.map(fn(node) {
      #(node.id, layout.scale_node(node, scale_from_layout) |> get_node_element)
    })
    |> clique.nodes

  let edges =
    model.edges
    |> list.index_map(fn(edge, i) {
      let edge_element = get_edge_element(edge)
      #(int.to_string(i), edge_element)
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

fn get_edge_element(edge: layout.EdgeLayout) -> Element(Msg) {
  let handle1 = handle.Handle(edge.from, "link")
  let handle2 = handle.Handle(edge.to, "link")
  clique.edge(handle1, handle2, [edge.linear()], [])
}

fn get_node_element(node: layout.NodeLayout) -> Element(Msg) {
  let attributes = [
    node.position(node.x, node.y),
    attribute.class("bg-pink-50 rounded border-2 border-pink-500"),
  ]

  clique.node(node.id, attributes, [
    html.div([attribute.class("flex relative items-center py-1 px-2 size-16")], [
      clique.handle("link", [
        attribute.class("absolute -left-1 top-1/4 bg-black rounded-full size-2"),
      ]),
      option.map(node.label, html.text)
        |> option.unwrap(html.div([attribute.class("hidden")], [])),
      // html.text(node.label),
    ]),
  ])
}
