<template>
  <div class="HomeHeader-wrap">
    <a-row
      class="headerWith headerContent"
      type="flex"
      align="middle"
      justify="space-between"
    >
      <a-space size="small">
        <!-- logo -->
        <img class="logo" src="@/assets/img/logo.png" alt="" />
        <!-- 網頁標題 -->
        <div class="headerTitle">{{ $t('home.title') }}</div>
      </a-space>
      <!-- small view navigator -->
      <a-dropdown v-if="windowWidth < 750">
        <a-button icon="menu" />
        <a-menu slot="overlay">
          <a-menu-item
            v-for="item in categoryOptions"
            :key="item.value"
            :class="[activeCategory === item.value ? 'activeMenu' : '']"
            @click="changeActiveCategory(item.value)"
          >
            {{ item.label }}
          </a-menu-item>
        </a-menu>
      </a-dropdown>
    </a-row>
    <!-- bigger view navigator -->
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
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
export default {
  name: 'HomeHeader',
  data() {
    return {
      windowWidth: 0,
      activeCategory: '',
    }
  },
  computed: {
    ...mapState(['categoryOptions']),
  },
  async created() {
    await this.getCategories()
    if (this.categoryOptions.length > 0) {
      this.activeCategory = this.categoryOptions[0].value
      this.getNews({ type: this.categoryOptions[0].value })
    }
  },
  mounted() {
    this.setWindowWidth()
    window.addEventListener('resize', this.setWindowWidth)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.setWindowWidth)
  },
  methods: {
    ...mapActions(['getCategories', 'getNews']),
    changeActiveCategory(value) {
      this.activeCategory = value
      this.getNews({ type: value })
    },
    setWindowWidth() {
      this.windowWidth = window.innerWidth
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
.activeMenu {
  color: $blue;
  background-color: $blue-light;
}
</style>
