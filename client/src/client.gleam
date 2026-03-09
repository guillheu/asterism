import app
import clique
import lustre

pub fn main() -> Nil {
  let app = app.app()
  let assert Ok(_) = clique.register()
  let assert Ok(_) = lustre.start(app, "#app", Nil)
  Nil
}
