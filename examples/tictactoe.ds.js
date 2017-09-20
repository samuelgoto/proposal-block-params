function Square(props) {
    return button({className: "square", onClick: props.onClick}, function() {
        ("span" in this ? this.span.bind(this) : span.bind(this))(props.value);
    });
}

class Board extends React.Component {
    renderSquare(i) {
	let props = this.props;
	return Square({value: props.squares[i], onClick: () => props.onClick(i)}, function() {
	})
    }

    render() {
	let component = this;
	return div(function() {
	    ("div" in this ? this.div.bind(this) : div.bind(this))({className: "board-row"}, function() {
		("node" in this ? this.node.bind(this) : node.bind(this))(component.renderSquare(0));;
		("node" in this ? this.node.bind(this) : node.bind(this))(component.renderSquare(1));;
		("node" in this ? this.node.bind(this) : node.bind(this))(component.renderSquare(2));;
	    });
	    ("div" in this ? this.div.bind(this) : div.bind(this))({className: "board-row"}, function() {
		("node" in this ? this.node.bind(this) : node.bind(this))(component.renderSquare(3));;
		("node" in this ? this.node.bind(this) : node.bind(this))(component.renderSquare(4));;
		("node" in this ? this.node.bind(this) : node.bind(this))(component.renderSquare(5));;
	    });
	    ("div" in this ? this.div.bind(this) : div.bind(this))({className: "board-row"}, function() {
		("node" in this ? this.node.bind(this) : node.bind(this))(component.renderSquare(6));;
		("node" in this ? this.node.bind(this) : node.bind(this))(component.renderSquare(7));;
		("node" in this ? this.node.bind(this) : node.bind(this))(component.renderSquare(8));;
	    });
	})
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
		return li({key: move}, function() {
		    ("a" in this ? this.a.bind(this) : a.bind(this))({href: "#", onClick: () => component.jumpTo(move)}, function() {
			("span" in this ? this.span.bind(this) : span.bind(this))(desc);
		    });
		});
	    });

	let status;
	if (winner) {
	    status = "Winner: " + winner;
	} else {
	    status = "Next player: " + (this.state.xIsNext ? "X" : "O");
	}

	return div({className: "game"}, function() {
	    ("div" in this ? this.div.bind(this) : div.bind(this))({className: "game-board"}, function() {
		("board" in this ? this.board.bind(this) : board.bind(this))({squares: current.squares, onClick: i => component.handleClick(i)}, function() {
		});
	    });
	    ("div" in this ? this.div.bind(this) : div.bind(this))({className: "game-info"}, function() {
		("div" in this ? this.div.bind(this) : div.bind(this))(function() {
		    ("span" in this ? this.span.bind(this) : span.bind(this))(status);
		});
		("ol" in this ? this.ol.bind(this) : ol.bind(this))(function() {
		    for (let move in moves) {
			// console.log(move);
			("node" in this ? this.node.bind(this) : node.bind(this))(moves[move]);;
		    }
		});
	    });
	})
    }
}

// ========================================

let game = Element.export(Game);
let board = Element.export(Board);

ReactDOM.render(div(function() { ("game" in this ? this.game.bind(this) : game.bind(this))(function() {}); }), document.getElementById("root"));

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

