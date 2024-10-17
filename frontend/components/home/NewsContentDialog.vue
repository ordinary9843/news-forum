<template>
  <a-modal v-model="syncVisible" :title="data.title" centered :closable="false">
    <!-- footer -->
    <template slot="footer">
      <a-button key="cancel" @click="handleCancel">
        {{ $t('home.cancel') }}
      </a-button>
      <a-button key="learnMore" @click="learnMore">
        {{ $t('home.learnMore') }}
      </a-button>
    </template>
    <!-- 報導內容 -->
    <div class="newsDescription simple-scrollbar">
      {{ data.description || '' }}
    </div>
  </a-modal>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'NewsContentDialog',
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
    return {}
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
  },
  watch: {},
  created() {},
  mounted() {},
  methods: {
    handleCancel() {
      this.syncVisible = false
    },
    learnMore() {
      window.open(this.data.link)
    },
  },
}
</script>
<style lang="scss" scoped>
.newsDescription {
  max-height: 60vh;
  overflow: auto;
}
@media (max-width: 600px) {
  .newsDescription {
    max-height: 50vh;
  }
}
</style>
