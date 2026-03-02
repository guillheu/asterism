import asterism/internal/lustre/model.{type Model, Model}
import asterism/internal/lustre/update.{type Msg}
import asterism/internal/lustre/view
import asterism/internal/process_tree.{type Process, Process}
import lustre
import lustre/effect.{type Effect}

const root = Process(
  0,
  [Process(1, [Process(2, []), Process(3, []), Process(4, [])]), Process(5, [])],
)

pub fn main() -> Nil {
  let app = lustre.application(init, update.update, view.view)
  let assert Ok(_) = lustre.start(app, "#app", Nil)
  Nil
}

fn init(_: Nil) -> #(Model, Effect(Msg)) {
  #(Model(root), effect.none())
}
