import gleam/dynamic/decode
import gleam/json
import gleam/option.{type Option}

pub type Msg {
  ServerInitializedGraph(graph: GraphData)
}

pub fn msg_to_json(msg: Msg) -> json.Json {
  let ServerInitializedGraph(graph:) = msg
  json.object([
    #("graph", graph_data_to_json(graph)),
  ])
}

pub fn msg_decoder() -> decode.Decoder(Msg) {
  use graph <- decode.field("graph", graph_data_decoder())
  decode.success(ServerInitializedGraph(graph:))
}

pub type GraphData {
  GraphData(nodes: List(NodeData), edges: List(EdgeData))
}

fn graph_data_to_json(graph_data: GraphData) -> json.Json {
  let GraphData(nodes:, edges:) = graph_data
  json.object([
    #("nodes", json.array(nodes, node_data_to_json)),
    #("edges", json.array(edges, edge_data_to_json)),
  ])
}

fn graph_data_decoder() -> decode.Decoder(GraphData) {
  use nodes <- decode.field("nodes", decode.list(node_data_decoder()))
  use edges <- decode.field("edges", decode.list(edge_data_decoder()))
  decode.success(GraphData(nodes:, edges:))
}

pub type NodeData {
  NodeData(id: Int, label: Option(String))
}

fn node_data_to_json(node_data: NodeData) -> json.Json {
  let NodeData(id:, label:) = node_data
  json.object([
    #("id", json.int(id)),
    #("label", case label {
      option.None -> json.null()
      option.Some(value) -> json.string(value)
    }),
  ])
}

fn node_data_decoder() -> decode.Decoder(NodeData) {
  use id <- decode.field("id", decode.int)
  use label <- decode.field("label", decode.optional(decode.string))
  decode.success(NodeData(id:, label:))
}

pub type EdgeData {
  EdgeData(id: Int, label: Option(String), node_id_1: Int, node_id_2: Int)
}

fn edge_data_to_json(edge_data: EdgeData) -> json.Json {
  let EdgeData(id:, label:, node_id_1:, node_id_2:) = edge_data
  json.object([
    #("id", json.int(id)),
    #("label", case label {
      option.None -> json.null()
      option.Some(value) -> json.string(value)
    }),
    #("node_id_1", json.int(node_id_1)),
    #("node_id_2", json.int(node_id_2)),
  ])
}

fn edge_data_decoder() -> decode.Decoder(EdgeData) {
  use id <- decode.field("id", decode.int)
  use label <- decode.field("label", decode.optional(decode.string))
  use node_id_1 <- decode.field("node_id_1", decode.int)
  use node_id_2 <- decode.field("node_id_2", decode.int)
  decode.success(EdgeData(id:, label:, node_id_1:, node_id_2:))
}
