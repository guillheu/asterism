import gleam/option.{None}
import lustre
import lustre/effect.{type Effect}
import lustre/element
import model.{type Model}
import shared/layout
import shared/update/types.{type Msg}
import shared/view
import update
import update/side_effects

pub type Grid {
  Grid(cols: Int, col_w: Int, row_h: Int)
}

pub fn app() -> lustre.App(Nil, Model, Msg) {
  lustre.application(init, update.update, view)
}

fn view(model: Model) -> element.Element(Msg) {
  view.view(model.graph_layout)
}

fn init(_: Nil) -> #(Model, Effect(Msg)) {
  #(layout.GraphLayout([], []) |> model.Model(None), side_effects.init())
}
