import gleam/erlang/process.{type Selector, type Subject}
import gleam/http/request
import gleam/http/response
import gleam/int
import gleam/json
import gleam/list
import gleam/option.{type Option, Some}
import gleam/set
import gleaph
import mist
import server/internal/process_tree
import shared/update/types.{
  type GraphData, type Msg, EdgeData, GraphData, NodeData,
}

type ConnectionState {
  ConnectionState(
    graph: gleaph.Graph(process_tree.Process, Nil),
    self: Subject(Msg),
  )
}

// type ComponentState 
//   ComponentState(
//     component: lustre.Runtime(Msg),
//     self: Subject(server_component.ClientMessage(Msg)),
//   )
// }

// TODO:
// init should create a process watcher actor
// close should kill that process watcher actor
// the state should contain a reference to the process watcher actor
// that process watcher actor should be the one triggering sending proactive (Custom) messages from the server to the client

fn init(_) -> #(ConnectionState, Option(Selector(Msg))) {
  // todo as "implement websocket init function on the server"
  // let my_component = app.app()

  // let assert Ok(component) = lustre.start_server_component(my_component, Nil)

  // let graph = process_tree.get_process_tree()
  let graph = gleaph.new_graph()

  let self = process.new_subject()
  let selector =
    process.new_selector()
    |> process.select(self)

  // server_component.register_subject(self)
  // |> lustre.send(to: component)

  // #(ComponentState(component:, self:), Some(selector))
  #(ConnectionState(graph:, self:), Some(selector))
}

fn loop(
  state: ConnectionState,
  message: mist.WebsocketMessage(Msg),
  connection: mist.WebsocketConnection,
) -> mist.Next(ConnectionState, Msg) {
  case message {
    mist.Text(json) ->
      case json.parse(json, types.msg_decoder()) {
        Ok(msg) ->
          case msg {
            types.ClientRequestedFullGraph -> {
              let graph = process_tree.get_process_tree()
              let json_to_send =
                graph
                |> process_tree_to_data
                |> types.ServerInitializedGraph
                |> types.msg_to_json
                |> json.to_string

              let _ = mist.send_text_frame(connection, json_to_send)
              ConnectionState(..state, graph:)
            }
            _ -> state
          }
        Error(_) -> state
      }
      |> mist.continue
    mist.Binary(_) -> mist.continue(state)
    mist.Closed | mist.Shutdown -> mist.stop()
    mist.Custom(_) ->
      todo as "Server proactively sending a websocket message to the client"
  }
  // case message {
  //   mist.Text(json) -> {
  //     case json.parse(json, server_component.runtime_message_decoder()) {
  //       Ok(runtime_message) -> lustre.send(state.component, runtime_message)
  //       Error(_) -> Nil
  //     }

  //     mist.continue(state)
  //   }

  //   mist.Binary(_) -> {
  //     mist.continue(state)
  //   }

  //   mist.Custom(client_message) -> {
  //     let json = server_component.client_message_to_json(client_message)
  //     let assert Ok(_) = mist.send_text_frame(connection, json.to_string(json))

  //     mist.continue(state)
  //   }

  //   mist.Closed | mist.Shutdown -> mist.stop()
  // }
}

fn close(state: ConnectionState) -> Nil {
  Nil
  // lustre.shutdown()
  // |> lustre.send(to: state.component)
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

pub fn serve_websocket(
  request: request.Request(mist.Connection),
) -> response.Response(mist.ResponseData) {
  mist.websocket(request:, on_init: init, handler: loop, on_close: close)
}
