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
import clique/transform
import gleam/dict.{type Dict}
import gleam/int
import gleam/list
import gleam/option
import gleam/result
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

const scaling_from_graph_positions = 200

pub const application_color_palette = [
  "#d845a4",
  "#56e239",
  "#b646ed",
  "#a5f125",
  "#6d3ed9",
  "#99d931",
  "#e74fe3",
  "#37b51f",
  "#be29bc",
  "#53e569",
  "#a161f0",
  "#d9df25",
  "#494fd2",
  "#6ecf3e",
  "#a954d4",
  "#35a32c",
  "#dc38b5",
  "#57e182",
  "#e8319a",
  "#45f3ab",
  "#9e3dad",
  "#88db64",
  "#756ff3",
  "#efc616",
  "#5452c5",
  "#c4cd33",
  "#235fc9",
  "#92c73e",
  "#754cb6",
  "#c0d352",
  "#577ff0",
  "#e5b72e",
  "#a47eeb",
  "#56bd5c",
  "#d470df",
  "#679c2d",
  "#bd4cad",
  "#38892f",
  "#e87edb",
  "#62c578",
  "#e52b1c",
  "#22edd9",
  "#f84e18",
  "#3bd0e5",
  "#e52740",
  "#51d5ab",
  "#e13965",
  "#61d195",
  "#de4080",
  "#a1d97c",
  "#8d3f90",
  "#b3ce62",
  "#6168c5",
  "#ed9020",
  "#2b6abe",
  "#dfc14e",
  "#724ea4",
  "#9aa323",
  "#ac79d5",
  "#5e8934",
  "#e777c3",
  "#458541",
  "#b0428f",
  "#d9c767",
  "#5c92ea",
  "#dd691a",
  "#3ba7e5",
  "#d94926",
  "#40b8e1",
  "#d24636",
  "#56ccc3",
  "#d04747",
  "#66a1e5",
  "#c89127",
  "#2d74b4",
  "#d16b2f",
  "#4463a6",
  "#d19b48",
  "#6462ad",
  "#898523",
  "#ab98ed",
  "#576c1c",
  "#d9a0ec",
  "#8b9f4d",
  "#ae3476",
  "#90d0a2",
  "#e56aa8",
  "#3d8452",
  "#b074bf",
  "#cccc7c",
  "#7d5496",
  "#9ec480",
  "#93518a",
  "#8f8d42",
  "#7f92dd",
  "#a36115",
  "#7ab3e3",
  "#c9653e",
  "#3c83af",
  "#e8a46a",
  "#5d679c",
  "#616117",
  "#eba7e2",
  "#60793c",
  "#b877b0",
  "#3a8c6e",
  "#a7344d",
  "#c6c288",
  "#7867a3",
  "#b89653",
  "#aaa4e1",
  "#76631e",
  "#de93bb",
  "#845d1f",
  "#e07699",
  "#77733e",
  "#9a537c",
  "#e1ab7f",
  "#9b4362",
  "#9c5725",
  "#d66b7d",
  "#a06f47",
  "#d06163",
  "#e49492",
  "#a05037",
  "#e5836a",
  "#9d565b",
  "#b6685d",
]

pub fn view(model: Model) -> Element(Msg) {
  let transform = transform.init()
  let application_colors =
    list.zip(model.loaded_applications, application_color_palette)
    |> dict.from_list
  let nodes =
    list.map(model.graph |> graph.get_nodes, fn(node) {
      let node_element = get_node_element(node, application_colors)
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
  let #(_c1, _c2) = get_bezier_control_points_from_edge(edge)
  clique.edge(handle1, handle2, edge.linear([]), [])
}

fn get_bezier_control_points_from_edge(
  edge: graph_edge.Edge(
    String,
    #(option.Option(Nil), #(#(Int, Int), #(Int, Int))),
  ),
) -> #(#(Float, Float), #(Float, Float)) {
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
  #(c1, c2)
}

fn get_node_element(
  node: graph_node.Node(String, #(process_tree.Process, Int, Int)),
  application_colors: Dict(String, String),
) -> Element(Msg) {
  let node_process = node.value.0
  let node_color =
    dict.get(
      application_colors,
      process_tree.get_process_application(node_process)
        |> option.unwrap(""),
    )
    |> result.unwrap("")
  let attributes = [
    node.position(
      { node.value.2 * scaling_from_graph_positions } |> int.to_float,
      { node.value.1 * scaling_from_graph_positions } |> int.to_float,
    ),
    attribute.class(
      "bg-[" <> node_color <> "] rounded border-2 border-neutral-500",
    ),
  ]

  clique.node(node.key, attributes, [
    html.div(
      [
        attribute.class(
          "flex flex-col relative items-center py-1 px-2 h-20 w-32 break-all",
        ),
      ],
      [
        clique.handle("link-top", [
          attribute.class(
            "absolute top-0 left-1/2 -translate-x-1/2 bg-black rounded-full size-2",
          ),
        ]),
        html.h4([attribute.class("font-bold")], [
          node.value.0
          |> process_tree.get_process_application
          |> option.unwrap("")
          |> html.text,
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
