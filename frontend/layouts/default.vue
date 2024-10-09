<template>
  <div>
    <Nuxt />
    <div v-if="isLoading" class="grayBg">
      <div class="loadingItem">
        <a-icon type="loading" class="loadingIcon" />
        <div class="loadingText">
          {{ loadingText }}
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
  name: 'DefaultLayout',
  data() {
    return {}
  },
  computed: {
    ...mapState(['isLoading', 'loadingText']),
  },
  created() {},
  methods: {},
}
</script>
<style lang="scss">
body {
  font-family: 'Noto Sans TC';
}
/* 單行多字 ... */
.overflow-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 兩行多字 ... */
.overflow-ellipsis-2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 三行多字 ... */
.overflow-ellipsis-3 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* 四行多字 ... */
.overflow-ellipsis-4 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
}

.simple-scrollbar {
  &::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
  &::-webkit-scrollbar-track {
    border-radius: 8px;
    background-color: #ffffff;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.25);
    border-radius: 8px;
  }
}
</style>
<style lang="scss" scoped>
.grayBg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100vh;
  z-index: 9;
  background-color: rgba(250, 250, 250, 0.8);
}
.loadingItem {
  text-align: center;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}
.loadingIcon {
  font-size: 40px;
}
.loadingText {
  margin-top: 15px;
  text-align: center;
  color: $gray;
}
</style>
