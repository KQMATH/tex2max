function read_next_tex_text(latex, position) {
	var position_end = latex.indexOf('\\', position);
	var text = '';
	if (position_end === -1) {
		position_end = latex.indexOf('}', position);
		if (position_end === -1) {
			text = latex.substring(position);
		} else {
			text = latex.substring(position, position_end);
		}

	} else {
		text = latex.substring(position, position_end);
	}
	// This is to replace the { } that follow f.ex ^
	// Example: 
	// 			LaTeX:	2\\cdotx^{y\\cdotx}
	// 		   Maxima:  2*x^(y*x)
	text = text.replace('{', '(').replace('}', ')');
	return {
		size: text.length,
		text: text
	};
}

function get_matching_closing(latex, position, start, end) {
	var end_position = -1;
	var nested = 0;
	for (var i = position; i < latex.length; i++) {
		if (latex.substring(i).startsWith(start)) {
			nested++;
		} else if (latex.substring(i).startsWith(end)) {
			if (nested > 0) {
				nested--;
			} else if (nested === 0) {
				end_position = i;
				break;
			}
		}
	}
	return end_position;
}

function read_tex_args(latex, position, max_args) {
	var args = {
		size: max_args,
		arg: []
	}
	var begin = -1;
	while (true) {

		begin = latex.indexOf('{', position);
		if (begin === -1) {
			break;
		}
		position = get_matching_closing(latex, begin + 1, '{', '}');

		var arg_tex = latex.substring(begin + 1, position);
		
		console.log('arg_tex (' + begin + ' => ' + position + ') "' + arg_tex + '"');

		var arg = tex2max(arg_tex);

		console.log(' == result: "' + arg + '"');

		args.arg.push(arg);
		args.size += position - begin;
		if (args.arg.length >= max_args) {
			break;
		}
	}
	return args;
}

function translate_tex_command_function(latex, position) {
	
	var result = {
		size: 0,
		text: ''
	};

	var commands_breaking = [
		'pm'
	];

	for (var i = position; i < latex.length; i++) {

		var inline = true;

		if (latex.charAt(i) === '\\') {

			var latex_sub = latex.substr(i + 1);

			for (var j = 0; j < commands_breaking.length; j++) {
				if (latex_sub.startsWith(commands_breaking[j])) {
					inline = false;
					break;
				}
			}

		} else {

			if (latex.charAt(i) === '+' || latex.charAt(i) === '-') {
				inline = false;
			}

		}

		if (!inline) {
			break;
		}
		result.size++;
	}
	
	result.text = latex.substring(position, position + result.size);
	result.text = tex2max(result.text);

	return result;
}

