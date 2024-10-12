<template>
  <div class="IndexPage-wrap">
    <HomeHeader />
    <NewsCardList />
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import HomeHeader from '@/components/home/HomeHeader.vue'
import NewsCardList from '@/components/home/NewsCardList.vue'
export default {
  name: 'IndexPage',
  components: { HomeHeader, NewsCardList },
  data() {
    return {
      mySelectLanguage: 'zh',
    }
  },
  computed: {
    ...mapState([]),
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
    changeLanguage(value) {
      this.$i18n.setLocale(value)
    },
    setWindowWidth() {
      this.SET_INDEX({
        key: 'windowWidth',
        val: window.innerWidth,
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.IndexPage-wrap {
  width: 100%;
  min-height: 100vh;
  height: auto;
  position: relative;
  color: rgba(0, 0, 0, 0.87);
  background-color: $page-bg;
  font-family: 'Google Sans', sans-serif;
}
.versionText {
  margin-right: 15px;
}
</style>
