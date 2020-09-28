import React, { Component } from 'react';
import PubNubReact from 'pubnub-react';
import PageLayout from '../../layout/PageLayout';
import GameLayout from '../../layout/GameLayout';
import Square from '../../custom/square'
import shortid from 'shortid';
import Game from '../Game'
import Swal from "sweetalert2";

const style = {
    squares: {
        border: '2px solid white',
        borderRadius: '10px',
        width: '250px',
        height: '250px',
        margin: '2em auto',
        display: 'grid',
        gridTemplate: 'repeat(3, 1fr) / repeat(3, 1fr)'
    },
    buttonSect: {
        margin: '2em auto 0',
        textAlign: 'center',
        display: 'grid',
        width: '250px',
    },
    btn: {
        padding: '10px',
        margin: '10px 0 ',
        fontSize: '1em',
        fontWeight: '800',
        background: 'rgb(0 74 103)',
        color: 'white',
        border: 'none',
        outline: 'none',
        cursor: 'pointer'
    },
    input: {
        padding: '5px 10px',
        fontSize: '1.5em',
        width: '100%',

    }
};
const squares = ['T', 'I', "C", "T", "A", "C", "T", "O", "E"]

class Home extends Component {
    constructor(props) {
        super(props);
        // REPLACE with your keys
        this.pubnub = new PubNubReact({
            publishKey: process.env.REACT_APP_publishkey,
            subscribeKey: process.env.REACT_APP_subscribekey
        });

        this.state = {
            piece: '', // X or O
            isPlaying: false, // Set to true when 2 players are in a channel
            isRoomCreator: false,
            isDisabled: false,
            myTurn: false,
        };
        this.lobbyChannel = null; // Lobby channel
        this.gameChannel = null; // Game channel
        this.roomId = null; // Unique id when player creates a room   
        this.pubnub.init(this); // Initialize PubNub
    }

    // Reset everything
    endGame = () => {
        this.setState({
            piece: '',
            isPlaying: false,
            isRoomCreator: false,
            isDisabled: false,
            myTurn: false,
        });
        this.lobbyChannel = null;
        this.gameChannel = null;
        this.roomId = null;
        this.pubnub.unsubscribe({
            channels: [this.lobbyChannel, this.gameChannel]
        });
    }
    componentDidUpdate() {
        // Check that the player is connected to a channel
        if (this.lobbyChannel != null) {
            this.pubnub.getMessage(this.lobbyChannel, (msg) => {
                // Start the game once an opponent joins the channel
                if (msg.message.notRoomCreator) {
                    // Create a different channel for the game
                    this.gameChannel = 'tictactoegame--' + this.roomId;
                    this.pubnub.subscribe({
                        channels: [this.gameChannel]
                    });
                    this.setState({
                        isPlaying: true
                    });
                    // Close the modals if they are opened
                    Swal.close()
                }
            });
        }
    }

    componentWillUnmount() {
        this.pubnub.unsubscribe({
            channels: [this.lobbyChannel, this.gameChannel]
        });
    }




    // Create a room channel
    onPressCreate = (e) => {
        // Create a random name for the channel
        this.roomId = shortid.generate().substring(0, 5);
        this.lobbyChannel = 'tictactoelobby--' + this.roomId; // Lobby channel name
        this.pubnub.subscribe({
            channels: [this.lobbyChannel],
            withPresence: true // Checks the number of people in the channel
        });
        // Inside of onPressCreate()
        // Modal
        Swal.fire({
            position: 'top',
            allowOutsideClick: false,
            title: 'Share this room ID with your friend',
            text: this.roomId,
            width: 275,
            padding: '0.7em',
            // Custom CSS to change the size of the modal
            customClass: {
                heightAuto: false,
                title: 'title-class',
                popup: 'popup-class',
                confirmButton: 'button-class'
            }
        })
        this.setState({
            piece: 'X',
            isRoomCreator: true,
            isDisabled: true, // Disable the 'Create' button
            myTurn: true, // Player X makes the 1st move
        });
    }

    // The 'Join' button was pressed
    onPressJoin = (e) => {
        Swal.fire({
            position: 'top',
            input: 'text',
            allowOutsideClick: false,
            inputPlaceholder: 'Enter the room id',
            showCancelButton: true,
            confirmButtonColor: 'rgb(208,33,41)',
            confirmButtonText: 'OK',
            width: 275,
            padding: '0.7em',
            customClass: {
                heightAuto: false,
                popup: 'popup-class',
                confirmButton: 'join-button-class',
                cancelButton: 'join-button-class'
            }
        }).then((result) => {
            // Check if the user typed a value in the input field
            if (result.value) {
                this.joinRoom(result.value);
            }
        })
    }


    // Join a room channel
    joinRoom = (value) => {
        this.roomId = value;
        this.lobbyChannel = 'tictactoelobby--' + this.roomId;
        // check
        this.pubnub.hereNow({
            channels: [this.lobbyChannel],
        }).then((response) => {
            if (response.totalOccupancy < 2) {
                this.pubnub.subscribe({
                    channels: [this.lobbyChannel],
                    withPresence: true
                });

                this.setState({
                    piece: 'O', // Player O
                });

                this.pubnub.publish({
                    message: {
                        notRoomCreator: true,
                    },
                    channel: this.lobbyChannel
                });
            }// Below the if statement in hereNow()
            else {
                // Game in progress
                Swal.fire({
                    position: 'top',
                    allowOutsideClick: false,
                    title: 'Error',
                    text: 'Game in progress. Try another room.',
                    width: 275,
                    padding: '0.7em',
                    customClass: {
                        heightAuto: false,
                        title: 'title-class',
                        popup: 'popup-class',
                        confirmButton: 'button-class'
                    }
                })
            }
        }).catch((error) => {
            console.log(error);
        });
    }

    render() {
        return (
            <div>
                {!this.state.isPlaying && <PageLayout>

                    <div className="dashboard-wrapper">
                        <div style={style.squares}>
                            {squares.map((square, i) => (
                                <Square key={i} value={square} />
                            ))}
                        </div>
                        <div style={style.buttonSect}>
                            <button style={style.btn}>Single Player</button>
                            <button style={style.btn} onClick={() => this.onPressCreate()}>Multiplayer Player</button>
                            <button style={style.btn} onClick={() => this.onPressJoin()}>Join</button>
                        </div>
                    </div>

                </PageLayout>}
                {this.state.isPlaying && <GameLayout>
                    <Game
                        pubnub={this.pubnub}
                        gameChannel={this.gameChannel}
                        piece={this.state.piece}
                        isRoomCreator={this.state.isRoomCreator}
                        myTurn={this.state.myTurn}
                        xUsername={this.state.xUsername}
                        oUsername={this.state.oUsername}
                        endGame={this.endGame}
                    />
                </GameLayout>
                }

            </div>

        );
    }
};

export default Home;
