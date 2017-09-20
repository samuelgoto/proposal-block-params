function Square(props) {
    return button({className: "square", onClick: props.onClick}) {
        span(props.value)
    };
}

class Board extends React.Component {
    renderSquare(i) {
	let props = this.props;
	return Square({value: props.squares[i], onClick: () => props.onClick(i)}) {
	}
    }

    render() {
	let component = this;
	return div {
	    div({className: "board-row"}) {
		node(component.renderSquare(0));
		node(component.renderSquare(1));
		node(component.renderSquare(2));
	    }
	    div({className: "board-row"}) {
		node(component.renderSquare(3));
		node(component.renderSquare(4));
		node(component.renderSquare(5));
	    }
	    div({className: "board-row"}) {
		node(component.renderSquare(6));
		node(component.renderSquare(7));
		node(component.renderSquare(8));
	    }
	}
    }
}

class Game extends React.Component {
    constructor() {
	super();
	this.state = {
	    history: [
        {
	    squares: Array(9).fill(null)
        }
		      ],
	    stepNumber: 0,
	    xIsNext: true
	};
    }

    handleClick(i) {
	const history = this.state.history.slice(0, this.state.stepNumber + 1);
	const current = history[history.length - 1];
	const squares = current.squares.slice();
	if (calculateWinner(squares) || squares[i]) {
	    return;
	}
	squares[i] = this.state.xIsNext ? "X" : "O";
	this.setState({
		history: history.concat([
					 {
					     squares: squares
						 }
					 ]),
		    stepNumber: history.length,
		    xIsNext: !this.state.xIsNext
		    });
    }

    jumpTo(step) {
	this.setState({
		stepNumber: step,
		    xIsNext: (step % 2) === 0
		    });
    }

    render() {
	const history = this.state.history;
	const current = history[this.state.stepNumber];
	const winner = calculateWinner(current.squares);

	let component = this;

	const moves = history.map((step, move) => {
		const desc = move ? "Move #" + move : "Game start";
		return li({key: move}) {
		    a({href: "#", onClick: () => component.jumpTo(move)}) {
			span(desc)
		    }
		};
	    });

	let status;
	if (winner) {
	    status = "Winner: " + winner;
	} else {
	    status = "Next player: " + (this.state.xIsNext ? "X" : "O");
	}

	return div({className: "game"}) {
	    div({className: "game-board"}) {
		board({squares: current.squares, onClick: i => component.handleClick(i)}) {
		}
	    }
	    div({className: "game-info"}) {
		div {
		    span(status)
		}
		ol {
		    for (let move in moves) {
			// console.log(move);
			node(moves[move]);
		    }
		}
	    }
	}
    }
}

// ========================================

let game = Element.export(Game);
let board = Element.export(Board);

ReactDOM.render(div { game {} }, document.getElementById("root"));

function calculateWinner(squares) {
  const lines = [
		 [0, 1, 2],
		 [3, 4, 5],
		 [6, 7, 8],
		 [0, 3, 6],
		 [1, 4, 7],
		 [2, 5, 8],
		 [0, 4, 8],
		 [2, 4, 6]
		 ];
  for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
	  return squares[a];
      }
  }
  return null;
}
