# Vehicle physics

Target subsystem: mass and load effects, torque curve, gearbox ratios, wheel traction, braking/ABS, suspension, steering, tyre grip and damage. The live implementation currently resides in `overrides/src/main.js`; this folder is an organization boundary, not yet a separately imported physics module. Extract only with build and gameplay regression tests.