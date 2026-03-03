import asterism/internal/lustre/model.{type Model}
import asterism/internal/lustre/update.{type Msg}
import clique
import clique/background
import clique/node
import clique/transform
import gleam/list
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

pub fn view(model: Model) -> Element(Msg) {
  let transform = transform.init()
  let nodes: List(#(String, Element(Msg))) =
    list.map(model.nodes, fn(node) {
      let node_element = get_node_element(node)
      #(node.id, node_element)
    })
  html.div([], [
    clique.root(
      [
        clique.initial_transform(transform),
        attribute.class("grid gap-2 grid-cols-5"),
      ],
      [
        // clique.background()
        clique.nodes(nodes),
      ],
    ),
  ])
}

fn get_node_element(node: model.Node) -> Element(Msg) {
  let attributes = [
    node.position(node.x, node.y),
    attribute.class("border p-1"),
  ]

  clique.node(node.id, attributes, [
    // html.div([attribute.class("py-1 px-2 size-16")], [
    html.text(node.label),
    // ]),
  ])
}
