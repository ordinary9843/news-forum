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
        style="height: 220px; width: 300px;"
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
  </a-modal>
</template>

<script>
import { mapState } from 'vuex'
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
    ...mapState([]),
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
          key: 'completelyImpartial',
          title: this.$t('home.completelyImpartial'),
          value: this.data.completelyImpartial,
        },
        {
          key: 'somewhatBiased',
          title: this.$t('home.somewhatBiased'),
          value: this.data.somewhatBiased,
        },
        {
          key: 'veryBiased',
          title: this.$t('home.veryBiased'),
          value: this.data.veryBiased,
        },
        {
          key: 'unableToJudge',
          title: this.$t('home.unableToJudge'),
          value: this.data.unableToJudge,
        },
      ]
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
</style>
