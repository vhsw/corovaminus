<template>
  <section class="hero">
    <div class="hero-body">
      <nav class="level">
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">New cases</p>
            <p class="title">
              <ICountUp delay="1000" :endVal="summary.newCases" :options="options" />
            </p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">Total cases</p>
            <p class="title">
              <ICountUp delay="1000" :endVal="summary.totalCases" :options="options" />
            </p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">Expected cases</p>
            <p class="title">
              <ICountUp delay="1000" :endVal="summary.expectedCases" :options="options" />
            </p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">Days to end</p>
            <p class="title">
              <ICountUp delay="1000" :endVal="summary.expectedDuration" :options="options" />
            </p>
          </div>
        </div>
      </nav>
    </div>
  </section>
</template>
<script>
import ICountUp from "vue-countup-v2";
export default {
  components: {
    ICountUp
  },
  name: "counters",
  props: ["summary"],
  data() {
    return {
      options: {
        useEasing: true,
        useGrouping: true,
        separator: ",",
        decimal: "."
      }
    };
  }
};
</script>
