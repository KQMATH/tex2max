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

function get_matching_closing_parantheses(latex, position) {
	var end_position = -1;
	var nested = 0;
	for (var i = position; i < latex.length; i++) {
		if (latex.substring(i).startsWith('\\left')) {
			nested++;
		} else if (latex.substring(i).startsWith('\\right')) {
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

function get_matching_closing_bracket(latex, position) {
	var end_position = -1;
	var nested = 0;
	for (var i = position; i < latex.length; i++) {
		if (latex.charAt(i) === '{') {
			nested++;
		} else if (latex.charAt(i) === '}') {
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
		position = begin + 1;

		// TODO: use the function instead, but needs testing
		var nested = 0;
		for (var i = begin + 1; i < latex.length; i++) {
			if (latex.charAt(i) === '{') {
				nested++;
			} else if (latex.charAt(i) === '}') {
				if (nested > 0) {
					nested--;
				} else if (nested === 0) {
					position = i;
					break;
				}
			}
		}

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

function translate_tex_command_frac(numerator, denominator) {
	return '((' + numerator + ')/(' + denominator + '))';
}

function translate_tex_command_sqrt(content) {
	return 'sqrt(' + content + ')';
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

function read_next_tex_command(latex, position) {

	var size = 0;
	var result = '';

	var command = latex.substring(position);

	size++; // the slash

	if (command.startsWith('frac')) {
		var args = read_tex_args(latex, position, 2);
		result += translate_tex_command_frac(args.arg[0], args.arg[1]);
		size += 4 + args.size;
	}
	else if (command.startsWith('pm')) {
		result += '+-';
		size += 2;
	}
	else if (command.startsWith('sqrt')) {
		var args = read_tex_args(latex, position, 1);
		result += translate_tex_command_sqrt(args.arg[0]);
		size += 4 + args.size;
	}
	else if (command.startsWith('cdot')) {
		result += '*';
		size += 4;
	}
	else if (command.startsWith('bullet')) {
		result += '*';
		size += 6;
	}
	else if (command.startsWith('sin')) {
		var param = translate_tex_command_function(command, 3);
		result += 'sin(' + param.text + ')';
		size += 3 + param.size;
	}
	else if (command.startsWith('cos')) {
		var param = translate_tex_command_function(command, 3);
		result += 'cos(' + param.text + ')';
		size += 3 + param.size;
	}
	else if (command.startsWith('delta')) {
		result += 'd';
		size += 5;
	}
	else if (command.startsWith('theta')) {
		result += 'theta';
		size += 5;
	}
	else if (command.startsWith('text')) {
		var args = read_tex_args(latex, position, 1);
		result += args.arg[0];
		size += 4 + args.size;
	}
	else if (command.startsWith('left')) {
		result += '(';
		size += 4;
	}
	else if (command.startsWith('right')) {
		result += ')';
		size += 5;
	}
	else if (command.startsWith('sum')) {
		var args = command.substring(4);
		var carrot_index = args.indexOf('^');
		var lower = args.substring(0, carrot_index);
		if (lower.charAt(0) === '{') {
			lower = lower.substring(1);
		}
		if (lower.charAt(lower.length - 1) === '}')  {
			lower = lower.substring(0, lower.length - 1);		
		}
		var upper = '';
		var last_index = 0;
		if (args.charAt(carrot_index + 1) === '{') {
			var closing_index = get_matching_closing_bracket(args, carrot_index + 2);
			if (closing_index === -1) {
				closing_index = carrot_index + 2;
			}
			upper = args.substring(carrot_index + 1, closing_index);
			last_index = closing_index;
		} else {
			upper = args.charAt(carrot_index + 1);
			last_index = carrot_index + 1;
		}
		result += 'sum(i, i, ' + lower + ', ' + upper + ')';
		size += last_index + 5;
	}
	else if (command.startsWith('lim')) {
		// limit(exp, x, val, dir) <- dir doesn't work?
		// limit(3*x, x, 100)
		var expression = '';
		var x = '';
		var value = '';
		var args = command.substring(4);
		var to_index = args.indexOf('\\to');
		if (to_index !== -1) {
			if (command.charAt(4) === '{') {
				var closing_index = get_matching_closing_bracket(command, 4 + 2);
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

		var expression_left = closing_index + 1;
		if (command.substring(expression_left, expression_left + 5) === '\\left') {
			var expression_right = get_matching_closing_parantheses(command, expression_left + 1);
			expression = command.substr(expression_left, expression_right);
			expression = tex2max(expression);
			closing_index = expression_right + 5;
		}

		result += 'limit(' + expression + ', ' + x + ', ' + value + ')';

		size += 1 + closing_index;
	}


	else {
		console.log('[WARNING] Did not find command: ' + command);
	}

	return {
		size: size,
		text: result
	};
}

function read_next_tex(latex, position) {
	var first = latex.charAt(position);
	if (first === '\\') {
		return read_next_tex_command(latex, position + 1);
	}
	return read_next_tex_text(latex, position);
}

function tex2max(latex) {
	var result = '';
	var position = 0;
	var breaker = 0;
	while (latex.length > position) {
		breaker++;
		if (breaker > 10000) {
			console.log('[ERROR] Breaking out of infinite loop. ' + latex.length + ' > ' + position);
			break;
		}
		var max = read_next_tex(latex, position);
		result += max.text;
		position += max.size;
	}
	return result;
}