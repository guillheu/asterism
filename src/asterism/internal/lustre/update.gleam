import asterism/internal/lustre/model.{type Model}
import lustre/effect.{type Effect}

pub type Msg

pub fn update(model: Model, _message: Msg) -> #(Model, Effect(Msg)) {
  #(model, effect.none())
}
