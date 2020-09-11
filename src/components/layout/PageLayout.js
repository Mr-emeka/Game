import React from 'react';
import { withRouter } from 'react-router-dom';

import TopNav from '../../containers/navs/Topnav';
import Footer from '../../containers/navs/Footer';

const PageLayout = ({ children, history }) => {
    return (
        <div id="container">
            <TopNav history={history} />
            <main>
                <div className="container-fluid">{children}</div>
            </main>
            <Footer />
        </div>
    );
};

export default withRouter(PageLayout)
