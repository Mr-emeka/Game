import React from 'react'
import robo from '../../../img/robo.png'

export default () => {
    return <footer style={{ position: "fixed", bottom: 0, fontSize: "1em", width: '100%', color: 'white' }}>
        <div className="d-flex justify-content-between align-items-end">
            <div>
                &copy; 2020 by Aimes
            </div>
            <div>
                <img src={robo} alt="robot_image" style={{ height: '100px' }} />
            </div>
        </div></footer>
}