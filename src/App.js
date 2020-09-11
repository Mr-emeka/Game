import React, { Suspense } from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';
const Home = React.lazy(() =>
  import('./components/views/Home')
);

function App() {
  return (
    <Suspense fallback={<div className="loading" />}>
      <Router>
        <Switch>
          <Route
            path="/"
            exact
            render={(props) => <Home {...props} />}
          />
        </Switch>
      </Router>
    </Suspense>
  );
}

export default App;
