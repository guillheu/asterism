import asterism/internal/lustre/model.{type Model}
import asterism/internal/process_tree
import lustre/effect.{type Effect}
import sugiyama

pub type Msg {
  // We need to send a message to every process to build the process tree
  // However, we can't do that in the init function because then it's the
  // mist supervisor that will send a message to itself and wait for a reply forever.
  // To circumvent this, we have to ensure the forest building is ran in a worker
  // meaning in the update function, NOT in the init function.
  // We achieve this by having the init function run an empty side-effect
  // that only returns the ConnectionFinishedInitializing message
  // then the update function (running in the worker) will run the
  // tree building process when handling that message
  ConnectionFinishedInitializing
}

pub fn update(_model: Model, msg: Msg) -> #(Model, Effect(Msg)) {
  case msg {
    ConnectionFinishedInitializing -> #(load_forest(), effect.none())
  }
}

fn load_forest() -> Model {
  let graph = process_tree.get_process_forest()
  let laid_out_graph = sugiyama.run(graph)
  let loaded_applications = process_tree.get_applications()
  model.Model(laid_out_graph, loaded_applications)
}
