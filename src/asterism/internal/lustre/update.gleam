import aonyx/graph
import asterism/internal/lustre/autorefresh
import asterism/internal/lustre/model.{type Model}
import asterism/internal/process_tree
import gleam/dict.{type Dict}
import gleam/list
import gleam/option
import lustre/effect.{type Effect}
import sugiyama

pub type Msg {
  // We need to send a message to every process to build the process tree
  // However, we can't do that in the init function because then it's the
  // mist supervisor that will send a message to itself and wait for a reply forever.
  // To circumvent this, we have to ensure the forest building is ran in a worker
  // meaning in the update function, NOT in the init function.
  // We achieve this by having the init function run an empty side-effect
  // that only returns the TimerCheckForestUpdate message
  // then the update function (running in the worker) will run the
  // tree building process when handling that message
  ApplicationFinishedLoading
  // TimerCheckForestUpdate
  // CheckerReportedForestUpdate(Model)
  UserChangedAutoRefreshSetting(autorefresh.AutoRefreshMessage)
}

pub fn update(model: Model, msg: Msg) -> #(Model, Effect(Msg)) {
  case model {
    model.NotYetLoaded -> update_not_yet_loaded(msg)
    model.Model(graph:, loaded_applications:, auto_refresh:) ->
      update_model(graph, loaded_applications, auto_refresh, msg)
  }
}

fn update_model(
  graph: graph.Graph(
    String,
    #(process_tree.Process, Int, Int),
    #(option.Option(Nil), #(#(Int, Int), #(Int, Int))),
  ),
  loaded_applications: Dict(String, String),
  auto_refresh: autorefresh.AutoRefreshOption,
  msg: Msg,
) -> #(Model, Effect(Msg)) {
  case msg {
    UserChangedAutoRefreshSetting(auto_refresh_msg) -> {
      let new_auto_refresh_setting =
        autorefresh.update(auto_refresh, auto_refresh_msg)
      #(
        model.Model(graph, loaded_applications, new_auto_refresh_setting),
        effect.none(),
      )
    }
    _ -> #(model.Model(graph, loaded_applications, auto_refresh), effect.none())
  }
}

fn update_not_yet_loaded(msg: Msg) -> #(Model, Effect(Msg)) {
  case msg {
    ApplicationFinishedLoading -> {
      let #(graph, apps) = load_forest()
      #(model.Model(graph, apps, autorefresh.auto_refresh_on()), effect.none())
    }
    _ -> #(model.NotYetLoaded, effect.none())
  }
}

fn load_forest() -> #(
  graph.Graph(
    String,
    #(process_tree.Process, Int, Int),
    #(option.Option(Nil), #(#(Int, Int), #(Int, Int))),
  ),
  Dict(String, String),
) {
  let graph = process_tree.get_process_forest()
  let laid_out_graph = sugiyama.run(graph)
  let loaded_applications = process_tree.get_applications()
  #(laid_out_graph, loaded_applications)
}

@external(erlang, "timer", "sleep")
fn sleep_ms(ms: Int) -> Nil
