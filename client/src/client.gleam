import app
import clique
import gleam/io
import lustre

pub fn main() -> Nil {
  let app = app.app()
  let assert Ok(_) = clique.register()
  let assert Ok(_) = lustre.start(app, "#app", Nil)
  io.println("Hello from Asterism!")
  Nil
}
