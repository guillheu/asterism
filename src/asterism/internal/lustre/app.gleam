import asterism/internal/lustre/model.{type Model, Model}
import asterism/internal/lustre/update.{type Msg}
import asterism/internal/lustre/view
import asterism/internal/process_tree.{Process}
import lustre
import lustre/effect.{type Effect}

// const root = Process(
//   0,
//   [Process(1, [Process(2, []), Process(3, []), Process(4, [])]), Process(5, [])],
// )

pub fn app() -> lustre.App(Nil, Model, Msg) {
  lustre.application(init, update.update, view.view)
}

fn init(_: Nil) -> #(Model, Effect(Msg)) {
  let root = process_tree.get_process_tree()
  #(Model(root), effect.none())
}
