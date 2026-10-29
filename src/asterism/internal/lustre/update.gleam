import aonyx/graph
import asterism/internal/lustre/model.{type Model}
import asterism/internal/process_tree
import gleam/dict
import gleam/http/cookie
import gleam/list
import gleam/order
import lustre/effect.{type Effect}
import sugiyama

const refresh_timeout_ms = 1000

type Compare {
  Same
  Different
}

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
  TimerCheckForestUpdate
  CheckerReportedForestUpdate(Model)
}

pub fn update(previous_model: Model, msg: Msg) -> #(Model, Effect(Msg)) {
  case msg {
    ApplicationFinishedLoading -> {
      let new_model = load_forest()
      #(new_model, tick(new_model, refresh_timeout_ms))
    }
    TimerCheckForestUpdate -> #(
      previous_model,
      tick(previous_model, refresh_timeout_ms),
    )
    CheckerReportedForestUpdate(model) -> #(
      model,
      tick(previous_model, refresh_timeout_ms),
    )
  }
}

pub fn tick(
  previous_model model: Model,
  timeout_ms timeout: Int,
) -> effect.Effect(Msg) {
  use dispatch <- effect.from
  sleep_ms(timeout)
  let new_forest = load_forest()
  echo "checking for updates"
  case compare_models(model, new_forest) {
    Same -> TimerCheckForestUpdate
    Different -> {
      echo "Different models!"
      CheckerReportedForestUpdate(new_forest)
    }
  }
  |> dispatch
}

fn compare_models(model: Model, new_forest: Model) -> Compare {
  let assert model.Model(new_graph, new_loaded_applications) = new_forest
  case model {
    model.Model(graph, loaded_applications) ->
      case
        lists_equal(
          loaded_applications |> dict.to_list,
          new_loaded_applications |> dict.to_list,
        )
      {
        Same ->
          case lists_equal(graph.get_nodes(graph), graph.get_nodes(new_graph)) {
            Same ->
              lists_equal(graph.get_edges(graph), graph.get_edges(new_graph))
            Different -> Different
          }
        Different -> Different
      }
    model.NotYetLoaded -> Different
  }
}

fn lists_equal(list1: List(a), list2: List(a)) -> Compare {
  case list.all(list1, fn(item1) { list.contains(list2, item1) }) {
    True -> Same
    False -> Different
  }
}

fn load_forest() -> Model {
  let graph = process_tree.get_process_forest()
  let laid_out_graph = sugiyama.run(graph)
  let loaded_applications = process_tree.get_applications()
  model.Model(laid_out_graph, loaded_applications)
}

@external(erlang, "timer", "sleep")
fn sleep_ms(ms: Int) -> Nil
