extends Node3D

@onready var truck: CharacterBody3D = $Truck

func _ready() -> void:
	_create_default_input_actions()
	if truck:
		truck.add_to_group("player_truck")

func _create_default_input_actions() -> void:
	_add_key_action("accelerate", KEY_W)
	_add_key_action("reverse", KEY_S)
	_add_key_action("steer_left", KEY_A)
	_add_key_action("steer_right", KEY_D)
	_add_key_action("brake", KEY_SPACE)

func _add_key_action(action_name: String, keycode: Key) -> void:
	if not InputMap.has_action(action_name):
		InputMap.add_action(action_name)
	var event := InputEventKey.new()
	event.physical_keycode = keycode
	if not InputMap.action_has_event(action_name, event):
		InputMap.action_add_event(action_name, event)
