<template>
  <div class="IndexPage-wrap simple-scrollbar" @scroll="scrollEvent">
    <HomeHeader />
    <NewsCardList />
    <a-back-top :target="backTopTarget" />
  </div>
</template>

<script>
import { mapMutations, mapState, mapActions } from 'vuex'
import HomeHeader from '@/components/home/HomeHeader.vue'
import NewsCardList from '@/components/home/NewsCardList.vue'
export default {
  name: 'IndexPage',
  components: { HomeHeader, NewsCardList },
  data() {
    return {
      mySelectLanguage: 'zh',
      loadingMoreNews: false,
    }
  },
  computed: {
    ...mapState(['newsNextToken', 'newsHasItems', 'activeCategory']),
    version() {
      return process.env.VERSION
    },
    languageOptions() {
      return [
        {
          label: 'English',
          value: 'en',
        },
        {
          label: '繁體中文',
          value: 'zh',
        },
      ]
    },
  },
  watch: {
    mySelectLanguage() {
      this.SET_INDEX({
        key: 'selectLanguage',
        val: this.mySelectLanguage,
      })
    },
  },
  created() {
    this.$i18n.setLocale(this.mySelectLanguage)
  },
  mounted() {
    this.setWindowWidth()
    window.addEventListener('resize', this.setWindowWidth)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.setWindowWidth)
  },
  methods: {
    ...mapMutations(['SET_INDEX']),
    ...mapActions(['getNews']),
    changeLanguage(value) {
      this.$i18n.setLocale(value)
    },
    setWindowWidth() {
      this.SET_INDEX({
        key: 'windowWidth',
        val: window.innerWidth,
      })
    },
    backTopTarget() {
      return document.querySelector('.IndexPage-wrap')
    },
    scrollEvent(e) {
      // 滑到最底，且不是正在拿資料，也還有新聞資料 => 去拿下一頁新聞資料
      if (
        e.srcElement.scrollTop + e.srcElement.offsetHeight >
          e.srcElement.scrollHeight - 50 &&
        !this.loadingMoreNews &&
        this.newsHasItems
      ) {
        this.loadMoreNews()
      }
    },
    // 拿取下一頁新聞資料
    async loadMoreNews() {
      this.loadingMoreNews = true
      // 拿取新聞資料
      const payload = {
        category: this.activeCategory,
        nextToken: this.newsNextToken,
      }
      const newsResult = await this.getNews(payload)
      this.loadingMoreNews = false
      // 若沒有拿成功，則跳出提示
      if (newsResult.status !== 'success') {
        this.$message.error(this.$t('home.getDataErrorMessage'))
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.IndexPage-wrap {
  width: 100%;
  height: 100vh;
  overflow: auto;
  position: relative;
  color: rgba(0, 0, 0, 0.87);
  background-color: $page-bg;
  font-family: 'Google Sans', sans-serif;
}
.versionText {
  margin-right: 15px;
}
</style>
