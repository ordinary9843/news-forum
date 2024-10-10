<template>
  <div class="NewsCardList-wrap">
    <!-- 新聞卡片 -->
    <NewsCard
      v-for="(item, index) in newsList"
      :key="item.title + '_' + index"
      :data="item"
      :data-index="index"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import NewsCard from '@/components/home/NewsCard.vue'
export default {
  name: 'NewsCardList',
  components: { NewsCard },
  data() {
    return {}
  },
  computed: {
    ...mapState(['newsList', 'categoryOptions', 'activeCategory']),
  },
  watch: {
    categoryOptions() {
      setTimeout(() => {
        this.handleHeaderHeight()
      }, 0)
    },
  },
  created() {},
  mounted() {
    this.handleHeaderHeight()
  },
  methods: {
    handleHeaderHeight() {
      const headerHeight =
        document.querySelector('.HomeHeader-wrap').offsetHeight
      document.querySelector('.NewsCardList-wrap').style = `padding-top: ${
        headerHeight + 24
      }px`
    },
  },
}
</script>
<style lang="scss" scoped>
.NewsCardList-wrap {
  width: 100%;
  max-width: 1140px;
  margin: auto;
  padding: 0 24px 24px 24px;
}
</style>
