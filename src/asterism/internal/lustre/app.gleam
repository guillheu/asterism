import asterism/internal/lustre/model.{type Model}
import asterism/internal/lustre/update.{type Msg}
import asterism/internal/lustre/view
import lustre
import lustre/effect.{type Effect}

pub type Grid {
  Grid(cols: Int, col_w: Int, row_h: Int)
}

pub fn app() -> lustre.App(Nil, Model, Msg) {
  lustre.application(init, update.update, view.view)
}

fn init(_: Nil) -> #(Model, Effect(Msg)) {
  let effect =
    effect.from(fn(dispatch) { dispatch(update.ConnectionFinishedInitializing) })

  #(model.NotYetLoaded, effect)
}
