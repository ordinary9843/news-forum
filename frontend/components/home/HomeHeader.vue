<template>
  <div class="HomeHeader-wrap">
    <a-row
      class="headerWith headerContent"
      type="flex"
      align="middle"
      justify="space-between"
    >
      <a-space size="small">
        <a-button
          v-if="windowWidth < 750"
          style="border: none"
          icon="menu"
          @click="openDrawerVisible"
        />
        <!-- logo -->
        <img class="logo" src="@/assets/img/logo.png" alt="" />
        <!-- 網頁標題 -->
        <div class="headerTitle">{{ $t('home.title') }}</div>
      </a-space>
    </a-row>
    <!-- big view navigator -->
    <a-row
      v-if="windowWidth >= 750"
      class="headerWith headerNavigator"
      type="flex"
      align="middle"
      justify="start"
    >
      <a-space size="small">
        <div
          v-for="(item, index) in categoryOptions"
          :key="item.value"
          :class="[
            index === 0 ? 'firstCategory' : '',
            activeCategory === item.value ? 'active' : '',
            'category',
          ]"
          @click="changeActiveCategory(item.value)"
        >
          {{ item.label }}
        </div>
      </a-space>
    </a-row>
    <!-- small view navigator -->
    <a-drawer
      :title="$t('home.categories')"
      placement="left"
      :closable="false"
      :visible="drawerVisible"
      @close="drawerOnClose"
    >
      <a-menu
        style="border: none"
        :default-selected-keys="[activeCategory]"
        :mode="'inline'"
      >
        <a-menu-item
          v-for="item in categoryOptions"
          :key="item.value"
          @click="changeActiveCategory(item.value)"
        >
          {{ item.label }}
        </a-menu-item>
      </a-menu>
    </a-drawer>
  </div>
</template>

<script>
import { mapActions, mapState, mapMutations } from 'vuex'
export default {
  name: 'HomeHeader',
  data() {
    return {
      drawerVisible: false,
    }
  },
  computed: {
    ...mapState(['categoryOptions', 'windowWidth', 'activeCategory']),
  },
  async created() {
    // 拿取類別資料
    await this.getCategories()
    if (this.categoryOptions.length > 0) {
      // 預設選取第一個類別
      this.SET_INDEX({
        key: 'activeCategory',
        val: this.categoryOptions[0].value,
      })
      // 拿取新聞資料
      const payload = {
        reset: true,
        category: this.categoryOptions[0].value,
      }
      const newsResult = await this.getNews(payload)
      // 若沒有拿成功，則跳出提示
      if (newsResult.status !== 'success') {
        this.$message.error(this.$t('home.getDataErrorMessage'))
      }
    }
  },
  mounted() {},
  methods: {
    ...mapActions(['getCategories', 'getNews']),
    ...mapMutations(['SET_INDEX']),
    async changeActiveCategory(value) {
      // 關閉 drawer
      this.drawerOnClose()
      // 設定 activeCategory
      this.SET_INDEX({
        key: 'activeCategory',
        val: value,
      })
      // 滾輪拉回最頂端
      document
        .querySelector('.IndexPage-wrap')
        .scrollTo({ top: 0, behavior: 'smooth' })
      // 把新聞清空
      this.SET_INDEX({
        key: 'newsList',
        val: [],
      })
      // 拿取新類別新聞資料
      const payload = {
        category: value,
      }
      const newsResult = await this.getNews(payload)
      // 若沒有拿成功，則跳出提示
      if (newsResult.status !== 'success') {
        this.$message.error(this.$t('home.getDataErrorMessage'))
      }
    },
    drawerOnClose() {
      this.drawerVisible = false
    },
    openDrawerVisible() {
      this.drawerVisible = true
    },
  },
}
</script>
<style lang="scss" scoped>
.HomeHeader-wrap {
  background-color: rgba(255, 255, 255, 1);
  position: fixed;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 100;
  padding: 15px 15px 0 15px;
  text-align: center;
  border-bottom: 1px solid rgb(218, 220, 224);
}
.headerWith {
  width: 100%;
  max-width: 1140px;
}
.headerContent {
  margin: 0 auto 15px auto;
}
.logo {
  height: 48px;
  width: auto;
}
.headerTitle {
  font-size: 22px;
  line-height: 24px;
  color: $gray-light-2;
}
.headerNavigator {
  margin: auto;
}
.category {
  line-height: 30px;
  margin: 4px 16px 0 16px;
  font-weight: 500;
  color: $gray-light-2;
  cursor: pointer;
  transition: color 0.3s ease;
  &:hover {
    color: #000000;
  }
  &.firstCategory {
    margin-left: 0;
  }
  &.active {
    color: rgb(26, 115, 232);
    &::after {
      position: relative;
      content: '';
      display: block;
      height: 4px;
      width: 100%;
      background: rgb(26, 115, 232);
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }
  }
}
</style>
