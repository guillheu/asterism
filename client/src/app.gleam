import gleam/option.{None}
import lustre
import lustre/effect.{type Effect}
import lustre/element
import lustre_websocket as ws
import model.{type Model}
import shared/layout
import shared/view
import update

const ws_path = "/ws"

pub fn app() -> lustre.App(Nil, Model, update.ClientMsg) {
  lustre.application(init, update.update, view)
}

fn view(model: Model) -> element.Element(update.ClientMsg) {
  view.view(model.graph_layout)
  |> element.map(update.AppMessage)
}

fn init(_: Nil) -> #(Model, Effect(update.ClientMsg)) {
  #(
    layout.GraphLayout([], []) |> model.Model(None),
    // effect.none(),
    ws.init(ws_path, update.WebSocketMessage),
  )
}
