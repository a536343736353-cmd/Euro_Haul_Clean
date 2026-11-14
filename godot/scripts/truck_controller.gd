extends CharacterBody3D
class_name EuroHaulTruckController

@export var engine_acceleration := 8.0
@export var service_brake := 18.0
@export var max_forward_speed := 24.0
@export var max_reverse_speed := 6.0
@export var steering_rate := 1.25
@export var rolling_resistance := 1.4

var speed := 0.0
var steering_input := 0.0
var throttle_input := 0.0
var brake_input := 0.0

func _physics_process(delta: float) -> void:
	_read_inputs()
	var direction := sign(throttle_input)
	if abs(throttle_input) > 0.01:
		speed += direction * engine_acceleration * abs(throttle_input) * delta
	else:
		speed = move_toward(speed, 0.0, rolling_resistance * delta)
	if brake_input > 0.01:
		speed = move_toward(speed, 0.0, service_brake * brake_input * delta)
	speed = clampf(speed, -max_reverse_speed, max_forward_speed)
	var speed_factor := clampf(abs(speed) / max_forward_speed, 0.0, 1.0)
	rotate_y(-steering_input * steering_rate * speed_factor * delta)
	var forward := -global_transform.basis.z
	velocity.x = forward.x * speed
	velocity.z = forward.z * speed
	if not is_on_floor():
		velocity.y -= 24.0 * delta
	else:
		velocity.y = -0.2
	move_and_slide()

func _read_inputs() -> void:
	steering_input = Input.get_axis("steer_right", "steer_left")
	throttle_input = Input.get_axis("reverse", "accelerate")
	brake_input = Input.get_action_strength("brake")
