import clique
import gleam/io
import lustre
import lustre/element.{type Element}
import lustre/server_component

pub fn main() -> Nil {
  let app =
    lustre.simple(
      init: fn(_) { io.println("Initializing the Asterism Front-end app!") },
      update: fn(_, _) { Nil },
      view: view,
    )
  let assert Ok(_) = clique.register()
  let assert Ok(_) = lustre.start(app, "#app", Nil)
  Nil
}

fn view(_: Nil) -> Element(Nil) {
  server_component.element([server_component.route("/ws")], [])
}
