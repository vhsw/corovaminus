<template>
  <div class="columns">
    <div class="column">
      <section>
        <b-notification
          title="Bad fittnes"
          type="is-danger"
          has-icon
          :active.sync="fittingResults.parameterError > fittingParams.errorTolerance"
          role="alert"
        >Algorithm failed to converge. Error level is {{fittingResults.parameterError.toFixed(2)}}</b-notification>
      </section>
      <section>
        <section class="hero">
          <div class="hero-body">
            <div class="container">
              <h3 class="title is-3">Total cases</h3>
            </div>
          </div>
        </section>
        <div class="container">
          <line-chart :chart-data="charts.cumulative"></line-chart>
        </div>
      </section>
      <section>
        <section class="hero">
          <div class="hero-body">
            <div class="container">
              <h3 class="title is-3">Total cases in log scale</h3>
            </div>
          </div>
        </section>
        <div class="container">
          <log-chart :chart-data="charts.cumulative"></log-chart>
        </div>
      </section>

      <section>
        <section class="hero">
          <div class="hero-body">
            <div class="container">
              <h3 class="title is-3">New cases per day</h3>
            </div>
          </div>
        </section>
        <div class="container">
          <line-chart :chart-data="charts.density"></line-chart>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import LineChart from "./LineChart";
import LogChart from "./LogChart";

import { formatDistanceToNow } from "date-fns";

export default {
  components: {
    LineChart,
    LogChart
  },
  props: ["charts", "fittingParams", "fittingResults"],
  filters: {
    formatDistanceToNow: value =>
      formatDistanceToNow(value, { addSuffix: true })
  }
};
</script>
