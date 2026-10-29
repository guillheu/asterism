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
import lustre/element/svg

const horizontal_scaling_from_graph_positions = 200

const vertical_scaling_from_graph_positions = 250

pub fn view(model: Model) -> Element(Msg) {
  case model {
    model.NotYetLoaded -> get_loading_page()
    model.Model(graph, loaded_applications, _) ->
      get_loaded_page(graph, loaded_applications)
  }
}

fn get_loading_page() -> Element(Msg) {
  html.div([], [html.h1([], [html.text("Loading...")])])
}

fn get_loaded_page(
  graph: graph.Graph(
    String,
    #(process_tree.Process, Int, Int),
    #(option.Option(Nil), #(#(Int, Int), #(Int, Int))),
  ),
  loaded_applications: Dict(String, String),
) -> Element(Msg) {
  let transform = transform.init()
  let nodes =
    list.map(graph |> graph.get_nodes, fn(node) {
      let node_element = get_node_element(node, loaded_applications)
      #(node.value.0 |> process_tree.process_to_string, node_element)
    })
    |> clique.nodes
  let edges =
    list.map(graph |> graph.get_edges, fn(edge) {
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
  // let #(_c1, _c2) = get_bezier_control_points_from_edge(edge)
  clique.edge(handle1, handle2, edge.linear([]), [])
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
  let node_border = case process_tree.get_process_trap_exit(node_process) {
    True -> "border-8 border-double border-neutral-600"
    False -> "border-3 border-dashed border-neutral-800"
  }
  let attributes = [
    node.position(
      { node.value.2 * horizontal_scaling_from_graph_positions } |> int.to_float,
      { node.value.1 * vertical_scaling_from_graph_positions } |> int.to_float,
    ),
    attribute.class("rounded " <> node_border <> " -translate-x-1/2"),
  ]
  let style = attribute.style("background-color", node_color)

  let supervisor_signal = case node_process {
    process_tree.Supervisor(_, _, _, _, _, _) -> [
      svg.svg(
        [
          attribute.class(
            "absolute -translate-x-1/2 translate-y-1/6 top-0 left-1/2 z-10 w-8 h-8",
          ),
          attribute.attribute("viewBox", "0 0 10 10"),
        ],
        [
          svg.path([attribute.attribute("d", "M0 0L5 10 10 0z")]),
        ],
      ),
    ]
    process_tree.Process(_, _, _, _, _) -> []
  }
  clique.node(node.key, attributes, [
    html.div(
      [
        attribute.class(
          "flex flex-col relative items-center py-1 px-2 w-36 break-all",
        ),
        style,
      ],
      [
        html.div([attribute.class("relative")], [
          clique.handle("link-top", [
            attribute.class(
              "absolute top-0 left-1/2 -translate-y-full -translate-x-1/2 bg-black rounded-full size-2",
            ),
          ]),
        ]),
        html.h4([attribute.class("font-bold")], [
          node.value.0
          |> process_tree.get_process_application
          |> option.unwrap("")
          |> html.text,
        ]),
        html.text(node.value.0 |> process_tree.process_to_string),
        html.p([attribute.class("underline")], [
          html.text(
            process_tree.get_process_label(node_process) |> option.unwrap(""),
          ),
        ]),
        html.div(
          [attribute.class("relative")],
          [
            clique.handle("link-bottom", [
              attribute.class(
                "absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full bg-black rounded-full size-2",
              ),
            ]),
          ]
            |> list.append(supervisor_signal),
        ),
      ],
    ),
  ])
}
