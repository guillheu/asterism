import asterism/internal/lustre/model.{type Model, Model}
import asterism/internal/lustre/update.{type Msg}
import asterism/internal/lustre/view
import asterism/internal/process_tree
import gleam/int
import gleam/list
import gleam/string
import lustre
import lustre/effect.{type Effect}
import sugiyama

pub type Grid {
  Grid(cols: Int, col_w: Int, row_h: Int)
}

pub fn app() -> lustre.App(Nil, Model, Msg) {
  lustre.application(init, update.update, view.view)
}

fn init(_: Nil) -> #(Model, Effect(Msg)) {
  let graph = process_tree.get_process_forest()
  let laid_out_graph = sugiyama.run(graph)

  #(Model(laid_out_graph), effect.none())
}
