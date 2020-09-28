import React from 'react';
import Square from '../Square/';

class Board extends React.Component {
    // Create the 3 x 3 board
    // createBoard(row, col) {
    //     const board = [];
    //     let cellCounter = 0;

    //     for (let i = 0; i < row; i += 1) {
    //         const columns = [];
    //         for (let j = 0; j < col; j += 1) {
    //             columns.push(this.renderSquare(cellCounter++));
    //         }
    //         board.push(<div key={i} className="board-row">{columns}</div>);
    //     }

    //     return board;
    // }

    // renderSquare(i) {
    //     return (
    //         <Square
    //             key={i}
    //             value={this.props.squares[i]}
    //             onClick={() => this.props.onClick(i)}
    //         />
    //     );
    // }

    render() {
        const style = {
            squares: {
                border: '2px solid white',
                borderRadius: '10px',
                width: '250px',
                height: '250px',
                margin: '2em auto',
                display: 'grid',
                gridTemplate: 'repeat(3, 1fr) / repeat(3, 1fr)'
            }
        };
        return <div style={style.squares}>
            {this.props.squares.map((square, i) => {
                return <Square key={i} value={this.props.squares[i]}
                    onClick={() => this.props.onClick(i)}

                />
            })}
            {/* {this.createBoard(3, 3)} */}
        </div>;
    }
}

export default Board;