import React from "react";

import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import Reservation from "../reservations/newReservation";
import useQuery from "../utils/useQuery";
import NewTable from "../tables/tables";
import SeatRes from "../tables/Seat";
import EditRes from "../reservations/editReservation";
import Search from "../dashboard/Search";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {
  const query = useQuery();
  const date = query.get("date");
  const mobile_number = query.get("mobile_number");
  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route path="/dashboard">
        <Dashboard date={date ? date : today()} />
      </Route>
      <Route path="/reservations/new">
        <Reservation />
      </Route>
      <Route path="/tables/new">
        <NewTable />
      </Route>
      <Route path="/reservations/:reservationId/seat">
        <SeatRes />
      </Route>
      <Route path="/reservations/:reservationId/edit">
        <EditRes />
      </Route>
      <Route path="/search">
        <Search mobile_number={mobile_number} />
      </Route>

      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
