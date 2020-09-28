// Game.js
import React from 'react';
import Board from '../../custom/Board';
import Swal from "sweetalert2";

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            squares: Array(9).fill(''), // 3x3 board
            xScore: 0,
            oScore: 0,
            whosTurn: this.props.myTurn // Player X goes first
        };
        this.turn = 'X';
        this.gameOver = false;
        this.counter = 0; // Game ends in a tie when counter is 9
    }
    componentDidMount() {
        this.props.pubnub.getMessage(this.props.gameChannel, (msg) => {
            // Update other player's board
            if (msg.message.turn === this.props.piece) {
                this.publishMove(msg.message.index, msg.message.piece);
            }
            // Start a new round
            else if (msg.message.reset) {
                this.setState({
                    squares: Array(9).fill(''),
                    whosTurn: this.props.myTurn
                });

                this.turn = 'X';
                this.gameOver = false;
                this.counter = 0;
                Swal.close()
            }

            // End the game and go back to the lobby
            else if (msg.message.endGame) {
                Swal.close();
                this.props.endGame();
            }
        });
    }

    onMakeMove = (index) => {
        const squares = this.state.squares;
        // Check if the square is empty and if it's the player's turn to make a move
        if (!squares[index] && (this.turn === this.props.piece)) {
            squares[index] = this.props.piece;
            this.setState({
                squares: squares,
                whosTurn: !this.state.whosTurn
            });
            // Other player's turn to make a move
            this.turn = (this.turn === 'X') ? 'O' : 'X';
            // Publish move to the channel
            this.props.pubnub.publish({
                message: {
                    index: index,
                    piece: this.props.piece,
                    turn: this.turn
                },
                channel: this.props.gameChannel
            });
            // Check if there is a winner
            this.checkForWinner(squares)
        }
    }
    // Opponent's move is published to the board
    publishMove = (index, piece) => {
        const squares = this.state.squares;
        squares[index] = piece;
        this.turn = (squares[index] === 'X') ? 'O' : 'X';
        this.setState({
            squares: squares,
            whosTurn: !this.state.whosTurn
        });
        this.checkForWinner(squares)
    }
    checkForWinner = (squares) => {
        // Possible winning combinations
        const possibleCombinations = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        // Iterate every combination to see if there is a match
        for (let i = 0; i < possibleCombinations.length; i += 1) {
            const [a, b, c] = possibleCombinations[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                this.announceWinner(squares[a]);
                return;
            }
        }
        // Below the for loop in checkForWinner()
        // Check if the game ends in a draw
        this.counter++;
        // The board is filled up and there is no winner
        if (this.counter === 9) {
            this.gameOver = true;
            this.newRound(null);
        }
    }
    // Update score for the winner
    announceWinner = (winner) => {
        let pieces = {
            'X': this.state.xScore,
            'O': this.state.oScore
        }
        if (winner === 'X') {
            pieces['X'] += 1;
            this.setState({
                xScore: pieces['X']
            });
        }
        else {
            pieces['O'] += 1;
            this.setState({
                oScore: pieces['O']
            });
        }
        // End the game once there is a winner
        this.gameOver = true;
        this.newRound(winner);
    }
    newRound = (winner) => {
        console.log(winner)
        // Announce the winner or announce a tie game
        let title = (winner === null) ? 'Tie game!' : `Player ${winner} won!`;
        // Show this to Player O
        if ((this.props.isRoomCreator === false) && this.gameOver) {
            Swal.fire({
                position: 'top',
                allowOutsideClick: false,
                title: title,
                text: 'Waiting for a new round...',
                confirmButtonColor: 'rgb(208,33,41)',
                width: 275,
                customClass: {
                    heightAuto: false,
                    title: 'title-class',
                    popup: 'popup-class',
                    confirmButton: 'button-class',
                },
            });
            this.turn = 'X'; // Set turn to X so Player O can't make a move 
        }
        // Show this to Player X
        else if (this.props.isRoomCreator && this.gameOver) {
            Swal.fire({
                position: 'top',
                allowOutsideClick: false,
                title: title,
                text: 'Continue Playing?',
                showCancelButton: true,
                confirmButtonColor: 'rgb(208,33,41)',
                cancelButtonColor: '#aaa',
                cancelButtonText: 'Nope',
                confirmButtonText: 'Yea!',
                width: 275,
                customClass: {
                    heightAuto: false,
                    title: 'title-class',
                    popup: 'popup-class',
                    confirmButton: 'button-class',
                    cancelButton: 'button-class'
                },
            }).then((result) => {
                // Start a new round
                if (result.value) {
                    this.props.pubnub.publish({
                        message: {
                            reset: true
                        },
                        channel: this.props.gameChannel
                    });
                }
                else {
                    // End the game
                    this.props.pubnub.publish({
                        message: {
                            endGame: true
                        },
                        channel: this.props.gameChannel
                    });
                }
            })
        }
    }


    render() {
        let status;
        // Change to current player's turn
        status = `${this.state.whosTurn ? "Your turn" : "Opponent's turn"}`;
        return <div className="d-flex row p-4">
            <div className="col-lg-10 col-md-12">

                <Board
                    squares={this.state.squares}
                    onClick={index => this.onMakeMove(index)}
                />
                <h5 className="status-info text-white">{status}</h5>
            </div>

            <div className="col-lg-2 col-md-3 my-4 card">
                <div className="d-flex justify-content-between my-3">
                    <div>
                        <h4 className="text-danger">Player X:</h4>
                        <h4 className="text-danger">Player O:</h4>
                    </div>
                    <div>
                        <h4 className="text-danger"> {this.state.xScore}</h4>
                        <h4 className="text-danger">{this.state.oScore}</h4>
                    </div>
                </div>
            </div>
        </div>;
    }
}
export default Game;