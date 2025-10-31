var config = {
    "long-press-threshold": 0.5,
    "fast-forward-speed": 3,
}
mp.options.read_options(config);

var pressTime = {};
/**
 * Add long press handler (complex option is required: { "complex": true })
 * @param {function(_event)} shortPress short press handler
 * @param {function(_event)} longPressDown long press down handler
 * @param {function(_event)} longPressRepeat long press repeat handler
 * @param {function(_event)} longPressUp long press up handler
 * @returns handler
 */
function getLongPressHandler(shortPress, longPressDown, longPressRepeat, longPressUp) {
    var _handler = function(event) {
        var duration = 0;
        if (pressTime[event.key_name]) {
            duration = new Date().getTime() - pressTime[event.key_name];
        }

        if (event.event === "down") {
            pressTime[event.key_name] = new Date().getTime();
            if (longPressDown !== null) {
                longPressDown(event);
            }
        }
        else if (event.event === "repeat") {
            if (duration >= config["long-press-threshold"] * 1000) {
                if (longPressRepeat !== null) {
                    longPressRepeat(event);
                }
            }
        }
        else if (event.event === "up") {
            if (duration >= config["long-press-threshold"] * 1000) {
                if (longPressUp !== null) {
                    longPressUp(event);
                }
            }
            else {
                if (shortPress !== null) {
                    shortPress(event);
                }
            }
        }
    }
    return _handler;
}

/**
 * get effiective key binding
 * @param {string} keyName key name
 * @returns key binding
 */
function getKeyBinding(keyName) {
    var bindings = mp.get_property_native("input-bindings");
    var result = undefined;
    bindings.forEach(function(item) {
        if (keyName.toLowerCase() == item.key.toLowerCase()) {
            if (result === undefined || item.priority >= result.priority) {
                result = item;
            }
        }
    });
    return result;
}


// enable forward when left is set to seek
var left = getKeyBinding("left");
if (left.cmd.match(/^seek/i)) {
    var leftSeek = parseInt(left.cmd.match(/[+-]?\d+$/));
    mp.add_key_binding("right", "forward", 
        getLongPressHandler(
            function (_) { mp.commandv("seek", -leftSeek); },
            null,
            function (_) { mp.set_property_native("speed", config["fast-forward-speed"]); },
            function (_) { mp.set_property_native("speed", 1); }
        ),
        { "complex": true }
    );
}
