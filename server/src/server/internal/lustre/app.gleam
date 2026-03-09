import lustre
import lustre/effect.{type Effect}
import server/internal/lustre/model.{type Model}
import server/internal/lustre/update
import server/internal/lustre/update/side_effects
import server/internal/lustre/view
import server/internal/process_tree/layout
import shared/update/types.{type Msg}

pub type Grid {
  Grid(cols: Int, col_w: Int, row_h: Int)
}

pub fn app() -> lustre.App(Nil, Model, Msg) {
  lustre.application(init, update.update, view.view)
}

fn init(_: Nil) -> #(Model, Effect(Msg)) {
  #(layout.GraphLayout([], []), side_effects.init())
}
