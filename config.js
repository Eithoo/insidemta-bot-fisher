const config = {
	activationKey: 'F7', // klawisz do włączania i wyłączania bota
	AFKpreventionKey: 'insert', // klawisz cyklicznie naciskany aby zapobiegać nadaniu statusu AFK. wcześniej była to spacja, ale przeszkadzała przy pisaniu na czacie w trakcie używania bota
	resolution: 'FHD' // wybrana rozdzielczosc - obecnie dostepna tylko FHD, jak ktos potrzebuje innej to wyslac mi nagranie 30 sekundowe w dobrej jakosci z łowienia i używania przynęty z ekwipunku na wybranej rodzielczosci, to wrzuce do kodu wymiary
}

module.exports = config;

/*

Spis możliwych klawiszy do wpisania w AFKpreventionKey: a-z, 0-9,
	backspace, delete, enter, tab, escape, left, right, up, down, home, end, pageup, pagedown, f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12, f13, f14, f15, f16, f17, f18, f19, f20, f21, f22, f23, f24, capslock, command, alt, right_alt, control, left_control, right_control, shift, right_shift, space, printscreen, insert, menu,
	audio_mute, audio_vol_down, audio_vol_up, audio_play, audio_stop, audio_pause, audio_prev, audio_next, audio_rewind, audio_rorward, audio_repeat, audio_random
	numpad_lock, numpad_0, numpad_1, numpad_2, numpad_3, numpad_4, numpad_5, numpad_6, numpad_7, numpad_8, numpad_9, numpad_+, numpad_-, numpad_*, numpad_/, numpad_.


Spis możliwych klawiszy do wpisania w activationKey: a-z, 0-9, 
	backspace, tab, enter, capslock, esc, pgup, pgdn, space, end, home, left, right, up, down, prtsc, insert, delete, cmd, F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F12

*/