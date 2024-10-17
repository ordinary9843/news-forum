<template>
  <div class="NewsCardList-wrap">
    <!-- 新聞卡片 -->
    <template v-if="newsList.length > 0">
      <NewsCard
        v-for="(item, index) in newsList"
        :key="item.title + '_' + index"
        :data="item"
        :data-index="index"
      />
      <div style="text-align: center">
        <a-icon v-if="gettingNews" type="loading" />
        <div v-if="!newsHasItems">{{ $t('home.noMoreData') }}</div>
      </div>
    </template>
    <!-- loading 的假新聞卡片 -->
    <template v-else-if="gettingNews">
      <div v-for="item in 5" :key="item + '_fakeNewsCard'" class="fakeNewsCard">
        <a-skeleton active></a-skeleton>
      </div>
    </template>
    <!-- 沒有資料的圖片 -->
    <a-empty v-else class="emptyIcon" />
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
    ...mapState([
      'newsList',
      'categoryOptions',
      'activeCategory',
      'gettingNews',
      'newsHasItems',
    ]),
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
.fakeNewsCard {
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 24px;
  background-color: #ffffff;
}
.emptyIcon {
  margin-top: 50px;
}
</style>
