import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import Feed from '../gui/modules/feed/feed'
import Watchlist from '../gui/modules/watchlist/watchlist'
import { PATHS } from './path'
import Login from 'src/gui/modules/login/login'

const Router = () => (
  <Switch>
    <Redirect exact from='/' to={PATHS.FEED} />
    <Route path={PATHS.FEED}>
      <Feed />
    </Route>
    <Route path={PATHS.WATCHLIST}>
      <Watchlist />
    </Route>
    <Route path={PATHS.PROFILE}>
      <Login />
    </Route>
  </Switch>
)
export default Router