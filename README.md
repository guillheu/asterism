# Asterism

Asterism is an OTP graph visualizer, built from a desire to learn about the BEAM and OTP.

## How to use

# Standalone
You can use `gleam run` to quickly spin up a new BEAM node and play around with the Asterism visualizer.

# On an existing BEAM node
Add the module to you running BEAM node, then `application:ensure_all_started(asterism).`, then `spawn(fun asterism:main/0).`. This will start a new HTTP server on port 1234.
