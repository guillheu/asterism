import elk
import gleam/bit_array
import gleam/int
import gleam/javascript/array.{type Array}
import gleam/javascript/promise.{type Promise}
import gleam/json
import gleam/list
import gleam/option.{None, Some}
import gleam/string
import lustre/effect.{type Effect}
import lustre_websocket as ws
import model.{type Model, Model}
import shared/layout
import shared/update/types.{type Msg}

pub type ClientMsg {
  WebSocketMessage(ws.WebSocketEvent)
  AppMessage(Msg)
  LayoutEngineFinishedRendering(layout.GraphLayout)
}

pub fn update(model: Model, message: ClientMsg) -> #(Model, Effect(ClientMsg)) {
  case message {
    WebSocketMessage(ws_message) -> handle_ws_msg(model, ws_message)
    AppMessage(app_msg) -> handle_app_msg(model, app_msg)
    LayoutEngineFinishedRendering(graph_layout) -> #(
      Model(..model, graph_layout:) |> echo,
      effect.none(),
    )
  }
}

fn handle_ws_msg(
  model: Model,
  ws_message: ws.WebSocketEvent,
) -> #(Model, Effect(ClientMsg)) {
  case ws_message {
    ws.OnOpen(ws_conn) -> #(
      Model(..model, ws_conn: Some(ws_conn)),
      ws.send(
        ws_conn,
        types.msg_to_json(types.ClientRequestedFullGraph) |> json.to_string,
      ),
    )
    ws.OnTextMessage(json) ->
      case json.parse(json, types.msg_decoder()) {
        Ok(msg) -> handle_app_msg(model, msg)
        Error(reason) ->
          panic as {
            "Server sent an unknown text frame, which should never happen. It's possible your WS connection has been highjacked! : "
            <> string.inspect(reason)
          }
      }
    ws.OnBinaryMessage(bitarray) ->
      panic as {
        "Server sent an unknown binary frame, which should never happen. It's possible your WS connection has been highjacked! Found binary frame: "
        <> bit_array.base16_encode(bitarray)
      }
    ws.InvalidUrl -> #(model, effect.none())
    ws.OnClose(_) -> #(Model(..model, ws_conn: None), effect.none())
  }
}

fn handle_app_msg(model: Model, app_msg: Msg) -> #(Model, Effect(ClientMsg)) {
  case app_msg {
    types.ServerInitializedGraph(graph:) -> {
      let graph_layout = data_to_layout(graph)
      #(Model(..model, graph_layout:), generate_layout(graph_layout))
    }
    types.ClientRequestedFullGraph ->
      panic as "Server sent a ClientRequestedFullGraph message, which should never happen. It's possible your WS connection has been highjacked!"
  }
}

fn data_to_layout(graph_data: types.GraphData) -> layout.GraphLayout {
  let nodes =
    list.map(graph_data.nodes, fn(node) {
      let id = int.to_string(node.id)
      let label = node.label
      let x = 0.0
      let y = 0.0
      layout.NodeLayout(id:, label:, x:, y:)
    })
  let edges =
    list.map(graph_data.edges, fn(edge) {
      let label = edge.label
      let from = int.to_string(edge.node_id_1)
      let to = int.to_string(edge.node_id_2)
      layout.EdgeLayout(label:, from:, to:)
    })
  layout.GraphLayout(nodes:, edges:)
  |> layout.layout
}

fn generate_layout(graph_layout: layout.GraphLayout) -> effect.Effect(ClientMsg) {
  let nodes = graph_layout.nodes |> array.from_list
  let edges = graph_layout.edges |> array.from_list

  use dispatch <- effect.from
  promise.tap(elk.do_get_elk_layout(nodes, edges), fn(new_nodes) {
    layout.GraphLayout(..graph_layout, nodes: new_nodes |> array.to_list)
    |> LayoutEngineFinishedRendering
    |> dispatch
  })
  Nil
}
