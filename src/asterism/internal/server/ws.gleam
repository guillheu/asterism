import asterism/internal/lustre/app
import asterism/internal/lustre/update.{type Msg}
import gleam/erlang/process.{type Selector, type Subject}
import gleam/http/request
import gleam/http/response
import gleam/json
import gleam/option.{type Option, Some}
import lustre
import lustre/server_component
import mist

type ComponentState {
  ComponentState(
    component: lustre.Runtime(Msg),
    self: Subject(server_component.ClientMessage(Msg)),
  )
}

fn init(
  _,
) -> #(ComponentState, Option(Selector(server_component.ClientMessage(Msg)))) {
  let my_component = app.app()

  let assert Ok(component) = lustre.start_server_component(my_component, Nil)

  let self = process.new_subject()
  let selector =
    process.new_selector()
    |> process.select(self)

  server_component.register_subject(self)
  |> lustre.send(to: component)

  #(ComponentState(component:, self:), Some(selector))
}

fn loop(
  state: ComponentState,
  message: mist.WebsocketMessage(server_component.ClientMessage(Msg)),
  connection: mist.WebsocketConnection,
) -> mist.Next(ComponentState, server_component.ClientMessage(Msg)) {
  case message {
    mist.Text(json) -> {
      case json.parse(json, server_component.runtime_message_decoder()) {
        Ok(runtime_message) -> lustre.send(state.component, runtime_message)
        Error(_) -> Nil
      }

      mist.continue(state)
    }

    mist.Binary(_) -> {
      mist.continue(state)
    }

    mist.Custom(client_message) -> {
      let json = server_component.client_message_to_json(client_message)
      let assert Ok(_) = mist.send_text_frame(connection, json.to_string(json))

      mist.continue(state)
    }

    mist.Closed | mist.Shutdown -> mist.stop()
  }
}

fn close(state: ComponentState) -> Nil {
  lustre.shutdown()
  |> lustre.send(to: state.component)
}

pub fn serve_websocket(
  request: request.Request(mist.Connection),
) -> response.Response(mist.ResponseData) {
  mist.websocket(request:, on_init: init, handler: loop, on_close: close)
}
