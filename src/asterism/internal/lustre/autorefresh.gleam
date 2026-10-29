import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html
import lustre/event

const default_auto_refresh_timer = 2000

pub opaque type AutoRefreshOption {
  AutoRefreshOn(timer: Int)
  AutoRefreshOff
}

pub opaque type AutoRefreshMessage {
  UserClickedTurnOnAutoRefresh
  UserClickedTurnOffAutoRefresh
}

pub fn update(
  _auto_refresh: AutoRefreshOption,
  msg: AutoRefreshMessage,
) -> AutoRefreshOption {
  case msg {
    UserClickedTurnOnAutoRefresh -> {
      echo "auto refresh turned ON"
      AutoRefreshOn(default_auto_refresh_timer)
    }
    UserClickedTurnOffAutoRefresh -> {
      echo "auto refresh turned OFF"
      AutoRefreshOff
    }
  }
}

pub fn auto_refresh_with(timer: Int) {
  AutoRefreshOn(timer)
}

pub fn auto_refresh_on() {
  AutoRefreshOn(default_auto_refresh_timer)
}

pub fn auto_refresh_off() {
  AutoRefreshOff
}

pub fn get_turn_on_auto_refresh_message() -> AutoRefreshMessage {
  UserClickedTurnOnAutoRefresh
}

pub fn get_turn_off_auto_refresh_message() -> AutoRefreshMessage {
  UserClickedTurnOffAutoRefresh
}

pub fn view_get_auto_refresh_button(
  ar: AutoRefreshOption,
  msg_wrapper: fn(AutoRefreshMessage) -> msg,
) -> Element(msg) {
  case ar {
    AutoRefreshOn(timer:) -> {
      html.div(
        [
          attribute.class(""),
          event.on_click(msg_wrapper(UserClickedTurnOffAutoRefresh)),
        ],
        [html.text("Turn auto-refresh off")],
      )
    }
    AutoRefreshOff ->
      html.div(
        [
          attribute.class(""),
          event.on_click(msg_wrapper(UserClickedTurnOnAutoRefresh)),
        ],
        [html.text("Turn auto-refresh on")],
      )
  }
}
// type Compare {
//   Same
//   Different
// }
// fn check_for_auto_refresh(
//   previous_model: Model,
//   new_model: #(
//     graph.Graph(
//       String,
//       #(process_tree.Process, Int, Int),
//       #(option.Option(Nil), #(#(Int, Int), #(Int, Int))),
//     ),
//     Dict(String, String),
//   ),
// ) -> #(Model, Effect(Msg)) {
//   let #(new_graph, new_apps) = new_model
//   case previous_model {
//     model.Model(_, _, True) -> {
//       let new_model =
//         model.Model(
//           graph: new_graph,
//           loaded_applications: new_apps,
//           auto_refresh: True,
//         )
//       #(new_model, tick(new_model, refresh_timeout_ms))
//     }
//     _ -> #(
//       model.Model(
//         graph: new_graph,
//         loaded_applications: new_apps,
//         auto_refresh: False,
//       ),
//       effect.none(),
//     )
//   }
// }

// pub fn tick(
//   previous_model model: Model,
//   timeout_ms timeout: Int,
// ) -> effect.Effect(Msg) {
//   use dispatch <- effect.from
//   sleep_ms(timeout)
//   let #(new_graph, new_apps) = load_forest()
//   let new_forest =
//     model.Model(
//       graph: new_graph,
//       loaded_applications: new_apps,
//       auto_refresh: True,
//     )
//   case compare_models(model, new_forest) {
//     Same -> TimerCheckForestUpdate
//     Different -> CheckerReportedForestUpdate(new_forest)
//   }
//   |> dispatch
// }

// fn compare_models(model: Model, new_forest: Model) -> Compare {
//   let assert model.Model(new_graph, new_loaded_applications, _) = new_forest
//   case model {
//     model.Model(graph, loaded_applications, _) ->
//       case
//         lists_equal(
//           loaded_applications |> dict.to_list,
//           new_loaded_applications |> dict.to_list,
//         )
//       {
//         Same ->
//           case lists_equal(graph.get_nodes(graph), graph.get_nodes(new_graph)) {
//             Same ->
//               lists_equal(graph.get_edges(graph), graph.get_edges(new_graph))
//             Different -> Different
//           }
//         Different -> Different
//       }
//     model.NotYetLoaded -> Different
//   }
// }

// fn lists_equal(list1: List(a), list2: List(a)) -> Compare {
//   case list.all(list1, fn(item1) { list.contains(list2, item1) }) {
//     True -> Same
//     False -> Different
//   }
// }
