<template>
  <a-modal
    v-model="syncVisible"
    :title="$t('home.reportFeedbackTitle')"
    centered
  >
    <!-- footer -->
    <template slot="footer">
      <a-button key="back" @click="handleCancel">
        {{ $t('home.gotIt') }}
      </a-button>
    </template>
    <!-- 動畫圖片 -->
    <div>
      <lottie-vue-player
        v-if="showAnimation"
        class="reportAnimation"
        style="height: 220px; width: 300px"
        autoplay
        :loop="true"
        background="transparent"
        :speed="1"
        src="https://lottie.host/542c172b-52bb-4c32-b40e-ee4b8e24ceff/NjelyrGaaI.json"
      />
    </div>
    <!-- 報導評價百分比 -->
    <div class="reportFeedback">
      <a-row
        v-for="item in reportFeedbackList"
        :key="item.key"
        class="feedbackItem"
        type="flex"
        align="middle"
        justify="space-between"
      >
        <div>{{ item.title }}</div>
        <div>{{ item.value }} %</div>
      </a-row>
    </div>
    <div class="votedCount">
      {{ $t('home.votedCountText1') }} {{ totalVotedCount }}
      {{ $t('home.votedCountText2') }}
    </div>
  </a-modal>
</template>

<script>
export default {
  name: 'VoteResultDialog',
  components: {},
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data() {
    return {
      showAnimation: false,
    }
  },
  computed: {
    syncVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      },
    },
    reportFeedbackList() {
      return [
        {
          key: 'fair',
          title: this.$t('home.fair'),
          value: this.data.fair?.percent || 0,
        },
        {
          key: 'slightlyBiased',
          title: this.$t('home.slightlyBiased'),
          value: this.data.slightlyBiased?.percent || 0,
        },
        {
          key: 'heavilyBiased',
          title: this.$t('home.heavilyBiased'),
          value: this.data.heavilyBiased?.percent || 0,
        },
        {
          key: 'undetermined',
          title: this.$t('home.undetermined'),
          value: this.data.undetermined?.percent || 0,
        },
      ]
    },
    totalVotedCount() {
      return (
        this.data.fair?.count ||
        0 + this.data.slightlyBiased?.count ||
        0 + this.data.heavilyBiased?.count ||
        0 + this.data.undetermined?.count ||
        0
      )
    },
  },
  watch: {
    syncVisible() {
      if (this.syncVisible) {
        this.showAnimation = true
      } else {
        this.showAnimation = false
      }
    },
  },
  created() {},
  mounted() {},
  methods: {
    handleCancel() {
      this.syncVisible = false
    },
  },
}
</script>
<style lang="scss" scoped>
.reportAnimation {
  margin: auto;
  max-width: 300px;
}
.reportFeedback {
  max-width: 200px;
  margin: auto;
}
.feedbackItem {
  margin-bottom: 5px;
}
.votedCount {
  text-align: right;
  font-size: 0.8em;
  margin-top: 15px;
}
</style>
