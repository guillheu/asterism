import asterism/internal/lustre/model.{type Model}
import asterism/internal/lustre/update
import asterism/internal/lustre/update/side_effects
import asterism/internal/lustre/update/types.{type Msg}
import asterism/internal/lustre/view
import asterism/internal/process_tree/layout
import lustre
import lustre/effect.{type Effect}

pub type Grid {
  Grid(cols: Int, col_w: Int, row_h: Int)
}

pub fn app() -> lustre.App(Nil, Model, Msg) {
  lustre.application(init, update.update, view.view)
}

fn init(_: Nil) -> #(Model, Effect(Msg)) {
  #(layout.GraphLayout([], []), side_effects.init())
}
