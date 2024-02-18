import { Suspense, lazy } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { PATHS } from "./path";

const Feed = lazy(() => import("../gui/modules/feed/feed"));
const Watchlist = lazy(() => import("../gui/modules/watchlist/watchlist"));
const Playlists = lazy(() => import("../gui/modules/playlists/playlists"));
const Login = lazy(() => import("../gui/modules/login/login"));

const Router = () => (
  <Switch>
    <Redirect exact from="/" to={PATHS.PLAYLIST} />
    <Route path={PATHS.FEED}>
      <Suspense>
        <Feed />
      </Suspense>
    </Route>
    <Route path={PATHS.PLAYLIST}>
      <Suspense>
        <Watchlist />
      </Suspense>
    </Route>
    <Route path={PATHS.PLAYLISTS}>
      <Suspense>
        <Playlists />
      </Suspense>
    </Route>
    <Route path={PATHS.PARAMETERS}>
      <Suspense>
        <Login />
      </Suspense>
    </Route>
  </Switch>
);
export default Router;
