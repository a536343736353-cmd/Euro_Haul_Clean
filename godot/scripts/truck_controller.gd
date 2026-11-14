extends CharacterBody3D
class_name EuroHaulTruckController

signal speed_changed(speed_kph: float)
signal steering_changed(value: float)

@export_group("Powertrain")
@export var engine_acceleration := 7.0
@export var service_brake := 18.0
@export var max_forward_speed := 24.0
@export var max_reverse_speed := 6.0
@export var rolling_resistance := 1.4
@export var air_drag := 0.018

@export_group("Steering")
@export var steering_rate := 1.25
@export var steering_sensitivity := 1.0

@export_group("Vehicle")
@export var gravity := 24.0
@export var wheel_radius := 0.48

var speed := 0.0
var steering_input := 0.0
var throttle_input := 0.0
var brake_input := 0.0

@onready var wheel_nodes: Array[Node3D] = [
	$Visuals/Wheels/FrontLeft,
	$Visuals/Wheels/FrontRight,
	$Visuals/Wheels/RearLeft,
	$Visuals/Wheels/RearRight
]

func _physics_process(delta: float) -> void:
	_read_inputs()
	_update_powertrain(delta)
	_update_steering(delta)
	_update_wheel_visuals(delta)

	var forward := -global_transform.basis.z
	velocity.x = forward.x * speed
	velocity.z = forward.z * speed
	if not is_on_floor():
		velocity.y -= gravity * delta
	else:
		velocity.y = -0.2

	move_and_slide()
	speed_changed.emit(speed * 3.6)
	steering_changed.emit(steering_input)

func _read_inputs() -> void:
	steering_input = Input.get_axis("steer_right", "steer_left") * steering_sensitivity
	throttle_input = Input.get_axis("reverse", "accelerate")
	brake_input = Input.get_action_strength("brake")

func _update_powertrain(delta: float) -> void:
	if absf(throttle_input) > 0.01:
		var target_limit := max_forward_speed if throttle_input > 0.0 else max_reverse_speed
		speed += signf(throttle_input) * engine_acceleration * absf(throttle_input) * delta
		speed = clampf(speed, -max_reverse_speed, max_forward_speed)
		if absf(speed) > target_limit:
			speed = signf(speed) * target_limit
	else:
		speed = move_toward(speed, 0.0, rolling_resistance * delta)

	speed = move_toward(speed, 0.0, air_drag * speed * speed * delta)
	if brake_input > 0.01:
		speed = move_toward(speed, 0.0, service_brake * brake_input * delta)

func _update_steering(delta: float) -> void:
	var speed_factor := clampf(absf(speed) / max_forward_speed, 0.12, 1.0)
	rotate_y(-steering_input * steering_rate * speed_factor * delta)

func _update_wheel_visuals(delta: float) -> void:
	var wheel_turn := speed * delta / maxf(wheel_radius, 0.01)
	for wheel in wheel_nodes:
		wheel.rotate_object_local(Vector3.RIGHT, wheel_turn)
	$Visuals/Wheels/FrontLeft.rotation.y = steering_input * 0.35
	$Visuals/Wheels/FrontRight.rotation.y = steering_input * 0.35
