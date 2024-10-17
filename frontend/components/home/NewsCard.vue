<template>
  <div class="NewsCard-wrap">
    <!-- 標題+按鈕 -->
    <a-row type="flex" align="middle" justify="start">
      <!-- 標題 -->
      <div class="newsTitle overflow-ellipsis-2" @click="openNews">
        {{ data.title }}
      </div>
      <!-- 右側按鈕們 -->
      <a-row
        v-if="data.link"
        class="myButtons"
        type="flex"
        align="middle"
        justify="center"
      >
        <!-- big view share buttons -->
        <a-space v-if="windowWidth >= 750" size="small">
          <a-button
            class="copyBtn"
            :data-clipboard-text="data.link"
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
    <!-- 副標題 + small view share buttons -->
    <a-row
      class="secondLine"
      type="flex"
      align="middle"
      justify="space-between"
    >
      <!-- 副標題 -->
      <div class="newsSubtitle overflow-ellipsis">
        {{ data.source }} {{ data.publishedAt }}
      </div>
      <!-- small view share buttons -->
      <a-dropdown
        v-if="windowWidth < 750 && data.link"
        :trigger="['click']"
        placement="bottomRight"
      >
        <a-icon class="shareIcon" type="share-alt" />
        <a-menu slot="overlay">
          <a-menu-item
            class="copyBtn"
            :data-clipboard-text="data.link"
            @click="copyLink"
          >
            <a-icon type="link" />
            {{ $t('home.copyLink') }}
          </a-menu-item>
          <a-menu-item @click="shareByLine">
            <line-icon class="lineIcon" />
            {{ $t('home.share') }}
          </a-menu-item>
          <a-menu-item @click="shareByFb">
            <fb-icon class="fbIcon" />
            {{ $t('home.share') }}
          </a-menu-item>
        </a-menu>
      </a-dropdown>
    </a-row>
    <!-- 內容 -->
    <div class="newsDescription">
      {{ data.brief }}
    </div>
    <div class="viewMoreLine">
      <a-button type="link" @click="viewMore">
        {{ $t('home.viewMore') }}
      </a-button>
    </div>
    <!-- 對報導的看法 -->
    <a-row class="myButtons" type="flex" align="middle" justify="start">
      <div class="question">{{ $t('home.mediaReportingImpartiality') }}</div>
      <a-space size="small" class="answerButtons">
        <!-- 非常公正 -->
        <a-button
          v-if="!data.isVoted"
          size="small"
          icon="smile"
          @click="vote('FAIR')"
        >
          {{ $t('home.fair') }}
        </a-button>
        <div
          v-else
          :class="[data.votedOption === 'FAIR' ? 'selected' : '', 'answerText']"
        >
          {{ data.voteStatistics.fair?.percent || 0 }}%
          {{ $t('home.fair') }}
        </div>
        <!-- 有點偏頗 -->
        <a-button
          v-if="!data.isVoted"
          size="small"
          icon="meh"
          @click="vote('SLIGHTLY_BIASED')"
        >
          {{ $t('home.slightlyBiased') }}
        </a-button>
        <div
          v-else
          :class="[
            data.votedOption === 'SLIGHTLY_BIASED' ? 'selected' : '',
            'answerText',
          ]"
        >
          {{ data.voteStatistics.slightlyBiased?.percent || 0 }}%
          {{ $t('home.slightlyBiased') }}
        </div>
        <!-- 非常偏頗 -->
        <a-button
          v-if="!data.isVoted"
          size="small"
          icon="frown"
          @click="vote('HEAVILY_BIASED')"
        >
          {{ $t('home.heavilyBiased') }}
        </a-button>
        <div
          v-else
          :class="[
            data.votedOption === 'HEAVILY_BIASED' ? 'selected' : '',
            'answerText',
          ]"
        >
          {{ data.voteStatistics.heavilyBiased?.percent || 0 }}%
          {{ $t('home.heavilyBiased') }}
        </div>
        <!-- 無法判斷 -->
        <a-button
          v-if="!data.isVoted"
          size="small"
          icon="close"
          @click="vote('UNDETERMINED')"
        >
          {{ $t('home.undetermined') }}
        </a-button>
        <div
          v-else
          :class="[
            data.votedOption === 'UNDETERMINED' ? 'selected' : '',
            'answerText',
          ]"
        >
          {{ data.voteStatistics.undetermined?.percent || 0 }}%
          {{ $t('home.undetermined') }}
        </div>
      </a-space>
    </a-row>
    <VoteResultDialog :visible.sync="voteResultDialog" :data="voteResultData" />
    <NewsContentDialog
      :visible.sync="newsContentDialog"
      :data="newsContentData"
    />
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import ClipboardJS from 'clipboard'
import LineIcon from '@/components/icon/LineIcon.vue'
import FbIcon from '@/components/icon/FbIcon.vue'
import VoteResultDialog from '@/components/home/VoteResultDialog.vue'
import NewsContentDialog from '@/components/home/NewsContentDialog.vue'
export default {
  name: 'NewsCard',
  components: { LineIcon, FbIcon, VoteResultDialog, NewsContentDialog },
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
      newsContentDialog: false,
    }
  },
  computed: {
    ...mapState(['newsList', 'windowWidth']),
    newsContentData() {
      const { link, title, description } = this.data
      return {
        link,
        title,
        description,
      }
    },
  },
  created() {},
  mounted() {
    this.$nextTick(() => {
      // 初始化剪貼簿套件
      this.clipboard = new ClipboardJS('.copyBtn')
      this.clipboard.on('success', function (e) {
        e.clearSelection()
      })
    })
  },
  beforeDestroy() {
    this.clipboard.destroy()
    this.clipboard = null
  },
  methods: {
    ...mapActions(['updateNewsVote']),
    openNews() {
      window.open(this.data.link)
    },
    copyLink() {
      this.$message.success(this.$t('home.copySuccessfully'))
    },
    shareByLine() {
      window.open(
        `https://social-plugins.line.me/lineit/share?url=${this.data.link}`,
        '_blank',
        'width=500,height=500'
      )
    },
    shareByFb() {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          this.data.link
        )};src=sdkpreparse`,
        '_blank',
        'width=500,height=500'
      )
    },
    async vote(value) {
      const result = await this.updateNewsVote({
        data: {
          bias: value,
        },
        newsIndex: this.dataIndex,
        newsId: this.data.id,
      })
      if (
        result.status !== 'success' &&
        result.message.includes('Too many requests')
      ) {
        this.$message.warning(this.$t('home.voteLimitExceededMessage'))
        return
      }
      if (result.status === 'success') {
        this.voteResultData = result.data || {}
      } else {
        this.voteResultData = this.newsList[this.dataIndex].voteStatistics || {}
      }
      this.voteResultDialog = true
    },
    viewMore() {
      this.newsContentDialog = true
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
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}
.myButtons {
  margin-left: auto;
  margin-bottom: 6px;
}
.newsSubtitle {
  color: $gray-light;
  font-size: 0.85rem;
  line-height: 1.4;
  max-width: calc(100% - 24px);
}
.secondLine {
  margin-bottom: 10px;
}
.newsDescription {
  font-size: 0.95rem;
  button > span:hover {
    text-decoration: underline;
  }
}
.viewMoreLine {
  text-align: right;
  margin-bottom: 15px;
}
.shareIcon {
  padding: 5px;
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
.lineIcon {
  color: $line-green;
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
.fbIcon {
  color: $fb-blue;
}
.question {
  margin-bottom: 8px;
  margin-right: 15px;
}
.answerButtons {
  flex-wrap: wrap;
  .ant-space-item {
    margin-bottom: 8px;
  }
}
.answerText {
  color: $fb-blue-light;
  &.selected {
    font-weight: bold;
    font-size: 1.2em;
  }
}
</style>
