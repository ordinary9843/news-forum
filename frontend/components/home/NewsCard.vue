<template>
  <div class="NewsCard-wrap">
    <!-- 標題+按鈕 -->
    <a-row type="flex" align="middle" justify="start">
      <!-- 標題 -->
      <div class="newsTitle overflow-ellipsis">{{ data.title }}</div>
      <!-- 右側按鈕們 -->
      <a-row
        v-if="data.shareLink"
        class="myButtons"
        type="flex"
        align="middle"
        justify="center"
      >
        <a-space size="small">
          <a-button
            class="copyBtn"
            :data-clipboard-text="data.shareLink"
            type="primary"
            size="small"
            icon="link"
            @click="copyLink"
          >
            {{ $t('home.copyLink') }}
          </a-button>
          <a-button class="lineButton" size="small" @click="shareByLine">
            <line-icon />
            {{ $t('home.share') }}
          </a-button>
          <a-button class="fbButton" size="small" @click="shareByFb">
            <fb-icon />
            {{ $t('home.share') }}
          </a-button>
        </a-space>
      </a-row>
    </a-row>
    <!-- 副標題 -->
    <div class="newsSubtitle">{{ data.subtitle }}</div>
    <!-- 內容 -->
    <div class="newsDescription">{{ data.description }}</div>
    <!-- 對報導的看法 -->
    <a-row class="myButtons" type="flex" align="middle" justify="start">
      <div class="question">{{ $t('home.mediaReportingImpartiality') }}</div>
      <a-space size="small" class="answerButtons">
        <!-- 非常公正 -->
        <a-button
          v-if="!data.impartiality"
          size="small"
          icon="smile"
          @click="selectImpartiality('completelyImpartial')"
        >
          {{ $t('home.completelyImpartial') }}
        </a-button>
        <div v-else class="answerText">
          {{ data.impartiality.completelyImpartial || '--' }}%
          {{ $t('home.completelyImpartial') }}
        </div>
        <!-- 有點偏頗 -->
        <a-button
          v-if="!data.impartiality"
          size="small"
          icon="meh"
          @click="selectImpartiality('somewhatBiased')"
        >
          {{ $t('home.somewhatBiased') }}
        </a-button>
        <div v-else class="answerText">
          {{ data.impartiality.somewhatBiased || '--' }}%
          {{ $t('home.somewhatBiased') }}
        </div>
        <!-- 非常偏頗 -->
        <a-button
          v-if="!data.impartiality"
          size="small"
          icon="frown"
          @click="selectImpartiality('veryBiased')"
        >
          {{ $t('home.veryBiased') }}
        </a-button>
        <div v-else class="answerText">
          {{ data.impartiality.veryBiased || '--' }}%
          {{ $t('home.veryBiased') }}
        </div>
        <!-- 無法判斷 -->
        <a-button
          v-if="!data.impartiality"
          size="small"
          icon="close"
          @click="selectImpartiality('unableToJudge')"
        >
          {{ $t('home.unableToJudge') }}
        </a-button>
        <div v-else class="answerText">
          {{ data.impartiality.unableToJudge || '--' }}%
          {{ $t('home.unableToJudge') }}
        </div>
      </a-space>
    </a-row>
    <VoteResultDialog :visible.sync="voteResultDialog" :data="voteResultData" />
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import ClipboardJS from 'clipboard'
import LineIcon from '@/components/icon/LineIcon.vue'
import FbIcon from '@/components/icon/FbIcon.vue'
import VoteResultDialog from '@/components/home/VoteResultDialog.vue'
export default {
  name: 'NewsCard',
  components: { LineIcon, FbIcon, VoteResultDialog },
  props: {
    data: {
      type: Object,
      default: () => {
        return {}
      },
    },
    dataIndex: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      // 剪貼簿
      clipboard: null,
      voteResultDialog: false,
      voteResultData: {},
    }
  },
  computed: {
    ...mapState(['newsList']),
  },
  created() {},
  mounted() {
    // 初始化剪貼簿套件
    this.clipboard = new ClipboardJS('.copyBtn')
  },
  beforeDestroy() {
    this.clipboard.destroy()
    this.clipboard = null
  },
  methods: {
    ...mapActions(['updateNewsImpartiality']),
    copyLink() {
      // navigator.clipboard.writeText(this.data.shareLink)
      this.$message.success(this.$t('home.copySuccessfully'))
    },
    shareByLine() {
      window.open(
        `https://social-plugins.line.me/lineit/share?url=${this.data.shareLink}`,
        '_blank',
        'width=500,height=500'
      )
    },
    shareByFb() {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          this.data.shareLink
        )};src=sdkpreparse`,
        '_blank',
        'width=500,height=500'
      )
    },
    async selectImpartiality(value) {
      await this.updateNewsImpartiality({
        data: value,
        newsIndex: this.dataIndex,
      })
      this.voteResultData = this.newsList[this.dataIndex].impartiality || {}
      this.voteResultDialog = true
    },
  },
}
</script>
<style lang="scss" scoped>
.NewsCard-wrap {
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 24px;
  background-color: #ffffff;
}
.newsTitle {
  color: $black;
  font-size: 1.25rem;
  line-height: 1.4;
  margin-bottom: 6px;
}
.myButtons {
  margin-left: auto;
  margin-bottom: 6px;
}
.newsSubtitle {
  color: $gray-light;
  font-size: 0.85rem;
  line-height: 1.4;
  margin-bottom: 10px;
}
.newsDescription {
  font-size: 0.95rem;
  margin-bottom: 15px;
}
.lineButton {
  background-color: $line-green;
  color: #ffffff;
  &:hover {
    text-decoration: none;
    background-color: $line-green-light;
    border: 1px solid transparent;
  }
}
.fbButton {
  background-color: $fb-blue;
  color: #ffffff;
  &:hover {
    text-decoration: none;
    background-color: $fb-blue-light;
    border: 1px solid transparent;
  }
}
.question {
  margin-bottom: 8px;
}
.answerButtons {
  flex-wrap: wrap;
  margin-left: 15px;
  .ant-space-item {
    margin-bottom: 8px;
  }
}
.answerText {
  color: $fb-blue-light;
}
</style>