var translation_commands = {
	
	frac: function(latex, position) {
		var args = read_tex_args(latex, position, 2);
		return {
			text: '((' + args.arg[0] + ')/(' + args.arg[1] + '))',
			size: args.size + 4
		};
	},

	pm: function(latex, position) {
		return {
			text: '+-',
			size: 2
		};
	},

	cdot: function(latex, position) {
		return {
			text: '*',
			size: 4
		};
	},

	bullet: function(latex, position) {
		return {
			text: '*',
			size: 6
		};
	},

	delta: function(latex, position) {
		return {
			text: 'd',
			size: 5
		};
	},

	theta: function(latex, position) {
		return {
			text: 'theta',
			size: 5
		};
	},

	sqrt: function(latex, position) {
		var args = read_tex_args(latex, position, 1);
		return {
			text: 'sqrt(' + args.arg[0] + ')',
			size: args.size + 4
		};
	},

	sin: function(latex, position) {
		var arg = translate_tex_command_function(latex, position + 3);
		return {
			text: 'sin(' + arg.text + ')',
			size: arg.size + 3
		};
	},

	cos: function(latex, position) {
		var arg = translate_tex_command_function(latex, position + 3);
		return {
			text: 'cos(' + arg.text + ')',
			size: arg.size + 3
		};
	},

	text: function(latex, position) {
		var args = read_tex_args(latex, position, 1);
		return {
			text: args.arg[0],
			size: args.size + 4
		};
	},

	left: function(latex, position) {
		return {
			text: '(',
			size: 4
		};
	},

	right: function(latex, position) {
		return {
			text: ')',
			size: 5
		};
	},

	sum: function(latex, position) {
		var command = latex.substring(position);
		var args = command.substring(4);
		var expression = '';
		var i = 'i';
		var caret_index = args.indexOf('^');
		
		var lower = args.substring(0, caret_index);

		if (lower.charAt(0) === '{') {
			lower = lower.substring(1);
		}
		if (lower.charAt(lower.length - 1) === '}')  {
			lower = lower.substring(0, lower.length - 1);
		}

		var upper = '';
		var last_index = 0;
		if (args.charAt(caret_index + 1) === '{') {
			var closing_index = get_matching_closing(args, caret_index + 2, '{', '}');
			if (closing_index === -1) {
				closing_index = caret_index + 2;
			}
			upper = args.substring(caret_index + 1, closing_index);
			last_index = closing_index;
		} else {
			upper = args.charAt(caret_index + 1);
			last_index = caret_index + 1;
		}

		var enclosed = latex.substring(position - 6).startsWith('\\left');
		if (enclosed) {
			var expression_right = get_matching_closing(command, position, '\\left', '\\right');
			expression = command.substring(last_index + 5, expression_right);
			console.log('EXP[1]: ' + expression);
			last_index = expression_right - 1;
		} else {
			expression = command.substring(last_index + 5);
			console.log('EXP[2]: ' + expression);
			last_index += 6 + expression.length;
		}

		expression = tex2max(expression);

		return {
			text: 'sum(' + expression + ', ' + i + ', ' + lower + ', ' + upper + ')',
			size: last_index + 1
		};
	},

	lim: function(latex, position) {

		var command = latex.substring(position);
		var expression = '';
		var x = '';
		var value = '';
		var args = command.substring(4);
		var closing_index = 0;

		var to_index = args.indexOf('\\to');

		if (to_index !== -1) {
			if (command.charAt(4) === '{') {
				closing_index = get_matching_closing(command, 4 + 2, '{', '}');
				if (closing_index === -1) {
					closing_index = 4 + 2;
				}
				last_index = closing_index;
				x = args.substring(1, to_index);
				value = command.substring(to_index + 7, closing_index);
			} else {
				last_index = 4 + 1;
			}
		}

		var enclosed = latex.substring(position - 6).startsWith('\\left');
		if (enclosed) {
			var expression_right = get_matching_closing(command, closing_index + 2, '\\left', '\\right');
			expression = command.substring(closing_index + 1, expression_right);
			closing_index = expression_right - 1;
		} else {
			expression = command.substring(closing_index + 1);
			closing_index += expression.length;
		}
		
		expression = tex2max(expression);

		return {
			text: 'limit(' + expression + ', ' + x + ', ' + value + ')',
			size: closing_index + 1
		};
	},

};

function translate_command(latex, position) {
	var command = latex.substring(position);
	for (var i in translation_commands) {
		if (command.startsWith(i)) {
			return translation_commands[i](latex, position);
		}
	}
	return {
		text: '',
		size: 0
	};
}

function read_next_tex_command(latex, position) {
	position++; // Remove slash
	var result = translate_command(latex, position);
	result.size++; // Add slash to size
	return result;
}

function read_next_tex(latex, position) {
	var first = latex.charAt(position);
	if (first === '\\') {
		return read_next_tex_command(latex, position);
	}
	return read_next_tex_text(latex, position);
}

function tex2max(latex) {
	var result = '';
	var position = 0;
	while (latex.length > position) {
		var max = read_next_tex(latex, position);
		result += max.text;
		position += max.size;
		if (max.size < 1) {
			break;
		}
	}
	return result;
}