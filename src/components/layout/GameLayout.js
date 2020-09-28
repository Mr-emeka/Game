import React from 'react';
import { withRouter } from 'react-router-dom';

import Footer from '../../containers/navs/Footer';
import './layout.css';

const GameLayout = ({ children, history }) => {
    return (
        <div id="container" className="content-container">
            <main>
                <div className="container-fluid">{children}</div>
            </main>
            <Footer />
        </div>
    );
};

export default withRouter(GameLayout)
