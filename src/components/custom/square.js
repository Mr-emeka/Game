import React from 'react';
const style = {
    background: 'rgb(0 74 103)',
    border: '2px solid white',
    fontSize: '30px',
    fontWeight: '800',
    outline: 'none',
    color: 'yellow'
};

const Square = ({ value }, props) => (
    <button style={style} onClick={props.onClick} >
        {value}
    </button>
);

export default Square;