<template>
  <section>
    <b-loading :is-full-page="true" :active.sync="isLoading" :can-cancel="true"></b-loading>
    <section class="hero">
      <div class="hero-body">
        <div class="container">
          <h1 class="title main">
            <strong>COVID-19 spread in Russia</strong>
          </h1>
        </div>
      </div>
      <counters :summary="summary" />
    </section>
    <div id="app" class="container">
      <div class="columns">
        <div class="column">
          <Menu
            class="sticky"
            v-bind:fittingParams="fittingParams"
            @change="fittingParams = $event"
          />
        </div>
        <div class="column is-half padded">
          <Chart
            v-bind:charts="charts"
            v-bind:fittingParams="fittingParams"
            v-bind:fittingResults="fittingResults"
          />
        </div>
        <div class="column">
          <Table v-bind:dates="dates" v-bind:infected="infected" @submit="statistics.push($event)" />
        </div>
      </div>
    </div>
    <footer class="footer">
      <div class="content">
        <p>
          <a href="https://bulma.io">
            <img
              src="https://bulma.io/images/made-with-bulma.png"
              alt="Made with Bulma"
              width="128"
              height="24"
            />
          </a>
        </p>
      </div>
    </footer>
  </section>
</template>

<script>
import Vue from "vue";
import Buefy from "buefy";
import axios from "axios";
import { addDays } from "date-fns";
import "buefy/dist/buefy.css";
import "@mdi/font/css/materialdesignicons.css";

import Menu from "./components/Menu";
import Chart from "./components/Chart.vue";
import Table from "./components/Table.vue";
import Counters from "./components/Counters.vue";
import fit from "./components/fit";
import erf from "./components/erf";
import gaussian from "./components/gaussian";

Vue.use(Buefy);

export default {
  name: "App",
  components: {
    Chart,
    Menu,
    Table,
    Counters
  },
  data() {
    return {
      statistics: [],
      fittingParams: {
        initialValues: [10000, new Date("2020-04-30").getTime(), 15],
        minValues: [1000, new Date("2020-03-06").getTime(), 5],
        maxValues: [140000000, new Date("2020-12-31").getTime(), 100],
        damping: 1e-6,
        gradientDifference: 5,
        maxIterations: 100,
        errorTolerance: 200
      },
      newEntry: {},
      isLoading: true
    };
  },
  mounted() {
    let url = "data.json";
    axios
      .get(url)
      .then(response => (this.statistics = response.data))
      .finally(() => (this.isLoading = false));
  },
  computed: {
    dates() {
      return this.statistics.map(it => new Date(it.date));
    },

    infected() {
      return this.statistics.map(it => it.infected);
    },
    infectedPerDay() {
      let cumulative = [0].concat(this.infected);

      let perDay = [];
      for (let i = 1; i < cumulative.length; i++) {
        perDay.push(cumulative[i] - cumulative[i - 1]);
      }
      return perDay;
    },

    fittingResults() {
      try {
        return fit(this.dates, this.infected, erf, this.fittingParams);
      } catch {
        return {
          parameterValues: [0, 0, 0],
          parameterError: 0,
          iterations: -1
        };
      }
    },
    fittingResultsNorm() {
      try {
        return fit(
          this.dates,
          this.infectedPerDay,
          gaussian,
          this.fittingParams
        );
      } catch {
        return {
          parameterValues: [0, 0, 0],
          parameterError: 0,
          iterations: -1
        };
      }
    },
    summary() {
      try {
        let last = this.infected[this.infected.length - 1];
        let prev = this.infected[this.infected.length - 2];
        return {
          newCases: (last - prev).toFixed(0),
          totalCases: last.toFixed(0),
          expectedCases: this.fittingResults.parameterValues[0].toFixed(0),
          expectedDuration: (
            this.fittingResults.parameterValues[2] * 4
          ).toFixed(0)
        };
      } catch {
        return {
          newCases: 0,
          totalCases: 0,
          expectedCases: 0,
          expectedDuration: 0
        };
      }
    },
    charts() {
      let startDate = Math.min(...this.dates);
      let offset = new Date(this.fittingResults.parameterValues[1]);
      let sigma = this.fittingResults.parameterValues[2];
      let endDate = addDays(offset, sigma * 3);
      let range = this.dateRange(startDate, endDate);
      let colors = {
        red: "rgb(255, 99, 132)",
        orange: "rgb(255, 159, 64)",
        yellow: "rgb(255, 205, 86)",
        green: "rgb(75, 192, 192)",
        blue: "rgb(54, 162, 235)",
        purple: "rgb(153, 102, 255)",
        grey: "rgb(201, 203, 207)"
      };
      return {
        cumulative: {
          datasets: [
            {
              label: "Data",
              backgroundColor: colors.blue,
              borderColor: colors.blue,
              data: this.dates.map((date, i) => ({
                x: date,
                y: this.infected[i]
              })),
              fill: false,
              showLine: false
            },
            {
              label: "Predicted",
              backgroundColor: colors.red,
              borderColor: colors.red,
              data: range.map(x => ({
                x,
                y: erf(this.fittingResults.parameterValues)(x)
              })),
              // fill: false,
              pointRadius: false,
              showLine: true
            }
          ]
        },
        density: {
          datasets: [
            {
              label: "Data",
              backgroundColor: colors.blue,
              borderColor: colors.blue,
              data: this.dates.map((date, i) => ({
                x: date,
                y: this.infectedPerDay[i]
              })),
              fill: false,
              showLine: false
            },
            {
              label: "gaussian",
              backgroundColor: colors.red,
              borderColor: colors.red,
              data: range.map(x => ({
                x,
                y: gaussian(this.fittingResultsNorm.parameterValues)(x)
              })),
              // fill: false,
              pointRadius: false,
              showLine: true
            }
          ]
        }
      };
    }
  },
  methods: {
    handle(event) {
      console.log(event);
    },
    dateRange(start, end) {
      let date = start;
      let range = [];
      while (date <= end) {
        range.push(date);
        date = addDays(date, 1);
      }
      return range;
    },
    getStatistics(url) {
      fetch(url)
        .then(response => {
          return response.json();
        })
        .then(data => {
          console.log(data);
        });
    }
  }
};
</script>

<style>
.title.main {
  font-size: 3rem;
  font-weight: 900;
  text-align: center;
}
.sticky {
  position: sticky;
  top: 30px;
}
.padded {
  padding-bottom: 100px;
}
.emoji {
  font-weight: 400;
  font-family: apple color emoji, segoe ui emoji, noto color emoji,
    android emoji, emojisymbols, emojione mozilla;
}
</style>
